const { prisma } = require('../config/database');

async function globalSearch(userId, q, types = ['users','chats','messages']) {
  const results = {};
  if (types.includes('users') && q) {
    results.users = await prisma.user.findMany({
      where: { OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } }
      ], isBanned: false },
      select: { id:true, firstName:true, lastName:true, username:true, avatarUrl:true, avatarColor:true, isOnline:true },
      take: 10
    });
  }
  if (types.includes('chats') && q) {
    const members = await prisma.chatMember.findMany({ where: { userId }, select: { chatId: true } });
    const chatIds = members.map(m => m.chatId);
    results.chats = await prisma.chat.findMany({
      where: { id: { in: chatIds }, name: { contains: q, mode: 'insensitive' } },
      select: { id:true, name:true, type:true, avatarUrl:true, _count: { select: { members: true } } },
      take: 10
    });
  }
  if (types.includes('messages') && q) {
    const members = await prisma.chatMember.findMany({ where: { userId }, select: { chatId: true } });
    const chatIds = members.map(m => m.chatId);
    results.messages = await prisma.message.findMany({
      where: { chatId: { in: chatIds }, text: { contains: q, mode: 'insensitive' }, isDeleted: false },
      include: { sender: { select: { firstName:true, lastName:true } }, chat: { select: { id:true, name:true, type:true } } },
      orderBy: { createdAt: 'desc' }, take: 20
    });
  }
  return results;
}

module.exports = { globalSearch };
