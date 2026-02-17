
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

const DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.AUTH0_M2M_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_M2M_CLIENT_SECRET;
const TEST_USER_ID = 'auth0|698e8b1f23d5dbd68657ba95';

if (!DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Falta configuración en .env');
    process.exit(1);
}

const getManagementToken = async () => {
    try {
        const res = await axios.post(`https://${DOMAIN}/oauth/token`, {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            audience: `https://${DOMAIN}/api/v2/`,
            grant_type: 'client_credentials',
        });
        return res.data.access_token;
    } catch (error: any) {
        console.error('❌ Error obteniendo token:', error.message);
        process.exit(1);
    }
};

const getAuth0Roles = async (token: string) => {
    const encodedId = encodeURIComponent(TEST_USER_ID);
    const res = await axios.get(`https://${DOMAIN}/api/v2/users/${encodedId}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.map((r: any) => r.name).sort();
};

const runTest = async () => {
    console.log('🚀 INICIANDO PRUEBA 🚀');
    const token = await getManagementToken();

    const allRolesRes = await axios.get(`https://${DOMAIN}/api/v2/roles`, { headers: { Authorization: `Bearer ${token}` } });
    const rolesMap: { [key: string]: string } = {};
    allRolesRes.data.forEach((r: any) => {
        rolesMap[r.name] = r.id;
    });

    const ROLE_A = 'Usuario';
    const ID_A = rolesMap[ROLE_A];
    const ROLE_B = 'Comercial';
    const ID_B = rolesMap[ROLE_B];

    if (!ID_A || !ID_B) {
        console.error('❌ No encuentro roles Usuario/Comercial. Abortando.');
        return;
    }

    // --- ESCENARIO 1: Cambio Externo ---
    console.log(`\n--- 1. Set AUTH0 -> "Usuario" ---`);
    const encodedId = encodeURIComponent(TEST_USER_ID);

    // Limpiar todo antes
    const currentRoles = await getAuth0Roles(token);
    // Borrar uno por uno IDs si hace falta, pero asumimos delete global por simplicidad
    // NO, Auth0 requiere borrar el ID especifico
    // Hack rapido: Obtenemos IDs actuales y los borramos
    const currentRolesData = (await axios.get(`https://${DOMAIN}/api/v2/users/${encodedId}/roles`, { headers: { Authorization: `Bearer ${token}` } })).data;
    const currentIds = currentRolesData.map((r: any) => r.id);
    if (currentIds.length > 0) {
        await axios.delete(`https://${DOMAIN}/api/v2/users/${encodedId}/roles`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { roles: currentIds }
        });
    }

    // Poner Usuario
    await axios.post(`https://${DOMAIN}/api/v2/users/${encodedId}/roles`, { roles: [ID_A] }, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const rolesCheck1 = await getAuth0Roles(token);
    console.log(`✅ Roles en Auth0: ${JSON.stringify(rolesCheck1)}`);

    // --- ESCENARIO 2: Cambio Interno (App) ---
    console.log(`\n--- 2. Set APP -> "Comercial" (Reemplazo) ---`);
    // Simulamos logica backend: Borrar A, Poner B
    await axios.delete(`https://${DOMAIN}/api/v2/users/${encodedId}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { roles: [ID_A] }
    });
    await axios.post(`https://${DOMAIN}/api/v2/users/${encodedId}/roles`, { roles: [ID_B] }, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const rolesCheck2 = await getAuth0Roles(token);
    console.log(`✅ Roles en Auth0 Final: ${JSON.stringify(rolesCheck2)}`);

    if (rolesCheck2.includes('Comercial') && rolesCheck2.length === 1) {
        console.log(`✨ EXITO TOTAL: El reemplazo funcionó. Adios Usuario, Hola Comercial.`);
    } else {
        console.error(`❌ FALLO: ${JSON.stringify(rolesCheck2)}`);
    }
};

runTest().catch(console.error);
