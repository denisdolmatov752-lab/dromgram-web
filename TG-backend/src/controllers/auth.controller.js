const authService = require('../services/auth.service');

async function sendCode(req, res, next) {
  try {
    const { phone, email } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: 'Номер телефона обязателен' });
    const result = await authService.sendOtp(phone, email);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function verifyCode(req, res, next) {
  try {
    const { phone, code, deviceName, deviceOs } = req.body;
    if (!phone || !code) return res.status(400).json({ success: false, error: 'phone и code обязательны' });
    const ip = req.ip || req.connection.remoteAddress;
    const result = await authService.verifyOtp(phone, code, deviceName, deviceOs, ip);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function register(req, res, next) {
  try {
    const { firstName, lastName } = req.body;
    const user = await authService.register(req.user.id, firstName, lastName, null);
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user.sessionId, req.token);
    res.json({ success: true, data: { message: 'Выход выполнен' } });
  } catch (err) { next(err); }
}

async function logoutAll(req, res, next) {
  try {
    await authService.logoutAll(req.user.id, req.user.sessionId);
    res.json({ success: true, data: { message: 'Все сессии завершены' } });
  } catch (err) { next(err); }
}

async function getQr(req, res, next) {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const result = await authService.getQrCode(ip);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function verifyQr(req, res, next) {
  try {
    const { qrToken } = req.body;
    const result = await authService.verifyQr(qrToken, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

module.exports = { sendCode, verifyCode, register, logout, logoutAll, getQr, verifyQr };
