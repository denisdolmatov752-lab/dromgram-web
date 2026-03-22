const { prisma } = require('../config/database');
const { getMediaUrl } = require('../utils/fileHelper');
const { NotFoundError, ForbiddenError } = require('../middleware/errorHandler');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function uploadFile(file, chatId, userId) {
  const mime = file.mimetype;
  let type = 'document';
  if (mime.startsWith('image/')) type = 'photo';
  else if (mime.startsWith('video/')) type = 'video';
  else if (mime.startsWith('audio/')) type = 'audio';
  let mediaUrl = getMediaUrl(type, path.basename(file.path));
  let mediaWidth, mediaHeight;
  if (type === 'photo') {
    try {
      const meta = await sharp(file.path).metadata();
      mediaWidth = meta.width;
      mediaHeight = meta.height;
      const thumbPath = file.path.replace(/(\.[^.]+)$/, '_thumb$1');
      await sharp(file.path).resize(320, 320, { fit: 'inside' }).jpeg({ quality: 70 }).toFile(thumbPath);
    } catch (e) {}
  }
  return { url: mediaUrl, fileId: path.basename(file.path), size: file.size, mimeType: mime, width: mediaWidth, height: mediaHeight, duration: null, type };
}

async function uploadAvatar(file, userId) {
  const outputPath = file.path.replace(/(\.[^.]+)$/, '_400.jpg');
  await sharp(file.path).resize(400, 400, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(outputPath);
  const filename = path.basename(outputPath);
  const avatarUrl = getMediaUrl('avatar', filename);
  await prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
  return { avatarUrl };
}

async function deleteFile(fileId, userId) {
  const mediaPath = process.env.MEDIA_PATH || '/var/dromgram/media';
  const dirs = ['photos','videos','audio','documents','avatars','stickers','stories','gifs','misc'];
  for (const dir of dirs) {
    const fp = path.join(mediaPath, dir, fileId);
    if (fs.existsSync(fp)) { fs.unlinkSync(fp); return; }
  }
}

module.exports = { uploadFile, uploadAvatar, deleteFile };
