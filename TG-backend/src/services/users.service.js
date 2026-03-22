const { prisma } = require('../config/database');
const { NotFoundError, ValidationError, ConflictError } = require('../middleware/errorHandler');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const sharp = require('sharp');
const path = require('path');
const { getMediaUrl } = require('../utils/fileHelper');

async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: {
    id:true, phone:true, firstName:true, lastName:true, username:true, bio:true,
    avatarUrl:true, avatarColor:true, isOnline:true, lastSeen:true, isPremium:true,
    phonePrivacy:true, onlinePrivacy:true, groupsPrivacy:true, callsPrivacy:true, createdAt:true
  }});
  if (!user) throw new NotFoundError('Пользователь не найден');
  return user;
}

async function updateProfile(userId, { firstName, lastName, username, bio }) {
  if (firstName !== undefined && (!firstName || firstName.trim().length === 0)) throw new ValidationError('Имя не может быть пустым');
  if (username) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== userId) throw new ConflictError('Имя пользователя уже занято');
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(username)) throw new ValidationError('Username: 5-32 символа, только латиница, цифры, _');
  }
  const updated = await prisma.user.update({ where: { id: userId }, data: {
    ...(firstName && { firstName: firstName.trim() }),
    ...(lastName !== undefined && { lastName: lastName?.trim() || null }),
    ...(username !== undefined && { username: username || null }),
    ...(bio !== undefined && { bio: bio?.trim() || null }),
    updatedAt: new Date()
  }});
  return updated;
}

async function updateAvatar(userId, file) {
  const outputPath = file.path.replace(path.extname(file.path), '_400.jpg');
  await sharp(file.path).resize(400, 400, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(outputPath);
  const filename = path.basename(outputPath);
  const avatarUrl = getMediaUrl('avatar', filename);
  await prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
  return { avatarUrl };
}

async function deleteAvatar(userId) {
  await prisma.user.update({ where: { id: userId }, data: { avatarUrl: null } });
}

async function getUserById(userId, viewerId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: {
    id:true, firstName:true, lastName:true, username:true, bio:true, avatarUrl:true,
    avatarColor:true, isOnline:true, lastSeen:true, isPremium:true, phonePrivacy:true, onlinePrivacy:true, phone:true
  }});
  if (!user) throw new NotFoundError('Пользователь не найден');
  const isContact = viewerId ? !!(await prisma.contact.findUnique({ where: { userId_contactId: { userId: viewerId, contactId: userId } } })) : false;
  const canSeePhone = user.phonePrivacy === 'EVERYONE' || (user.phonePrivacy === 'CONTACTS' && isContact);
  const canSeeOnline = user.onlinePrivacy === 'EVERYONE' || (user.onlinePrivacy === 'CONTACTS' && isContact);
  return {
    id: user.id, firstName: user.firstName, lastName: user.lastName, username: user.username,
    bio: user.bio, avatarUrl: user.avatarUrl, avatarColor: user.avatarColor, isPremium: user.isPremium,
    phone: canSeePhone ? user.phone : null,
    isOnline: canSeeOnline ? user.isOnline : null,
    lastSeen: canSeeOnline ? user.lastSeen : null
  };
}

async function getUserByUsername(username, viewerId) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new NotFoundError('Пользователь не найден');
  return getUserById(user.id, viewerId);
}

async function updatePrivacy(userId, { phonePrivacy, onlinePrivacy, groupsPrivacy, callsPrivacy }) {
  return prisma.user.update({ where: { id: userId }, data: {
    ...(phonePrivacy && { phonePrivacy }),
    ...(onlinePrivacy && { onlinePrivacy }),
    ...(groupsPrivacy && { groupsPrivacy }),
    ...(callsPrivacy && { callsPrivacy })
  }});
}

async function setPassword(userId, password, hint, recoveryEmail) {
  if (!password || password.length < 6) throw new ValidationError('Пароль минимум 6 символов');
  const passwordHash = await hashPassword(password);
  return prisma.user.update({ where: { id: userId }, data: { passwordHash, passwordHint: hint || null, recoveryEmail: recoveryEmail || null } });
}

async function getSessions(userId) {
  return prisma.session.findMany({ where: { userId, isActive: true }, orderBy: { lastUsed: 'desc' } });
}

async function revokeSession(userId, sessionId) {
  const session = await prisma.session.findFirst({ where: { id: sessionId, userId } });
  if (!session) throw new NotFoundError('Сессия не найдена');
  const { blacklistToken } = require('../utils/jwt');
  await blacklistToken(session.token);
  await prisma.session.update({ where: { id: sessionId }, data: { isActive: false } });
}

async function revokeAllSessions(userId, currentSessionId) {
  const sessions = await prisma.session.findMany({ where: { userId, isActive: true, id: { not: currentSessionId } } });
  const { blacklistToken } = require('../utils/jwt');
  for (const s of sessions) await blacklistToken(s.token);
  await prisma.session.updateMany({ where: { userId, id: { not: currentSessionId } }, data: { isActive: false } });
}

module.exports = { getMe, updateProfile, updateAvatar, deleteAvatar, getUserById, getUserByUsername, updatePrivacy, setPassword, getSessions, revokeSession, revokeAllSessions };
