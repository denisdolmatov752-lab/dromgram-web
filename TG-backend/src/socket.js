const { Server } = require('socket.io');
const { verifyToken } = require('./utils/jwt');
const { prisma } = require('./config/database');
const { redis } = require('./config/redis');
const logger = require('./config/logger');

const typingTimers = new Map();

function initSocket(httpServer) {
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true, methods: ['GET','POST'] },
    transports: ['websocket','polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token?.replace('Bearer ', '');
      if (!token) return next(new Error('Токен не предоставлен'));
      const payload = verifyToken(token);
      if (!payload) return next(new Error('Недействительный токен'));
      const blacklisted = await redis.get(`blacklist:${token}`);
      if (blacklisted) return next(new Error('Токен отозван'));
      const session = await prisma.session.findUnique({ where: { token } });
      if (!session || !session.isActive) return next(new Error('Сессия недействительна'));
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user || user.isBanned) return next(new Error('Пользователь заблокирован'));
      socket.data.userId = user.id;
      socket.data.user = user;
      next();
    } catch (err) {
      logger.error('Socket auth error:', err);
      next(new Error('Ошибка аутентификации'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.userId;
    logger.info(`Socket connected: userId=${userId}, socketId=${socket.id}`);

    // Join personal room
    socket.join(`user:${userId}`);

    // Join all chat rooms
    try {
      const members = await prisma.chatMember.findMany({ where: { userId }, select: { chatId: true } });
      for (const m of members) socket.join(`chat:${m.chatId}`);
    } catch (err) { logger.error('Error joining chat rooms:', err); }

    // Mark online
    try {
      await prisma.user.update({ where: { id: userId }, data: { isOnline: true, lastSeen: new Date() } });
      // Notify contacts
      const contacts = await prisma.contact.findMany({ where: { contactId: userId }, select: { userId: true } });
      for (const c of contacts) io.to(`user:${c.userId}`).emit('user_online', { userId });
    } catch (err) { logger.error('Error setting online:', err); }

    // Events from client
    socket.on('join_chat', ({ chatId }) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('leave_chat', ({ chatId }) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('typing_start', async ({ chatId }) => {
      const user = socket.data.user;
      socket.to(`chat:${chatId}`).emit('typing_start', { chatId, userId, userName: user.firstName });
      const key = `typing:${chatId}:${userId}`;
      if (typingTimers.has(key)) clearTimeout(typingTimers.get(key));
      const timer = setTimeout(() => {
        socket.to(`chat:${chatId}`).emit('typing_stop', { chatId, userId });
        typingTimers.delete(key);
      }, 5000);
      typingTimers.set(key, timer);
    });

    socket.on('typing_stop', ({ chatId }) => {
      const key = `typing:${chatId}:${userId}`;
      if (typingTimers.has(key)) { clearTimeout(typingTimers.get(key)); typingTimers.delete(key); }
      socket.to(`chat:${chatId}`).emit('typing_stop', { chatId, userId });
    });

    socket.on('message_read', async ({ messageId, chatId }) => {
      try {
        const { markRead } = require('./services/messages.service');
        const result = await markRead(messageId, userId);
        if (result) {
          io.to(`chat:${chatId}`).emit('message_read', { messageId, chatId, userId, readAt: new Date() });
        }
      } catch (err) { logger.error('message_read error:', err); }
    });

    socket.on('call_offer', ({ userId: receiverId, type, sdpOffer }) => {
      io.to(`user:${receiverId}`).emit('call_incoming', { callerId: userId, caller: socket.data.user, type, sdpOffer });
    });

    socket.on('call_answer', ({ callId, sdpAnswer, callerId }) => {
      io.to(`user:${callerId}`).emit('call_accepted', { callId, sdpAnswer });
    });

    socket.on('call_ice', ({ callId, candidate, targetUserId }) => {
      io.to(`user:${targetUserId}`).emit('call_ice', { callId, candidate });
    });

    socket.on('call_end', ({ callId, targetUserId }) => {
      if (targetUserId) io.to(`user:${targetUserId}`).emit('call_ended', { callId });
    });

    socket.on('call_decline', ({ callId, callerId }) => {
      io.to(`user:${callerId}`).emit('call_declined', { callId });
    });

    socket.on('presence', async () => {
      try {
        await prisma.user.update({ where: { id: userId }, data: { lastSeen: new Date() } });
      } catch (err) {}
    });

    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: userId=${userId}`);
      try {
        const lastSeen = new Date();
        await prisma.user.update({ where: { id: userId }, data: { isOnline: false, lastSeen } });
        const contacts = await prisma.contact.findMany({ where: { contactId: userId }, select: { userId: true } });
        for (const c of contacts) io.to(`user:${c.userId}`).emit('user_offline', { userId, lastSeen });
      } catch (err) { logger.error('Error on disconnect:', err); }
    });
  });

  // Helper to emit to chat (used by HTTP handlers)
  io.emitToChat = (chatId, event, data) => io.to(`chat:${chatId}`).emit(event, data);
  io.emitToUser = (userId, event, data) => io.to(`user:${userId}`).emit(event, data);

  global.io = io;
  return io;
}

module.exports = { initSocket };
