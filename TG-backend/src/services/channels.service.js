const { prisma } = require('../config/database');
const { NotFoundError, ForbiddenError, ConflictError, ValidationError } = require('../middleware/errorHandler');

async function createChannel(creatorId, { name, type, description }) {
  if (!name?.trim()) throw new ValidationError('Название канала обязательно');
  const isPublic = type === 'public';
  return prisma.chat.create({
    data: { type: 'CHANNEL', name: name.trim(), description: description?.trim() || null, isPublic, isChannel: true,
      members: { create: { userId: creatorId, role: 'OWNER' } } }
  });
}

async function getChannel(chatId, userId) {
  const chat = await prisma.chat.findUnique({ where: { id: chatId }, include: {
    members: { include: { user: { select: { id:true, firstName:true, lastName:true, avatarUrl:true, role:true } } } }
  }});
  if (!chat) throw new NotFoundError('Канал не найден');
  if (!chat.isPublic) {
    const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
    if (!member) throw new ForbiddenError('Нет доступа');
  }
  return chat;
}

async function updateChannel(chatId, userId, { name, description }) {
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (!member || !['ADMIN','OWNER'].includes(member.role)) throw new ForbiddenError('Нет прав');
  return prisma.chat.update({ where: { id: chatId }, data: { ...(name && { name: name.trim() }), ...(description !== undefined && { description: description?.trim() || null }) } });
}

async function subscribe(chatId, userId) {
  const existing = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (existing) throw new ConflictError('Уже подписан');
  return prisma.chatMember.create({ data: { chatId, userId, role: 'MEMBER' } });
}

async function unsubscribe(chatId, userId) {
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (!member) throw new NotFoundError('Вы не подписаны');
  if (member.role === 'OWNER') throw new ForbiddenError('Владелец не может отписаться');
  await prisma.chatMember.delete({ where: { chatId_userId: { chatId, userId } } });
}

async function searchPublicChannels(q) {
  return prisma.chat.findMany({
    where: { isChannel: true, isPublic: true, ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}) },
    include: { _count: { select: { members: true } } }, orderBy: { createdAt: 'desc' }, take: 20
  });
}

module.exports = { createChannel, getChannel, updateChannel, subscribe, unsubscribe, searchPublicChannels };
