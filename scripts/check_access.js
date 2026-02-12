
const https = require('https');

const DOMAIN = 'dev-3u2pz1qta376worq.us.auth0.com';
const CLIENT_ID = '94LJjimeU85kynsYU2UGK8lnuJuHJaxu';
const CLIENT_SECRET = 'pt82Z4jYudSOufWWDBm-tPIHLbbQJOZWJhUx-kdVrfXRIkNlk6qH1GhMYid3XYiH';

async function checkAccess() {
    console.log('🔍 Checking Auth0 Management API Access...');

    const options = {
        hostname: DOMAIN,
        path: '/oauth/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('✅ GREAT SUCCESS! Connection established.');
                console.log('   I can now configure your Auth0 account automatically.');
            } else {
                console.log(`❌ STILL FAILING (${res.statusCode})`);
                console.log('   Response:', body);
                console.log('\n⚠️  ACTION REQUIRED:');
                console.log('   Go to Auth0 Dashboard > Applications > "Proye..." (Your App) > Advanced Settings > Grant Types');
                console.log('   Make sure "Client Credentials" is CHECKED and click SAVE at the bottom.');
            }
        });
    });

    req.write(JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        audience: `https://${DOMAIN}/api/v2/`,
        grant_type: "client_credentials"
    }));
    req.end();
}

checkAccess();
