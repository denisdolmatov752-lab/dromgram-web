const logger = require('../config/logger');

async function sendSms(phone, code) {
  if (process.env.ENABLE_SMS === 'false' || process.env.NODE_ENV === 'development') {
    logger.info(`[DEV] OTP для ${phone}: ${code}`);
    return { success: true, dev: true };
  }
  try {
    const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    await twilio.messages.create({
      body: `Ваш код DRomGram: ${code}. Не передавайте его никому.`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });
    return { success: true };
  } catch (err) {
    logger.error('SMS send error:', err);
    throw new Error('Не удалось отправить SMS');
  }
}

module.exports = { sendSms };
