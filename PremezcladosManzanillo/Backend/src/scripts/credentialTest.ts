
import nodemailer from 'nodemailer';

const user = 'orlandojvelasquezt14@gmail.com';
// Note: removing spaces just in case, though usually they are ignored or required depending on UI.
// Google App Passwords are usually 16 chars. Spaces are for readability.
// Nodemailer should handle them, but let's try raw string.
const pass = 'ueft pnyh yyjv fpni';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
});

console.log('Testing credentials for:', user);

transporter.sendMail({
    from: user,
    to: user,
    subject: 'Test Credentials',
    text: 'It works!'
}).then(info => {
    console.log('SUCCESS_ID:', info.messageId);
}).catch(err => {
    console.log('XXX_ERROR_XXX');
    console.log(err.message);
});
