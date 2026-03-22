const { prisma } = require('../config/database');
const { NotFoundError, ForbiddenError, ConflictError } = require('../middleware/errorHandler');
const { CHATS_PER_PAGE } = require('../config/constants');

async function getChats(userId, page = 1) {
  const members = await prisma.chatMember.findMany({
    where: { userId, isArchived: false },
    include: {
      chat: {
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 1,
            include: { sender: { select: { firstName: true, lastName: true } } } },
          members: { where: { userId }, select: { isMuted: true, isPinned: true, lastReadMessageId: true } }
        }
      }
    },
    orderBy: { joinedAt: 'desc' }
  });
  const chatsWithUnread = await Promise.all(members.map(async (m) => {
    const unreadCount = await prisma.message.count({
      where: { chatId: m.chatId, isDeleted: false, NOT: { senderId: userId },
        ...(m.lastReadMessageId ? { createdAt: { gt: (await prisma.message.findUnique({ where: { id: m.lastReadMessageId } }))?.createdAt || new Date(0) } } : {}) }
    });
    return { ...m.chat, member: m, unreadCount };
  }));
  return chatsWithUnread.sort((a, b) => {
    if (a.member?.isPinned !== b.member?.isPinned) return a.member?.isPinned ? -1 : 1;
    const aTime = a.messages[0]?.createdAt || a.createdAt;
    const bTime = b.messages[0]?.createdAt || b.createdAt;
    return new Date(bTime) - new Date(aTime);
  });
}

async function getChatById(chatId, userId) {
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (!member) throw new ForbiddenError('Нет доступа к чату');
  const chat = await prisma.chat.findUnique({ where: { id: chatId }, include: {
    members: { include: { user: { select: { id:true, firstName:true, lastName:true, username:true, avatarUrl:true, avatarColor:true, isOnline:true, lastSeen:true } } } }
  }});
  if (!chat) throw new NotFoundError('Чат не найден');
  return chat;
}

async function createPrivateChat(userId, targetId) {
  if (userId === targetId) {
    // Избранное
    let saved = await prisma.chat.findFirst({ where: { type: 'SAVED', members: { some: { userId } } } });
    if (!saved) {
      saved = await prisma.chat.create({ data: { type: 'SAVED', members: { create: { userId, role: 'OWNER' } } } });
    }
    return saved;
  }
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) throw new NotFoundError('Пользователь не найден');
  // Проверить не заблокирован ли
  const blocked = await prisma.blockedUser.findUnique({ where: { blockerId_blockedId: { blockerId: targetId, blockedId: userId } } });
  if (blocked) throw new ForbiddenError('Пользователь заблокировал вас');
  // Найти существующий личный чат
  const existing = await prisma.chat.findFirst({
    where: { type: 'PRIVATE', members: { every: { userId: { in: [userId, targetId] } }, some: { userId } } }
  });
  if (existing) return existing;
  return prisma.chat.create({
    data: { type: 'PRIVATE', members: { create: [{ userId, role: 'MEMBER' }, { userId: targetId, role: 'MEMBER' }] } }
  });
}

async function muteChat(chatId, userId, muteUntil) {
  await prisma.chatMember.update({ where: { chatId_userId: { chatId, userId } }, data: { isMuted: true, muteUntil: muteUntil || null } });
}

async function unmuteChat(chatId, userId) {
  await prisma.chatMember.update({ where: { chatId_userId: { chatId, userId } }, data: { isMuted: false, muteUntil: null } });
}

async function pinChat(chatId, userId) {
  await prisma.chatMember.update({ where: { chatId_userId: { chatId, userId } }, data: { isPinned: true } });
}

async function unpinChat(chatId, userId) {
  await prisma.chatMember.update({ where: { chatId_userId: { chatId, userId } }, data: { isPinned: false } });
}

async function archiveChat(chatId, userId) {
  await prisma.chatMember.update({ where: { chatId_userId: { chatId, userId } }, data: { isArchived: true } });
}

async function unarchiveChat(chatId, userId) {
  await prisma.chatMember.update({ where: { chatId_userId: { chatId, userId } }, data: { isArchived: false } });
}

async function deleteChat(chatId, userId) {
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat) throw new NotFoundError('Чат не найден');
  if (chat.type !== 'PRIVATE' && chat.type !== 'SAVED') throw new ForbiddenError('Можно удалить только личный чат');
  await prisma.chatMember.delete({ where: { chatId_userId: { chatId, userId } } });
}

async function getChatMedia(chatId, userId, type, cursor, limit = 20) {
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (!member) throw new ForbiddenError('Нет доступа');
  return prisma.message.findMany({
    where: { chatId, type, isDeleted: false, ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}) },
    include: { sender: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' }, take: limit
  });
}

module.exports = { getChats, getChatById, createPrivateChat, muteChat, unmuteChat, pinChat, unpinChat, archiveChat, unarchiveChat, deleteChat, getChatMedia };
