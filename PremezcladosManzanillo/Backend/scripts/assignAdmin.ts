
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.AUTH0_M2M_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_M2M_CLIENT_SECRET;

// El correo del usuario que quiere ser Admin (lo saqué de tu .env)
const TARGET_EMAIL = 'orlandojvelasquezt14@gmail.com';

async function getManagementToken() {
    const response = await fetch(`https://${DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            audience: `https://${DOMAIN}/api/v2/`,
            grant_type: 'client_credentials',
        }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || 'Error obteniendo token');
    return data.access_token;
}

async function assignAdminRole() {
    try {
        console.log(`🔍 Buscando usuario con email: ${TARGET_EMAIL}...`);
        const token = await getManagementToken();

        // 1. Buscar usuario por email
        const usersResp = await fetch(`https://${DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(TARGET_EMAIL)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const users = await usersResp.json();

        if (!users || users.length === 0) {
            console.error('❌ No se encontró ningún usuario con ese correo en Auth0.');
            console.log('💡 TIP: Asegúrate de haberte registrado o logueado al menos una vez en la aplicación.');
            return;
        }

        const user = users[0];
        console.log(`✅ Usuario encontrado: ${user.name} (ID: ${user.user_id})`);

        // 2. Obtener ID del rol "Administrador"
        const rolesResp = await fetch(`https://${DOMAIN}/api/v2/roles?name_filter=Administrador`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const roles = await rolesResp.json();

        if (roles.length === 0) {
            console.error('❌ No existe el rol "Administrador". Ejecuta primero setupAuth0.ts');
            return;
        }

        const adminRoleId = roles[0].id;
        console.log(`ℹ️ ID del Rol Administrador: ${adminRoleId}`);

        // 3. Asignar rol al usuario
        console.log('🔄 Asignando rol...');
        const assignResp = await fetch(`https://${DOMAIN}/api/v2/users/${user.user_id}/roles`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roles: [adminRoleId] }),
        });

        if (assignResp.ok) {
            console.log('\n🎉 ¡ÉXITO! Ahora eres Administrador.');
            console.log('👉 IMPORTANTE: Cierra sesión y vuelve a entrar en la aplicación para que los cambios surtan efecto.');
        } else {
            console.error('❌ Error asignando rol:', await assignResp.text());
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

assignAdminRole();
