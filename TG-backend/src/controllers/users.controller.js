const usersService = require('../services/users.service');

async function getMe(req, res, next) {
  try {
    const user = await usersService.getMe(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function updateMe(req, res, next) {
  try {
    const { firstName, lastName, username, bio } = req.body;
    const user = await usersService.updateProfile(req.user.id, { firstName, lastName, username, bio });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Файл не загружен' });
    const result = await usersService.updateAvatar(req.user.id, req.file);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function deleteAvatar(req, res, next) {
  try {
    await usersService.deleteAvatar(req.user.id);
    res.json({ success: true, data: { message: 'Аватар удалён' } });
  } catch (err) { next(err); }
}

async function getUserById(req, res, next) {
  try {
    const user = await usersService.getUserById(req.params.id, req.user.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function getUserByUsername(req, res, next) {
  try {
    const user = await usersService.getUserByUsername(req.params.username, req.user.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function updatePrivacy(req, res, next) {
  try {
    const result = await usersService.updatePrivacy(req.user.id, req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function setPassword(req, res, next) {
  try {
    const { password, hint, recoveryEmail } = req.body;
    await usersService.setPassword(req.user.id, password, hint, recoveryEmail);
    res.json({ success: true, data: { message: 'Пароль установлен' } });
  } catch (err) { next(err); }
}

async function getSessions(req, res, next) {
  try {
    const sessions = await usersService.getSessions(req.user.id, req.user.sessionId);
    res.json({ success: true, data: sessions });
  } catch (err) { next(err); }
}

async function revokeSession(req, res, next) {
  try {
    await usersService.revokeSession(req.user.id, req.params.sessionId);
    res.json({ success: true, data: { message: 'Сессия завершена' } });
  } catch (err) { next(err); }
}

async function revokeAllSessions(req, res, next) {
  try {
    await usersService.revokeAllSessions(req.user.id, req.user.sessionId);
    res.json({ success: true, data: { message: 'Все сессии завершены' } });
  } catch (err) { next(err); }
}

async function getMyGifts(req, res, next) {
  try {
    const gifts = await prisma.$queryRawUnsafe(
      `SELECT g.*, u."firstName" as "senderFirstName", u.username as "senderUsername"
       FROM "Gift" g LEFT JOIN "User" u ON g."senderId" = u.id
       WHERE g."receiverId" = $1 ORDER BY g."createdAt" DESC LIMIT 50`,
      req.user.id
    ).catch(() => []);
    res.json({ success: true, data: gifts.map(g => ({
      id: g.id, nftName: g.nftName, nftDisplay: g.nftDisplay || g.nftName,
      fromUser: { firstName: g.senderFirstName, username: g.senderUsername },
      receivedAt: g.createdAt
    }))});
  } catch (err) { res.json({ success: true, data: [] }); }
}

async function getUserGifts(req, res, next) {
  try {
    const gifts = await prisma.$queryRawUnsafe(
      `SELECT g.*, u."firstName" as "senderFirstName", u.username as "senderUsername"
       FROM "Gift" g LEFT JOIN "User" u ON g."senderId" = u.id
       WHERE g."receiverId" = $1 ORDER BY g."createdAt" DESC LIMIT 20`,
      req.params.id
    ).catch(() => []);
    res.json({ success: true, data: gifts.map(g => ({
      id: g.id, nftName: g.nftName, nftDisplay: g.nftDisplay || g.nftName,
      fromUser: { firstName: g.senderFirstName, username: g.senderUsername },
    }))});
  } catch (err) { res.json({ success: true, data: [] }); }
}

async function getMyStars(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { stars: true } });
    res.json({ success: true, stars: user?.stars || 0 });
  } catch (err) { res.json({ success: true, stars: 0 }); }
}

async function activatePremium(req, res, next) {
  try {
    const { plan } = req.body;
    const plans = { monthly: { stars: 299, days: 30 }, '6months': { stars: 1499, days: 180 }, yearly: { stars: 2499, days: 365 } };
    const cfg = plans[plan];
    if (!cfg) return res.status(400).json({ success: false, error: 'Invalid plan' });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if ((user.stars || 0) < cfg.stars) return res.status(400).json({ success: false, error: 'Недостаточно звёзд', required: cfg.stars });
    const now = new Date();
    const base = user.premiumUntil && new Date(user.premiumUntil) > now ? new Date(user.premiumUntil) : now;
    const until = new Date(base.getTime() + cfg.days * 86400000);
    const updated = await prisma.user.update({ where: { id: req.user.id }, data: { isPremium: true, premiumUntil: until, stars: { decrement: cfg.stars } } });
    res.json({ success: true, premiumUntil: until, stars: updated.stars });
  } catch (err) { next(err); }
}

module.exports = { getMe, updateMe, uploadAvatar, deleteAvatar, getUserById, getUserByUsername, updatePrivacy, setPassword, getSessions, revokeSession, revokeAllSessions, getMyGifts, getUserGifts, getMyStars, activatePremium };
