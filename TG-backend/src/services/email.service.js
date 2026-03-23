const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'dromgram.messenger@gmail.com',
        pass: process.env.EMAIL_PASS || 'dromgram1234@*',
      },
      tls: { rejectUnauthorized: false },
    });
  }
  return transporter;
}

async function sendOtpEmail(email, code) {
  try {
    const t = getTransporter();
    await t.sendMail({
      from: `"DRomGram" <${process.env.EMAIL_USER || 'dromgram.messenger@gmail.com'}>`,
      to: email,
      subject: 'Ваш код входа в DRomGram',
      html: `
        <div style="font-family:Inter,-apple-system,sans-serif;max-width:420px;margin:0 auto;background:#0f1923;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#2AABEE,#1A8AC4);padding:32px;text-align:center">
            <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:white;line-height:64px">D</div>
            <h1 style="color:white;margin:12px 0 0;font-size:24px;font-weight:800">DRomGram</h1>
          </div>
          <div style="padding:32px;text-align:center">
            <p style="color:#8b9db0;font-size:15px;margin:0 0 24px">Ваш код подтверждения:</p>
            <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:white;background:#17212b;padding:20px 24px;border-radius:12px;border:1px solid rgba(42,171,238,0.3);display:inline-block">${code}</div>
            <p style="color:#8b9db0;font-size:13px;margin:20px 0 0">Код действителен 10 минут.<br>Не передавайте его никому.</p>
          </div>
          <div style="padding:16px 32px 32px;text-align:center">
            <p style="color:#4a5568;font-size:12px;margin:0">Если вы не запрашивали этот код, просто проигнорируйте письмо.</p>
          </div>
        </div>
      `,
    });
    console.log(`[EMAIL] OTP sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.error('[EMAIL] Failed to send OTP:', err.message);
    console.log(`[FALLBACK] OTP for ${email}: ${code}`);
    return { success: false, error: err.message };
  }
}

module.exports = { sendOtpEmail, getTransporter };
