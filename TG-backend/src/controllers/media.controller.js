const mediaService = require('../services/media.service');
const path = require('path');

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Файл не загружен' });
    const result = await mediaService.uploadFile(req.file, req.body.chatId, req.user.id);
    res.json({ success: true, data: result });
  } catch(err) { next(err); }
};

exports.getFile = (req, res, next) => {
  const mediaPath = process.env.MEDIA_PATH || '/var/dromgram/media';
  const fileId = req.params.fileId;
  const dirs = ['photos','videos','audio','documents','avatars','stickers','stories','gifs','misc'];
  const fs = require('fs');
  for (const dir of dirs) {
    const fp = path.join(mediaPath, dir, fileId);
    if (fs.existsSync(fp)) return res.sendFile(fp);
  }
  res.status(404).json({ success: false, error: 'Файл не найден' });
};

exports.deleteFile = async (req, res, next) => {
  try {
    await mediaService.deleteFile(req.params.fileId, req.user.id);
    res.json({ success: true, data: {} });
  } catch(err) { next(err); }
};
