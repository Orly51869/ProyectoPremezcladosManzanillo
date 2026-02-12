
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cargar variables de entorno desde el archivo .env en la raíz del Backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.AUTH0_M2M_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_M2M_CLIENT_SECRET;

const ROLES_TO_CREATE = [
    { name: 'Administrador', description: 'Acceso total al sistema' },
    { name: 'Contable', description: 'Acceso a presupuestos y facturas' },
    { name: 'Comercial', description: 'Acceso a clientes y presupuestos' },
    { name: 'Usuario', description: 'Acceso básico' }
];

function log(message: string) {
    console.log(message);
    fs.appendFileSync('setup_log.txt', message + '\n');
}

async function getManagementToken() {
    if (!DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Faltan variables de entorno (AUTH0_DOMAIN, AUTH0_M2M_CLIENT_ID, AUTH0_M2M_CLIENT_SECRET)');
    }

    log('Obteniendo token de gestión...');
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
    if (!response.ok) {
        throw new Error(`Error obteniendo token: ${data.error_description || data.error || JSON.stringify(data)}`);
    }
    return data.access_token;
}

async function setupRoles() {
    try {
        fs.writeFileSync('setup_log.txt', 'Iniciando Setup...\n');
        const token = await getManagementToken();
        log('Token obtenido correctamente.');

        // 1. Obtener roles existentes
        const rolesResp = await fetch(`https://${DOMAIN}/api/v2/roles`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!rolesResp.ok) throw new Error('Error listando roles');

        const existingRoles = await rolesResp.json();
        const existingRoleNames = existingRoles.map((r: any) => r.name);
        log('Roles existentes: ' + existingRoleNames.join(', '));

        // 2. Crear roles faltantes
        for (const roleDef of ROLES_TO_CREATE) {
            if (!existingRoleNames.includes(roleDef.name)) {
                log(`Creando rol: ${roleDef.name}...`);
                const createResp = await fetch(`https://${DOMAIN}/api/v2/roles`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(roleDef),
                });

                if (createResp.ok) {
                    log(`✅ Rol ${roleDef.name} creado.`);
                } else {
                    const err = await createResp.json();
                    log(`❌ Error creando ${roleDef.name}: ${err.message}`);
                }
            } else {
                log(`ℹ️ El rol ${roleDef.name} ya existe.`);
            }
        }

        log('\n✅ Configuración de roles completada.');

    } catch (error: any) {
        log('\n❌ ERROR FATAL: ' + error.message);
    }
}

setupRoles();
