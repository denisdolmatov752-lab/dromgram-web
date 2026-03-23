const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

async function sendOtpEmail(email, code) {
  if (process.env.EMAIL_ENABLED !== 'true') {
    console.log(`[DEV] Email OTP for ${email}: ${code}`);
    return;
  }
  const t = getTransporter();
  await t.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@orproject.ru',
    to: email,
    subject: 'Ваш код входа в DRomGram',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:400px;margin:0 auto;padding:40px;background:#17212b;color:#fff;border-radius:16px">
        <h2 style="color:#2AABEE;margin-bottom:8px">DRomGram</h2>
        <p style="color:#8b949e;margin-bottom:24px">Код подтверждения</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;color:#fff;background:#232e3c;padding:20px;border-radius:12px">${code}</div>
        <p style="color:#8b949e;margin-top:16px;font-size:13px">Код действителен 10 минут. Не передавайте его никому.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };
