
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno explícitamente desde el archivo .env en la raíz del backend
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Cargando configuración desde: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error al cargar el archivo .env:', result.error);
}

// Importar el servicio DESPUÉS de cargar las variables
import { sendBudgetApprovedEmail } from '../services/emailService';

async function runTest() {
    const testEmail = 'orlandojvelasquezt14@gmail.com'; // Tu correo
    console.log('---------------------------------------------------');
    console.log(`Iniciando prueba de envío de correo...`);
    console.log(`Remitente configurado: ${process.env.EMAIL_USER}`);
    console.log(`Destinatario de prueba: ${testEmail}`);

    if (!process.env.EMAIL_PASS) {
        console.error('ERROR CRÍTICO: No se encontró la contraseña (EMAIL_PASS) en las variables de entorno.');
        return;
    }

    console.log('Intentando conectar con Gmail y enviar...');

    try {
        await sendBudgetApprovedEmail(
            testEmail,
            'Orlando (Prueba)',
            'PRUEBA-DE-CONEXION-001',
            'id-simulado-123'
        );
        console.log('---------------------------------------------------');
        console.log('✅ El sistema reporta que el correo se envió (o se intentó enviar).');
        console.log('Revisa tu consola arriba. Si apareció "Email sent: ...", ¡fue exitoso!');
        console.log('Si apareció un error, por favor léelo para saber qué pasó.');
    } catch (error) {
        console.error('❌ Ocurrió un error inesperado durante la prueba:', error);
    }
}

runTest();
