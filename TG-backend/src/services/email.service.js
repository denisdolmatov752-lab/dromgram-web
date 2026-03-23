// Email service using Resend (no App Password needed)
// Free plan: 3000 emails/month, no credit card

let resendClient = null;

async function getResendClient() {
  if (resendClient) return resendClient;
  try {
    const { Resend } = require('resend');
    const key = process.env.RESEND_API_KEY;
    if (key && key !== 'your_resend_key') {
      resendClient = new Resend(key);
      return resendClient;
    }
  } catch(e) {}
  return null;
}

async function sendOtpEmail(email, code) {
  const client = await getResendClient();

  const html = `
    <div style="font-family:Inter,-apple-system,sans-serif;max-width:480px;margin:0 auto;background:#0f1923;border-radius:20px;overflow:hidden;border:1px solid rgba(42,171,238,0.2)">
      <div style="background:linear-gradient(135deg,#2AABEE 0%,#1A8AC4 100%);padding:36px;text-align:center">
        <div style="width:72px;height:72px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
          <span style="font-size:32px;font-weight:900;color:white">D</span>
        </div>
        <h1 style="color:white;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px">DRomGram</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Код подтверждения</p>
      </div>
      <div style="padding:40px;text-align:center">
        <p style="color:#8b9db0;font-size:16px;margin:0 0 28px;line-height:1.5">
          Используйте этот код для входа в DRomGram:
        </p>
        <div style="display:inline-block;background:#17212b;border:2px solid rgba(42,171,238,0.4);border-radius:16px;padding:24px 40px">
          <span style="font-size:48px;font-weight:900;letter-spacing:16px;color:#ffffff;font-family:monospace">${code}</span>
        </div>
        <p style="color:#4a5568;font-size:13px;margin:24px 0 0;line-height:1.6">
          Код действителен <strong style="color:#8b9db0">10 минут</strong>.<br>
          Не передавайте его никому — сотрудники DRomGram никогда не просят коды.
        </p>
      </div>
      <div style="padding:20px 40px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.06)">
        <p style="color:#2d3748;font-size:12px;margin:0">
          Если вы не запрашивали этот код — проигнорируйте письмо.
        </p>
      </div>
    </div>
  `;

  // Try Resend first
  if (client) {
    try {
      const result = await client.emails.send({
        from: 'DRomGram <onboarding@resend.dev>',
        to: [email],
        subject: `${code} — код входа в DRomGram`,
        html,
      });
      console.log(`[RESEND] OTP sent to ${email}, id=${result.data?.id}`);
      return { success: true, provider: 'resend' };
    } catch (err) {
      console.error('[RESEND] Error:', err.message);
    }
  }

  // Fallback: nodemailer with Gmail
  try {
    const nodemailer = require('nodemailer');
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (user && pass && !pass.includes('dromgram1234')) {
      const t = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
      await t.sendMail({
        from: `"DRomGram" <${user}>`,
        to: email,
        subject: `${code} — код входа в DRomGram`,
        html,
      });
      console.log(`[GMAIL] OTP sent to ${email}`);
      return { success: true, provider: 'gmail' };
    }
  } catch (err) {
    console.error('[GMAIL] Error:', err.message);
  }

  // Dev fallback — just log
  console.log(`[DEV] =============================`);
  console.log(`[DEV] OTP для ${email}: ${code}`);
  console.log(`[DEV] =============================`);
  return { success: true, provider: 'dev_log' };
}

module.exports = { sendOtpEmail };
