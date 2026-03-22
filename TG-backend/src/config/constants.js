module.exports = {
  OTP_EXPIRES_IN: 5 * 60, // 5 минут в секундах
  OTP_MAX_ATTEMPTS: 3,
  OTP_RATE_LIMIT: 3, // макс OTP за 10 минут
  OTP_RATE_WINDOW: 10 * 60, // 10 минут
  DEV_OTP_CODE: '12345',
  JWT_EXPIRES_IN: '30d',
  JWT_REFRESH_EXPIRES_IN: '90d',
  MAX_FILE_SIZE: 52428800, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/mp4'],
  ALLOWED_DOC_TYPES: [
    'application/pdf', 'application/zip', 'application/x-zip-compressed',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/json'
  ],
  AVATAR_SIZE: 400,
  THUMB_SIZE: 100,
  TYPING_TIMEOUT: 5000,
  ONLINE_TIMEOUT: 60000,
  MESSAGES_PER_PAGE: 50,
  CHATS_PER_PAGE: 30,
  STORY_TTL: 24 * 60 * 60, // 24 часа
  AVATAR_COLORS: [
    '#FF516A', '#FF7519', '#EBAC00', '#26B35E',
    '#00B9FF', '#0072BB', '#6B72FF', '#FF5DA2', '#E11584'
  ]
};
