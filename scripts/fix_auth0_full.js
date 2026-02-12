
const https = require('https');

// --- CONFIGURATION ---
const DOMAIN = 'dev-3u2pz1qta376worq.us.auth0.com';
const CLIENT_ID = 'UFqEBnMZvZpCLf602Jx8653tPYJtBCBg'; // Premezclados API (M2M)
const CLIENT_SECRET = '_kc_wLRZRM_8pEDYNmU4ARbdhlWxbtb53fTkfo8QpMpaukiU2qeivSJADn5RhNO5'; // Premezclados API (M2M)

// The exact script code for the Action
const ACTION_CODE = `exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://premezcladomanzanillo.com';
  if (event.authorization) {
    api.idToken.setCustomClaim(\`\${namespace}/roles\`, event.authorization.roles);
    api.accessToken.setCustomClaim(\`\${namespace}/roles\`, event.authorization.roles);
  }
};`;

// --- HELPERS ---
async function request(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: DOMAIN,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) {
                    console.error(`❌ API Error (${method} ${path}): ${res.statusCode}`);
                    console.error('   Response:', body);
                    try {
                        const err = JSON.parse(body);
                        reject(new Error(err.message || err.error_description || 'Unknown API Error'));
                    } catch (e) {
                        reject(new Error(body));
                    }
                } else {
                    try {
                        resolve(body ? JSON.parse(body) : {});
                    } catch (e) {
                        resolve(body);
                    }
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// --- MAIN FLOW ---
async function main() {
    console.log('🚀 Starting Auth0 Auto-Fix Script...');

    try {
        // 1. Get Management Token
        console.log('\n🔐 Authenticating with Management API...');
        const tokenData = await request('POST', '/oauth/token', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            audience: `https://${DOMAIN}/api/v2/`,
            grant_type: "client_credentials"
        });
        const accessToken = tokenData.access_token;
        console.log('✅ Access Token obtained.');

        // 2. Check/Create Role "Administrador"
        console.log('\n👤 Checking Roles...');
        const roles = await request('GET', '/api/v2/roles?name_filter=Administrador', null, accessToken);
        let adminRoleId;
        if (roles.length === 0) {
            console.log('   Role "Administrador" not found. Creating it...');
            const newRole = await request('POST', '/api/v2/roles', { name: "Administrador", description: "Full Admin Access" }, accessToken);
            adminRoleId = newRole.id;
            console.log('   ✅ Role Created.');
        } else {
            console.log('   ✅ Role "Administrador" exists.');
            adminRoleId = roles[0].id;
        }

        // 3. Assign Role to User (Find the first user if we don't know the exact ID, or list all)
        console.log('\n🔎 Finding Users...');
        const users = await request('GET', '/api/v2/users', null, accessToken); // Get all users
        if (users.length > 0) {
            console.log(`   Found ${users.length} users. Assigning "Administrador" role to ALL of them for safety:`);
            for (const user of users) {
                console.log(`   - Processing user: ${user.email || user.name} (${user.user_id})`);
                await request('POST', `/api/v2/roles/${adminRoleId}/users`, { users: [user.user_id] }, accessToken);
                console.log(`     ✅ Role assigned to ${user.email || user.name}`);
            }
        } else {
            console.log('   ⚠️ No users found. Please sign up in the app first!');
        }

        // 4. Create/Update Action
        console.log('\n⚡ Checking Actions...');
        const actions = await request('GET', '/api/v2/actions/actions', null, accessToken);
        let actionId;
        const targetActionName = 'Add Roles to Token Auto';
        const existingAction = actions.actions.find(a => a.name === targetActionName || a.name === 'Agregar Roles' || a.name === 'Add Roles to Token');

        if (existingAction) {
            console.log(`   Found existing action: "${existingAction.name}". Updating code...`);
            actionId = existingAction.id;
            await request('PUT', `/api/v2/actions/actions/${actionId}`, {
                code: ACTION_CODE,
                runtime: 'node18',
                dependencies: [],
                secrets: []
            }, accessToken);
            console.log('   ✅ Action Code Updated.');
        } else {
            console.log('   Creating new Action...');
            const newAction = await request('POST', '/api/v2/actions/actions', {
                name: targetActionName,
                supported_triggers: [{ id: "post-login", version: "v3" }],
                code: ACTION_CODE,
                runtime: 'node18'
            }, accessToken);
            actionId = newAction.id;
            console.log('   ✅ Action Created.');
        }

        // 5. Deploy Action
        console.log('   Deploying Action...');
        await request('POST', `/api/v2/actions/actions/${actionId}/deploy`, null, accessToken);
        console.log('   ✅ Action Deployed.');

        // 6. Bind Action to Trigger (The "Flow" part)
        console.log('\n🔗 Binding Action to Login Flow...');
        // First get current bindings
        const bindings = await request('GET', '/api/v2/actions/triggers/post-login/bindings', null, accessToken);
        const isAlreadyBound = bindings.bindings.some(b => b.action.id === actionId);

        if (isAlreadyBound) {
            console.log('   ✅ Action is already active in the Login Flow.');
        } else {
            // Append our action to the existing bindings, ensuring no duplicates and valid structure
            const newBindingList = bindings.bindings.map(b => ({ ref: { type: "action_name", value: b.action.name } }));
            newBindingList.push({ ref: { type: "action_id", value: actionId } });

            const newBindings = {
                bindings: newBindingList
            };

            await request('PATCH', '/api/v2/actions/triggers/post-login/bindings', newBindings, accessToken);
            console.log('   ✅ Action successfully added to Login Flow!');
        }

        console.log('\n✨ SUCCESS! Auth0 is now fully configured. Please Log Out and Log In again on your website.');

    } catch (error) {
        console.error('\n❌ SCRIPT FAILED:', error.message);
        if (error.message.includes('403') || error.message.includes('QtTf2..') || error.message.includes('insufficient_scope')) {
            console.log('\n⚠️  PERMISSION ERROR DETECTED:');
            console.log('   The "Premezclados API" (M2M app) works, BUT it lacks specific permissions for the Management API.');
            console.log('   PLEASE DO THIS:');
            console.log('   1. Go to Auth0 Dashboard > Applications > APIs > Auth0 Management API');
            console.log('   2. Click "Machine to Machine Applications" tab.');
            console.log('   3. Find "Premezclados API" (Test Application) and expand the arrow.');
            console.log('   4. CHECK ALL BOXES (or at least: read:users, update:users, read:roles, create:roles, read:actions, update:actions, create:actions, update:triggers).');
            console.log('   5. Click SAVE/UPDATE.');
            console.log('   6. Run this command again: node scripts/fix_auth0_full.js');
        }
    }
}

main();
