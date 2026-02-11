
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export const sendEmail = async (options: EmailOptions) => {
    try {
        const info = await transporter.sendMail({
            from: `"Premezclados Manzanillo" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw to prevent blocking the main flow only log the error
        return null;
    }
};

export const sendBudgetApprovedEmail = async (
    clientEmail: string,
    clientName: string,
    budgetTitle: string,
    budgetId: string
) => {
    if (!clientEmail) {
        console.warn('No client email provided for budget approval notification.');
        return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const budgetLink = `${frontendUrl}/budgets/${budgetId}`;

    const subject = `Tu Pedido Aprobado: ${budgetTitle}`;
    const text = `Hola ${clientName},\n\nTu presupuesto "${budgetTitle}" ha sido aprobado y tu pedido confirmado.\n\nPuedes ver los detalles en el siguiente enlace:\n${budgetLink}\n\nGracias por tu preferencia.\nPremezclados Manzanillo`;

    const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>¡Pedido Confirmado!</h2>
      <p>Hola <strong>${clientName}</strong>,</p>
      <p>Nos complace informarte que tu presupuesto "<strong>${budgetTitle}</strong>" ha sido aprobado exitosamente.</p>
      <div style="margin: 20px 0;">
        <a href="${budgetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Detalles del Pedido</a>
      </div>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p><a href="${budgetLink}">${budgetLink}</a></p>
      <br />
      <p>Gracias por tu preferencia,<br /><strong>Premezclados Manzanillo</strong></p>
    </div>
  `;

    await sendEmail({
        to: clientEmail,
        subject,
        text,
        html,
    });
};

export const sendPaymentValidatedEmail = async (
    clientEmail: string,
    clientName: string,
    budgetTitle: string,
    budgetId: string,
    paymentAmount: number,
    currency: string
) => {
    if (!clientEmail) {
        console.warn('No client email provided for payment validation notification.');
        return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const budgetLink = `${frontendUrl}/payments`;

    const subject = `Pago Validado: ${budgetTitle}`;
    const text = `Hola ${clientName},\n\nHemos validado exitosamente tu pago de ${paymentAmount.toFixed(2)} ${currency} para el presupuesto "${budgetTitle}".\n\nPuedes ver el estado de tus pagos en el siguiente enlace:\n${budgetLink}\n\nGracias por tu preferencia.\nPremezclados Manzanillo`;

    const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>¡Pago Validado!</h2>
      <p>Hola <strong>${clientName}</strong>,</p>
      <p>Hemos validado exitosamente tu pago para el presupuesto "<strong>${budgetTitle}</strong>".</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 5px solid #4CAF50; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px;">Monto Validado: <strong>${paymentAmount.toFixed(2)} ${currency}</strong></p>
      </div>

      <div style="margin: 20px 0;">
        <a href="${budgetLink}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Mis Pagos</a>
      </div>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p><a href="${budgetLink}">${budgetLink}</a></p>
      <br />
      <p>Gracias por tu preferencia,<br /><strong>Premezclados Manzanillo</strong></p>
    </div>
  `;

    await sendEmail({
        to: clientEmail,
        subject,
        text,
        html,
    });
};
