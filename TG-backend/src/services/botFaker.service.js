const { prisma } = require('../config/database');

const BOT_USERNAME = 'DRomGramBot';
const BOT_USER_ID = 'bot-dromgram-system';

/**
 * Initialize or get the bot user
 */
async function getOrCreateBotUser() {
  try {
    let botUser = await prisma.user.findFirst({
      where: { username: BOT_USERNAME }
    });

    if (!botUser) {
      botUser = await prisma.user.create({
        data: {
          id: BOT_USER_ID,
          phone: '+7999999999',
          firstName: 'DRomGram',
          lastName: 'Bot',
          username: BOT_USERNAME,
          bio: 'Официальный бот DRomGram 🤖',
          avatarColor: '#2AABEE',
          isOnline: true,
          isPremium: true,
          isAdmin: true,
          isVerified: true,
          isBanned: false
        }
      });
    }

    return botUser;
  } catch (err) {
    console.error('Error getting/creating bot user:', err);
    throw err;
  }
}

/**
 * Handle bot commands
 * Commands: /start, /help, /stars, /admdenis
 */
async function handleBotCommand(userId, command) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isAdmin = userId === process.env.ADMIN_USER_ID;

    switch (command.split(' ')[0]) {
      case '/start':
        return {
          text: `Привет, ${user.firstName}! 👋\n\nДобро пожаловать в DRomGram Bot! Я помогу вам управлять вашим аккаунтом и узнать информацию о вашем профиле.\n\nИспользуйте /help для просмотра доступных команд.`
        };

      case '/help':
        const helpText = `/start - Приветствие\n/help - Помощь\n/stars - Ваш баланс звёзд${isAdmin ? '\n/admdenis - Панель администратора' : ''}`;
        return { text: helpText };

      case '/stars': {
        const starBalance = user.stars || 0;
        return {
          text: `⭐ Ваш баланс звёзд: ${starBalance}\n\nЗвёзды используются для:\n• Отправки подарков\n• Поддержки авторов\n• Доступа к премиум контенту`
        };
      }

      case '/admdenis': {
        if (!isAdmin) {
          return { text: '❌ У вас нет доступа к этой команде.' };
        }
        return {
          text: '⚙️ Панель администратора DRomGram',
          options: [
            { action: 'give_stars', label: 'Выдать звёзды' },
            { action: 'give_verified', label: 'Выдать верификацию' },
            { action: 'ban_user', label: 'Забанить пользователя' },
            { action: 'unban_user', label: 'Разбанить пользователя' }
          ]
        };
      }

      default:
        return {
          text: 'ℹ️ Неизвестная команда. Используйте /help для просмотра доступных команд.'
        };
    }
  } catch (err) {
    console.error('Error handling bot command:', err);
    return { text: '❌ Ошибка при обработке команды. Попробуйте позже.' };
  }
}

/**
 * Execute admin command
 * /give_stars @username 1000
 * /give_verified @username
 */
async function handleAdminCommand(adminId, command) {
  try {
    const isAdmin = adminId === process.env.ADMIN_USER_ID;
    if (!isAdmin) {
      return { success: false, message: 'Access denied' };
    }

    const parts = command.split(' ');
    const action = parts[0];
    const targetUsername = parts[1]?.replace('@', '');
    const amount = parseInt(parts[2]) || 0;

    if (!targetUsername) {
      return { success: false, message: 'Target user not specified' };
    }

    const targetUser = await prisma.user.findUnique({
      where: { username: targetUsername }
    });

    if (!targetUser) {
      return { success: false, message: 'User not found' };
    }

    switch (action) {
      case '/give_stars': {
        if (amount <= 0) {
          return { success: false, message: 'Amount must be positive' };
        }

        const updatedUser = await prisma.user.update({
          where: { id: targetUser.id },
          data: { stars: (targetUser.stars || 0) + amount }
        });

        // Log transaction
        await prisma.starTransaction.create({
          data: {
            userId: targetUser.id,
            type: 'admin_gift',
            description: `Подарок от администратора`,
            amount: amount,
            icon: '⭐'
          }
        });

        return {
          success: true,
          message: `Выдано ${amount} звёзд пользователю @${targetUsername}. Новый баланс: ${updatedUser.stars}`
        };
      }

      case '/give_verified': {
        const updatedUser = await prisma.user.update({
          where: { id: targetUser.id },
          data: { isVerified: true }
        });

        return {
          success: true,
          message: `Верификация выдана пользователю @${targetUsername} ✓`
        };
      }

      case '/ban_user': {
        const updatedUser = await prisma.user.update({
          where: { id: targetUser.id },
          data: { isBanned: true }
        });

        return {
          success: true,
          message: `Пользователь @${targetUsername} забанен`
        };
      }

      case '/unban_user': {
        const updatedUser = await prisma.user.update({
          where: { id: targetUser.id },
          data: { isBanned: false }
        });

        return {
          success: true,
          message: `Пользователь @${targetUsername} разбанен`
        };
      }

      default:
        return { success: false, message: 'Unknown admin command' };
    }
  } catch (err) {
    console.error('Error handling admin command:', err);
    return { success: false, message: 'Error executing command' };
  }
}

/**
 * Find bot in search results
 */
async function findBotInSearch(query) {
  if (!query || !query.toLowerCase().includes(BOT_USERNAME.toLowerCase())) {
    return null;
  }

  return await getOrCreateBotUser();
}

module.exports = {
  getOrCreateBotUser,
  handleBotCommand,
  handleAdminCommand,
  findBotInSearch,
  BOT_USERNAME,
  BOT_USER_ID
};
