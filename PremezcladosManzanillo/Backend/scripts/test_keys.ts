
import dotenv from 'dotenv';

const DOMAIN = 'dev-3u2pz1qta376worq.us.auth0.com';
const CLIENT_ID = '94LJjimeU85kynsYU2UGK8lnuJuHJaxu';
const CLIENT_SECRET = 'pt82Z4jYudSOufWWDBm-tPIHLbbQJOZWJhUx-kdVrfXRIkNlk6qH1GhMYid3XYiH';

async function testCredentials() {
    console.log('Probando credenciales proporcionadas para acceso M2M (Gestión de Roles)...');
    console.log(`Client ID: ${CLIENT_ID}`);

    try {
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

        if (response.ok) {
            console.log('✅ ÉXITO: Estas credenciales PUEDEN obtener un token de gestión via Client Credentials.');
            console.log('Scope:', data.scope);
        } else {
            console.log('❌ FALLO: No se pudo obtener token con estas credenciales.');
            console.log('Razón:', data.error_description || data.error);
            console.log('Explicación: Estas credenciales parecen ser del Frontend (SPA) y no están autorizadas para tareas de administración (Backend M2M).');
        }
    } catch (error: any) {
        console.error('Error de red:', error.message);
    }
}

testCredentials();
