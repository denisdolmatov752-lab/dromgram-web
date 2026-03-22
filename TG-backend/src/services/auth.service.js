const { prisma } = require('../config/database');
const { redis } = require('../config/redis');
const { hashCode, compareCode, hashPassword, comparePassword } = require('../utils/bcrypt');
const { signToken } = require('../utils/jwt');
const { sendSms } = require('./sms.service');
const { normalizePhone, validatePhone } = require('../utils/phoneValidator');
const { getAvatarColor } = require('../utils/avatarColor');
const { NotFoundError, ValidationError, ConflictError, AuthenticationError } = require('../middleware/errorHandler');
const { DEV_OTP_CODE, OTP_EXPIRES_IN, OTP_MAX_ATTEMPTS, OTP_RATE_LIMIT, OTP_RATE_WINDOW } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

async function sendOtp(phone) {
  const normalized = normalizePhone(phone);
  if (!validatePhone(normalized) && normalized.length < 10) {
    throw new ValidationError('Неверный формат номера телефона');
  }
  const rateKey = `otp_rate:${normalized}`;
  const rateCount = await redis.get(rateKey);
  if (rateCount && parseInt(rateCount) >= OTP_RATE_LIMIT) {
    throw new ValidationError('Слишком много попыток. Попробуйте позже.');
  }
  const code = process.env.ENABLE_SMS === 'false' ? DEV_OTP_CODE
    : String(Math.floor(10000 + Math.random() * 90000));
  const codeHash = await hashCode(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_IN * 1000);
  const otpRecord = await prisma.otpCode.create({ data: { phone: normalized, code: codeHash, expiresAt } });
  await sendSms(normalized, code);
  const newCount = rateCount ? parseInt(rateCount) + 1 : 1;
  await redis.setEx(rateKey, OTP_RATE_WINDOW, String(newCount));
  const existingUser = await prisma.user.findUnique({ where: { phone: normalized } });
  return { codeId: otpRecord.id, expiresAt, isNewUser: !existingUser };
}

async function verifyOtp(phone, code, deviceName, deviceOs, ipAddress) {
  const normalized = normalizePhone(phone);
  const otpRecord = await prisma.otpCode.findFirst({
    where: { phone: normalized, isUsed: false },
    orderBy: { createdAt: 'desc' }
  });
  if (!otpRecord) throw new AuthenticationError('Код не найден. Запросите новый.');
  if (new Date() > otpRecord.expiresAt) throw new AuthenticationError('Код истёк. Запросите новый.');
  if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) throw new AuthenticationError('Превышено количество попыток.');
  await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { attempts: { increment: 1 } } });
  const valid = await compareCode(code, otpRecord.code);
  if (!valid) throw new AuthenticationError('Неверный код.');
  await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { isUsed: true } });
  let user = await prisma.user.findUnique({ where: { phone: normalized } });
  const isNewUser = !user;
  if (!user) {
    user = await prisma.user.create({
      data: { phone: normalized, firstName: 'Пользователь', avatarColor: getAvatarColor(normalized) }
    });
  }
  const token = signToken({ userId: user.id, phone: user.phone });
  const session = await prisma.session.create({
    data: { userId: user.id, token, deviceName: deviceName || 'Unknown', deviceOs: deviceOs || 'Unknown', ipAddress: ipAddress || '0.0.0.0' }
  });
  await redis.setEx(`session:${token}`, 30 * 24 * 3600, session.id);
  return { token, user, isNewUser };
}

async function register(userId, firstName, lastName, avatarUrl) {
  if (!firstName || firstName.trim().length === 0) throw new ValidationError('Имя обязательно');
  if (firstName.length > 64) throw new ValidationError('Имя слишком длинное');
  const user = await prisma.user.update({
    where: { id: userId },
    data: { firstName: firstName.trim(), lastName: lastName?.trim() || null, avatarUrl: avatarUrl || null, updatedAt: new Date() }
  });
  return user;
}

async function logout(sessionId, token) {
  await prisma.session.update({ where: { id: sessionId }, data: { isActive: false } });
  const { blacklistToken } = require('../utils/jwt');
  await blacklistToken(token);
}

async function logoutAll(userId, currentSessionId) {
  const sessions = await prisma.session.findMany({ where: { userId, isActive: true, id: { not: currentSessionId } } });
  for (const s of sessions) {
    const { blacklistToken } = require('../utils/jwt');
    await blacklistToken(s.token);
  }
  await prisma.session.updateMany({ where: { userId, id: { not: currentSessionId } }, data: { isActive: false } });
}

async function getQrCode(ip) {
  const { v4: uuidv4 } = require('uuid');
  const qrToken = uuidv4();
  await redis.setEx(`qr:${qrToken}`, 30, JSON.stringify({ status: 'pending', ip }));
  return { qrToken, expiresIn: 30 };
}

async function verifyQr(qrToken, userId) {
  const data = await redis.get(`qr:${qrToken}`);
  if (!data) throw new AuthenticationError('QR-код истёк');
  const qrData = JSON.parse(data);
  if (qrData.status !== 'pending') throw new AuthenticationError('QR-код уже использован');
  const token = signToken({ userId });
  await prisma.session.create({
    data: { userId, token, deviceName: 'Web (QR)', deviceOs: 'Browser', ipAddress: qrData.ip || '0.0.0.0' }
  });
  await redis.setEx(`qr:${qrToken}`, 10, JSON.stringify({ status: 'confirmed', token }));
  return { token };
}

module.exports = { sendOtp, verifyOtp, register, logout, logoutAll, getQrCode, verifyQr };
