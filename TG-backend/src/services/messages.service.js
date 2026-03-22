const { prisma } = require('../config/database');
const { NotFoundError, ForbiddenError, ValidationError } = require('../middleware/errorHandler');
const { MESSAGES_PER_PAGE } = require('../config/constants');

async function getMessages(chatId, userId, before, limit = MESSAGES_PER_PAGE) {
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (!member) throw new ForbiddenError('Нет доступа к чату');
  const where = { chatId, isDeleted: false, ...(before ? { createdAt: { lt: new Date(before) } } : {}) };
  const messages = await prisma.message.findMany({
    where, orderBy: { createdAt: 'desc' }, take: limit,
    include: {
      sender: { select: { id:true, firstName:true, lastName:true, avatarUrl:true, avatarColor:true } },
      replyTo: { include: { sender: { select: { firstName:true } } } },
      reactions: { include: { user: { select: { id:true, firstName:true } } } },
      readBy: { select: { userId:true } }
    }
  });
  return messages.reverse();
}

async function sendMessage(chatId, senderId, { type = 'TEXT', text, replyToId, forwardFromId, forwardFromName, latitude, longitude, pollData, fileName, mediaUrl, mediaType, mediaSize, mediaDuration, mediaWidth, mediaHeight, mimeType, waveform, stickerSetId, stickerFileId, giftId }) {
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: senderId } } });
  if (!member) throw new ForbiddenError('Нет доступа к чату');
  if (type === 'TEXT' && !text?.trim()) throw new ValidationError('Текст сообщения пуст');
  const message = await prisma.message.create({
    data: {
      chatId, senderId, type, text: text?.trim() || null, replyToId: replyToId || null,
      forwardFromId: forwardFromId || null, forwardFromName: forwardFromName || null,
      latitude, longitude, pollData: pollData ? JSON.stringify(pollData) : null,
      fileName, mediaUrl, mediaType, mediaSize, mediaDuration, mediaWidth, mediaHeight, mimeType,
      waveform: waveform ? JSON.stringify(waveform) : null,
      stickerSetId, stickerFileId, giftId, status: 'SENT'
    },
    include: {
      sender: { select: { id:true, firstName:true, lastName:true, avatarUrl:true, avatarColor:true } },
      replyTo: { include: { sender: { select: { firstName:true } } } },
      reactions: true, readBy: { select: { userId:true } }
    }
  });
  await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });
  return message;
}

async function editMessage(messageId, userId, text) {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new NotFoundError('Сообщение не найдено');
  if (message.senderId !== userId) throw new ForbiddenError('Нельзя редактировать чужое сообщение');
  if (!['TEXT'].includes(message.type)) throw new ValidationError('Можно редактировать только текстовые сообщения');
  if (!text?.trim()) throw new ValidationError('Текст не может быть пустым');
  return prisma.message.update({ where: { id: messageId }, data: { text: text.trim(), isEdited: true, editedAt: new Date() } });
}

async function deleteMessage(messageId, userId, forAll = false) {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new NotFoundError('Сообщение не найдено');
  const isSender = message.senderId === userId;
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId: message.chatId, userId } } });
  const isAdmin = member?.role === 'ADMIN' || member?.role === 'OWNER';
  if (!isSender && !isAdmin) throw new ForbiddenError('Нет прав для удаления');
  if (forAll && (isSender || isAdmin)) {
    await prisma.message.update({ where: { id: messageId }, data: { isDeleted: true, deletedForAll: true, text: null, mediaUrl: null } });
  } else {
    await prisma.message.update({ where: { id: messageId }, data: { isDeleted: true } });
  }
}

async function markRead(messageId, userId) {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) return;
  await prisma.messageRead.upsert({
    where: { messageId_userId: { messageId, userId } },
    create: { messageId, userId },
    update: { readAt: new Date() }
  });
  if (message.senderId !== userId) {
    await prisma.message.update({ where: { id: messageId }, data: { status: 'READ' } });
  }
  await prisma.chatMember.update({ where: { chatId_userId: { chatId: message.chatId, userId } }, data: { lastReadMessageId: messageId } });
  return { messageId, chatId: message.chatId, userId };
}

async function addReaction(messageId, userId, emoji) {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new NotFoundError('Сообщение не найдено');
  const reaction = await prisma.reaction.upsert({
    where: { messageId_userId_emoji: { messageId, userId, emoji } },
    create: { messageId, userId, emoji },
    update: {}
  });
  return reaction;
}

async function removeReaction(messageId, userId, emoji) {
  const reaction = await prisma.reaction.findUnique({ where: { messageId_userId_emoji: { messageId, userId, emoji } } });
  if (!reaction) throw new NotFoundError('Реакция не найдена');
  await prisma.reaction.delete({ where: { messageId_userId_emoji: { messageId, userId, emoji } } });
}

async function pinMessage(messageId, chatId, userId) {
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (!member || !['ADMIN','OWNER'].includes(member.role)) throw new ForbiddenError('Только администратор может закрепить сообщение');
  await prisma.message.update({ where: { id: messageId }, data: { isPinned: true } });
  await prisma.chat.update({ where: { id: chatId }, data: { pinnedMessageId: messageId } });
}

async function unpinMessage(messageId, chatId, userId) {
  const member = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } });
  if (!member || !['ADMIN','OWNER'].includes(member.role)) throw new ForbiddenError('Нет прав');
  await prisma.message.update({ where: { id: messageId }, data: { isPinned: false } });
  await prisma.chat.update({ where: { id: chatId }, data: { pinnedMessageId: null } });
}

async function searchMessages(userId, chatId, q, type) {
  const where = {
    ...(chatId ? { chatId } : {}),
    isDeleted: false,
    ...(type ? { type } : {}),
    ...(q ? { text: { contains: q, mode: 'insensitive' } } : {}),
    chat: { members: { some: { userId } } }
  };
  return prisma.message.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50,
    include: { sender: { select: { firstName:true, lastName:true } }, chat: { select: { id:true, name:true, type:true } } }
  });
}

module.exports = { getMessages, sendMessage, editMessage, deleteMessage, markRead, addReaction, removeReaction, pinMessage, unpinMessage, searchMessages };
