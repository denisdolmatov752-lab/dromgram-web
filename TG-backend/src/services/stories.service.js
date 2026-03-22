const { prisma } = require('../config/database');
const { NotFoundError, ForbiddenError } = require('../middleware/errorHandler');
const { getMediaUrl } = require('../utils/fileHelper');
const path = require('path');

async function getStories(userId) {
  const contacts = await prisma.contact.findMany({ where: { userId }, select: { contactId: true } });
  const contactIds = contacts.map(c => c.contactId);
  return prisma.story.findMany({
    where: { userId: { in: contactIds }, expiresAt: { gt: new Date() } },
    include: { user: { select: { id:true, firstName:true, lastName:true, avatarUrl:true } } },
    orderBy: { createdAt: 'desc' }
  });
}

async function getUserStories(targetUserId) {
  return prisma.story.findMany({
    where: { userId: targetUserId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'asc' }
  });
}

async function createStory(userId, file, text) {
  const mime = file.mimetype;
  const mediaType = mime.startsWith('video/') ? 'video' : 'photo';
  const mediaUrl = getMediaUrl('story', path.basename(file.path));
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return prisma.story.create({ data: { userId, mediaUrl, mediaType, text: text?.trim() || null, expiresAt } });
}

async function deleteStory(storyId, userId) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw new NotFoundError('Сторис не найдена');
  if (story.userId !== userId) throw new ForbiddenError('Нет прав');
  await prisma.story.delete({ where: { id: storyId } });
}

async function viewStory(storyId, userId) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) return;
  await prisma.storyView.upsert({
    where: { storyId_userId: { storyId, userId } },
    create: { storyId, userId },
    update: {}
  });
  await prisma.story.update({ where: { id: storyId }, data: { viewCount: { increment: 1 } } });
}

async function getStoryViews(storyId, userId) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw new NotFoundError('Сторис не найдена');
  if (story.userId !== userId) throw new ForbiddenError('Нет прав');
  return prisma.storyView.findMany({
    where: { storyId },
    include: { user: { select: { id:true, firstName:true, lastName:true, avatarUrl:true } } },
    orderBy: { viewedAt: 'desc' }
  });
}

module.exports = { getStories, getUserStories, createStory, deleteStory, viewStory, getStoryViews };
