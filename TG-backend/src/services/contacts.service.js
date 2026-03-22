const { prisma } = require('../config/database');
const { NotFoundError, ConflictError } = require('../middleware/errorHandler');

async function getContacts(userId) {
  return prisma.contact.findMany({
    where: { userId },
    include: { contact: { select: { id:true, firstName:true, lastName:true, username:true, avatarUrl:true, avatarColor:true, isOnline:true, lastSeen:true } } },
    orderBy: { firstName: 'asc' }
  });
}

async function addContact(userId, phone, firstName, lastName) {
  const { normalizePhone } = require('../utils/phoneValidator');
  const normalized = normalizePhone(phone);
  const contactUser = await prisma.user.findUnique({ where: { phone: normalized } });
  if (!contactUser) throw new NotFoundError('Пользователь с таким номером не найден');
  if (contactUser.id === userId) throw new ConflictError('Нельзя добавить себя в контакты');
  const existing = await prisma.contact.findUnique({ where: { userId_contactId: { userId, contactId: contactUser.id } } });
  if (existing) throw new ConflictError('Контакт уже добавлен');
  return prisma.contact.create({ data: { userId, contactId: contactUser.id, firstName: firstName || contactUser.firstName, lastName: lastName || contactUser.lastName || null } });
}

async function updateContact(userId, contactId, firstName, lastName) {
  const contact = await prisma.contact.findFirst({ where: { id: contactId, userId } });
  if (!contact) throw new NotFoundError('Контакт не найден');
  return prisma.contact.update({ where: { id: contactId }, data: { firstName, lastName: lastName || null } });
}

async function deleteContact(userId, contactId) {
  const contact = await prisma.contact.findFirst({ where: { id: contactId, userId } });
  if (!contact) throw new NotFoundError('Контакт не найден');
  await prisma.contact.delete({ where: { id: contactId } });
}

async function getBlocked(userId) {
  return prisma.blockedUser.findMany({
    where: { blockerId: userId },
    include: { blocked: { select: { id:true, firstName:true, lastName:true, username:true, avatarUrl:true } } }
  });
}

async function blockUser(userId, targetId) {
  if (userId === targetId) throw new ConflictError('Нельзя заблокировать себя');
  const existing = await prisma.blockedUser.findUnique({ where: { blockerId_blockedId: { blockerId: userId, blockedId: targetId } } });
  if (existing) throw new ConflictError('Пользователь уже заблокирован');
  return prisma.blockedUser.create({ data: { blockerId: userId, blockedId: targetId } });
}

async function unblockUser(userId, targetId) {
  const blocked = await prisma.blockedUser.findUnique({ where: { blockerId_blockedId: { blockerId: userId, blockedId: targetId } } });
  if (!blocked) throw new NotFoundError('Пользователь не был заблокирован');
  await prisma.blockedUser.delete({ where: { blockerId_blockedId: { blockerId: userId, blockedId: targetId } } });
}

module.exports = { getContacts, addContact, updateContact, deleteContact, getBlocked, blockUser, unblockUser };
