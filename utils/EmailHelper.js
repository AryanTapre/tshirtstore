
const nodeMailer = require('nodemailer');

const mailHelper = async(options) => {
    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        }
    })

    const message = {
        from: 'Tshirtstore@store.dev>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    }

    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
}

module.exports = mailHelper;


