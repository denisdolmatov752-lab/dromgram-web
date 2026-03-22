const { prisma } = require('../config/database');
const { NotFoundError } = require('../middleware/errorHandler');

async function getStickerSets() {
  return prisma.stickerSet.findMany({ include: { stickers: { take: 1 } }, orderBy: { isOfficial: 'desc' } });
}

async function getStickerSet(setId) {
  const set = await prisma.stickerSet.findUnique({ where: { id: setId }, include: { stickers: true } });
  if (!set) throw new NotFoundError('Набор стикеров не найден');
  return set;
}

async function getRecentStickers(userId) {
  const recent = await prisma.message.findMany({
    where: { senderId: userId, type: 'STICKER', stickerFileId: { not: null } },
    select: { stickerFileId:true, stickerSetId:true }, orderBy: { createdAt: 'desc' }, take: 20
  });
  const fileIds = [...new Set(recent.map(r => r.stickerFileId))];
  return prisma.sticker.findMany({ where: { fileId: { in: fileIds } } });
}

async function getTrendingStickers() {
  return prisma.stickerSet.findMany({ where: { isOfficial: true }, include: { stickers: { take: 5 } }, take: 10 });
}

module.exports = { getStickerSets, getStickerSet, getRecentStickers, getTrendingStickers };
