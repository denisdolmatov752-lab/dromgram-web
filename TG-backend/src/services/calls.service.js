const { prisma } = require('../config/database');
const { NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

async function getCalls(userId) {
  return prisma.call.findMany({
    where: { OR: [{ callerId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: 'desc' }, take: 50,
    include: {
      caller: { select: { id:true, firstName:true, lastName:true, avatarUrl:true, avatarColor:true } }
    }
  });
}

async function initiateCall(callerId, receiverId, type) {
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) throw new NotFoundError('Пользователь не найден');
  return prisma.call.create({ data: { callerId, receiverId, type, status: 'CALLING' } });
}

async function acceptCall(callId, userId) {
  const call = await prisma.call.findUnique({ where: { id: callId } });
  if (!call) throw new NotFoundError('Звонок не найден');
  if (call.receiverId !== userId) throw new ForbiddenError('Нет прав');
  return prisma.call.update({ where: { id: callId }, data: { status: 'ACCEPTED', startedAt: new Date() } });
}

async function declineCall(callId, userId) {
  const call = await prisma.call.findUnique({ where: { id: callId } });
  if (!call) throw new NotFoundError('Звонок не найден');
  return prisma.call.update({ where: { id: callId }, data: { status: 'DECLINED', endedAt: new Date() } });
}

async function endCall(callId, userId) {
  const call = await prisma.call.findUnique({ where: { id: callId } });
  if (!call) throw new NotFoundError('Звонок не найден');
  const endedAt = new Date();
  const duration = call.startedAt ? Math.floor((endedAt - call.startedAt) / 1000) : 0;
  return prisma.call.update({ where: { id: callId }, data: { status: 'ENDED', endedAt, duration } });
}

module.exports = { getCalls, initiateCall, acceptCall, declineCall, endCall };
