const { prisma } = require('../config/database');
const { NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

async function getFolders(userId) {
  return prisma.chatFolder.findMany({ where: { userId }, orderBy: { position: 'asc' } });
}

async function createFolder(userId, { name, icon, filterJson, position }) {
  return prisma.chatFolder.create({ data: { userId, name, icon: icon || 'folder', filterJson: JSON.stringify(filterJson || {}), position: position || 0 } });
}

async function updateFolder(folderId, userId, { name, icon, filterJson }) {
  const folder = await prisma.chatFolder.findFirst({ where: { id: folderId, userId } });
  if (!folder) throw new NotFoundError('Папка не найдена');
  return prisma.chatFolder.update({ where: { id: folderId }, data: { ...(name && { name }), ...(icon && { icon }), ...(filterJson && { filterJson: JSON.stringify(filterJson) }) } });
}

async function deleteFolder(folderId, userId) {
  const folder = await prisma.chatFolder.findFirst({ where: { id: folderId, userId } });
  if (!folder) throw new NotFoundError('Папка не найдена');
  await prisma.chatFolder.delete({ where: { id: folderId } });
}

async function reorderFolders(userId, ids) {
  await Promise.all(ids.map((id, idx) => prisma.chatFolder.updateMany({ where: { id, userId }, data: { position: idx } })));
}

module.exports = { getFolders, createFolder, updateFolder, deleteFolder, reorderFolders };
