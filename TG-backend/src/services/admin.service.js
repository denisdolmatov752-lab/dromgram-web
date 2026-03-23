const { prisma } = require('../config/database');

async function getUsers(page = 1, limit = 20, search, filter) {
  const where = {
    ...(search ? { OR: [
      { firstName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { username: { contains: search, mode: 'insensitive' } }
    ]} : {}),
    ...(filter === 'banned' ? { isBanned: true } : {}),
    ...(filter === 'premium' ? { isPremium: true } : {}),
    ...(filter === 'bots' ? { isBot: true } : {})
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where })
  ]);
  return { users, total, pages: Math.ceil(total/limit), page };
}

async function banUser(userId) {
  return prisma.user.update({ where: { id: userId }, data: { isBanned: true } });
}

async function unbanUser(userId) {
  return prisma.user.update({ where: { id: userId }, data: { isBanned: false } });
}

async function deleteUser(userId) {
  await prisma.user.delete({ where: { id: userId } });
}

async function getStats() {
  const [totalUsers, onlineUsers, totalMessages, todayMessages, newUsersWeek] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isOnline: true } }),
    prisma.message.count({ where: { isDeleted: false } }),
    prisma.message.count({ where: { isDeleted: false, createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7*24*60*60*1000) } } })
  ]);
  return { totalUsers, onlineUsers, totalMessages, todayMessages, newUsersWeek };
}

async function getChats(page = 1, limit = 20) {
  const [chats, total] = await Promise.all([
    prisma.chat.findMany({ skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members:true, messages:true } } } }),
    prisma.chat.count()
  ]);
  return { chats, total, pages: Math.ceil(total/limit) };
}

async function deleteMessage(messageId) {
  return prisma.message.update({ where: { id: messageId }, data: { isDeleted: true, deletedForAll: true, text: null, mediaUrl: null } });
}

async function setVerified(userId, isVerified) {
  return prisma.user.update({ where: { id: userId }, data: { isVerified: !!isVerified } });
}

async function addStars(userId, stars) {
  return prisma.user.update({ where: { id: userId }, data: { stars: { increment: parseInt(stars) || 0 } } });
}

module.exports = { getUsers, banUser, unbanUser, deleteUser, getStats, getChats, deleteMessage, setVerified, addStars };
