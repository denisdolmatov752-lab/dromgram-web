const { verifyToken, isBlacklisted } = require('../utils/jwt');
const { prisma } = require('../config/database');
const logger = require('../config/logger');

async function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Токен не предоставлен', code: 'NO_TOKEN' });
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Недействительный или истёкший токен', code: 'INVALID_TOKEN' });
    }
    const blacklisted = await isBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({ success: false, error: 'Токен отозван', code: 'TOKEN_REVOKED' });
    }
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || !session.isActive) {
      return res.status(401).json({ success: false, error: 'Сессия недействительна', code: 'SESSION_INVALID' });
    }
    await prisma.session.update({ where: { id: session.id }, data: { lastUsed: new Date() } });
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.isBanned) {
      return res.status(401).json({ success: false, error: 'Пользователь не найден или заблокирован', code: 'USER_BANNED' });
    }
    req.user = { id: user.id, phone: user.phone, firstName: user.firstName, isAdmin: user.isAdmin, sessionId: session.id };
    req.token = token;
    next();
  } catch (err) {
    logger.error('Auth middleware error:', err);
    return res.status(500).json({ success: false, error: 'Ошибка аутентификации', code: 'AUTH_ERROR' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ success: false, error: 'Доступ запрещён', code: 'FORBIDDEN' });
  }
  next();
}

module.exports = { authenticateJWT, requireAdmin };
