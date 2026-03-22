const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getMediaPath } = require('../utils/fileHelper');

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 52428800;

function createStorage(type) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, getMediaPath(type));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    }
  });
}

function fileFilter(allowedTypes) {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Недопустимый тип файла: ${file.mimetype}`), false);
    }
  };
}

const uploadAvatar = multer({
  storage: createStorage('avatar'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp'])
}).single('avatar');

const uploadMedia = multer({
  storage: createStorage('photo'),
  limits: { fileSize: MAX_SIZE }
}).single('file');

const uploadAudio = multer({
  storage: createStorage('audio'),
  limits: { fileSize: MAX_SIZE },
  fileFilter: fileFilter(['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/mp4', 'audio/aac'])
}).single('file');

const uploadStory = multer({
  storage: createStorage('story'),
  limits: { fileSize: MAX_SIZE }
}).single('media');

module.exports = { uploadAvatar, uploadMedia, uploadAudio, uploadStory };
