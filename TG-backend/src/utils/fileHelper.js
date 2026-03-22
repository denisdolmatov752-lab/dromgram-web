const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function getMediaPath(type) {
  const base = process.env.MEDIA_PATH || '/var/dromgram/media';
  const dirs = {
    photo: 'photos', video: 'videos', audio: 'audio',
    voice: 'audio', document: 'documents', avatar: 'avatars',
    sticker: 'stickers', story: 'stories', gif: 'gifs'
  };
  const subDir = dirs[type] || 'misc';
  const fullPath = path.join(base, subDir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
}

function getMediaUrl(type, filename) {
  const base = process.env.MEDIA_URL || 'https://orproject.ru/media';
  const dirs = {
    photo: 'photos', video: 'videos', audio: 'audio',
    voice: 'audio', document: 'documents', avatar: 'avatars',
    sticker: 'stickers', story: 'stories', gif: 'gifs'
  };
  const subDir = dirs[type] || 'misc';
  return `${base}/${subDir}/${filename}`;
}

function generateFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  return `${uuidv4()}${ext}`;
}

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    // ignore
  }
}

module.exports = { getMediaPath, getMediaUrl, generateFilename, deleteFile };
