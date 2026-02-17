
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

const DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.AUTH0_M2M_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_M2M_CLIENT_SECRET;

if (!DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Falta configuración en .env');
    process.exit(1);
}

const getManagementToken = async () => {
    console.log('🔑 Obteniendo token de Auth0...');
    try {
        const res = await axios.post(`https://${DOMAIN}/oauth/token`, {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            audience: `https://${DOMAIN}/api/v2/`,
            grant_type: 'client_credentials',
        });
        return res.data.access_token;
    } catch (error: any) {
        console.error('❌ Error obteniendo token:', error.response?.data || error.message);
        process.exit(1);
    }
};

const fetchAll = async (url: string, token: string) => {
    let allItems: any[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
        const res = await axios.get(`${url}?page=${page}&per_page=50&include_totals=true`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        allItems = [...allItems, ...res.data.users || res.data]; // Auth0 users response structure varies sometimes

        if (!res.data.users) {
            // If it's pure array (like roles often are in some endpoints, though usually paginated objects)
            if (res.data.length < 50) hasMore = false;
        } else {
            if (allItems.length >= res.data.total) hasMore = false;
        }
        page++;
        if (page > 10) hasMore = false; // Safety break
    }
    return allItems;
};

const runDiagnosis = async () => {
    const token = await getManagementToken();

    console.log('\n📥 Descargando Usuarios...');
    // Users endpoint isn't paginated the same way with fetchAll logic simply for roles vs users, adjusting...
    // Actually simplified: for diagnosis usually we have few users.
    const usersRes = await axios.get(`https://${DOMAIN}/api/v2/users?per_page=100`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const users = usersRes.data;
    console.log(`✅ ${users.length} usuarios encontrados.`);

    console.log('\n📥 Descargando Roles Globales...');
    const rolesRes = await axios.get(`https://${DOMAIN}/api/v2/roles?per_page=100`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const roles = rolesRes.data;
    console.log(`✅ ${roles.length} roles encontrados: ${roles.map((r: any) => r.name).join(', ')}`);

    console.log('\n🔍 --- ANÁLISIS CRUZADO DE ROLES ---');

    for (const u of users) {
        console.log(`\n👤 Usuario: ${u.email} (${u.name})`);
        console.log(`   ID: ${u.user_id}`);

        // 1. Roles en Metadata
        const metaRoles = u.app_metadata?.roles || [];
        console.log(`   🔸 [Metadata] Roles guardados: ${JSON.stringify(metaRoles)}`);

        // 2. Roles en API Directa (Source of Truth)
        try {
            const encodedId = encodeURIComponent(u.user_id);
            const userRolesRes = await axios.get(`https://${DOMAIN}/api/v2/users/${encodedId}/roles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const realRoles = userRolesRes.data.map((r: any) => r.name);
            console.log(`   🔹 [API Real] Roles reales:    ${JSON.stringify(realRoles)}`);

            // 3. VeredictoBackend
            let backendLogicRoles = [];
            if (realRoles.length > 0) {
                backendLogicRoles = realRoles; // Nueva lógica: Prioridad API
            } else {
                backendLogicRoles = metaRoles; // Nueva lógica: Fallback
            }

            console.log(`   👉 [Backend Vería]:            ${JSON.stringify(backendLogicRoles)}`);

            if (JSON.stringify(metaRoles.sort()) !== JSON.stringify(realRoles.sort())) {
                console.log(`   ⚠️  ALERTA: Desincronización detectada entre Metadata y Realidad.`);
            } else {
                console.log(`   ✨  Sincronizado.`);
            }

        } catch (err: any) {
            console.error(`   ❌ Error consultando roles directos: ${err.message}`);
        }
    }
};

runDiagnosis().catch(console.error);
