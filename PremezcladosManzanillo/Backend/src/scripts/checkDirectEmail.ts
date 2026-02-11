
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Importar la función base
import { sendEmail } from '../services/emailService';

async function verifyConnection() {
    console.log('--- DIAGNOSTICO DE CORREO ---');
    console.log(`User: ${process.env.EMAIL_USER}`);

    if (!process.env.EMAIL_PASS) {
        console.log('FAIL: No password found.');
        return;
    }

    try {
        const result = await sendEmail({
            to: process.env.EMAIL_USER as string, // Enviarse a sí mismo
            subject: 'Email Test Directo',
            text: 'Si lees esto, nodemailer funciona.'
        });

        if (result) {
            console.log('SUCCESS: Correo aceptado por Gmail.');
            console.log('Message ID:', result.messageId);
        } else {
            console.log('FAIL: La función devolvió null (Revisa el console.error del servicio).');
        }

    } catch (err) {
        console.log('CRASH: Error no manejado:', err);
    }
}

verifyConnection();
