const { prisma } = require('../config/database');
const { NotFoundError, ForbiddenError, ConflictError, ValidationError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

async function createGroup(creatorId, name, memberIds, avatarUrl) {
  if (!name?.trim()) throw new ValidationError('Название группы обязательно');
  const uniqueIds = [...new Set([creatorId, ...memberIds])];
  const chat = await prisma.chat.create({
    data: {
      type: 'GROUP', name: name.trim(), avatarUrl: avatarUrl || null,
      members: { create: uniqueIds.map(id => ({ userId: id, role: id === creatorId ? 'OWNER' : 'MEMBER' })) }
    },
    include: { members: { include: { user: { select: { id:true, firstName:true, lastName:true, avatarUrl:true } } } } }
  });
  await prisma.message.create({ data: { chatId: chat.id, senderId: creatorId, type: 'SYSTEM', text: 'Группа создана', status: 'SENT' } });
  return chat;
}

async function getGroup(chatId, userId) {
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (!member) throw new ForbiddenError('Нет доступа');
  return prisma.chat.findUnique({ where: { id: chatId }, include: {
    members: { include: { user: { select: { id:true, firstName:true, lastName:true, username:true, avatarUrl:true, avatarColor:true, isOnline:true } } }, orderBy: { joinedAt: 'asc' } }
  }});
}

async function updateGroup(chatId, userId, { name, description }) {
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (!member || !['ADMIN','OWNER'].includes(member.role)) throw new ForbiddenError('Нет прав');
  return prisma.chat.update({ where: { id: chatId }, data: { ...(name && { name: name.trim() }), ...(description !== undefined && { description: description?.trim() || null }) } });
}

async function addMember(chatId, adderId, userId) {
  const adder = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: adderId } } });
  if (!adder || !['ADMIN','OWNER'].includes(adder.role)) throw new ForbiddenError('Нет прав добавлять участников');
  const existing = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (existing) throw new ConflictError('Пользователь уже в группе');
  const member = await prisma.chatMember.create({ data: { chatId, userId, role: 'MEMBER' } });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { firstName:true } });
  const adderUser = await prisma.user.findUnique({ where: { id: adderId }, select: { firstName:true } });
  await prisma.message.create({ data: { chatId, senderId: adderId, type: 'SYSTEM', text: `${adderUser.firstName} добавил ${user.firstName}`, status: 'SENT' } });
  return member;
}

async function removeMember(chatId, removerId, userId) {
  const remover = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: removerId } } });
  if (!remover || !['ADMIN','OWNER'].includes(remover.role)) throw new ForbiddenError('Нет прав');
  const target = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (!target) throw new NotFoundError('Участник не найден');
  if (target.role === 'OWNER') throw new ForbiddenError('Нельзя удалить владельца');
  await prisma.chatMember.delete({ where: { chatId_userId: { chatId, userId } } });
}

async function updateMemberRole(chatId, adminId, userId, role) {
  const admin = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: adminId } } });
  if (!admin || admin.role !== 'OWNER') throw new ForbiddenError('Только владелец может менять роли');
  await prisma.chatMember.update({ where: { chatId_userId: { chatId, userId } }, data: { role } });
}

async function leaveGroup(chatId, userId) {
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (!member) throw new NotFoundError('Вы не состоите в этой группе');
  if (member.role === 'OWNER') {
    const others = await prisma.chatMember.findFirst({ where: { chatId, userId: { not: userId }, role: { in: ['ADMIN','MEMBER'] } } });
    if (others) await prisma.chatMember.update({ where: { id: others.id }, data: { role: 'OWNER' } });
  }
  await prisma.chatMember.delete({ where: { chatId_userId: { chatId, userId } } });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { firstName:true } });
  await prisma.message.create({ data: { chatId, senderId: userId, type: 'SYSTEM', text: `${user.firstName} покинул группу`, status: 'SENT' } });
}

async function getInviteLink(chatId, userId) {
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (!member || !['ADMIN','OWNER'].includes(member.role)) throw new ForbiddenError('Нет прав');
  const code = uuidv4().replace(/-/g,'').substring(0,16);
  await prisma.chat.update({ where: { id: chatId }, data: { username: `invite_${code}` } });
  return { inviteLink: `https://dromgram.app/join/${code}`, code };
}

async function joinByInvite(code, userId) {
  const chat = await prisma.chat.findFirst({ where: { username: { contains: code } } });
  if (!chat) throw new NotFoundError('Группа не найдена или ссылка недействительна');
  const existing = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId: chat.id, userId } } });
  if (existing) return chat;
  await prisma.chatMember.create({ data: { chatId: chat.id, userId, role: 'MEMBER' } });
  return chat;
}

module.exports = { createGroup, getGroup, updateGroup, addMember, removeMember, updateMemberRole, leaveGroup, getInviteLink, joinByInvite };
