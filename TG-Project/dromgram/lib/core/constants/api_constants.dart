class ApiConstants {
  static const String baseUrl = 'https://orproject.ru';
  static const String apiUrl = '$baseUrl/api';
  static const String wsUrl = baseUrl;
  static const String mediaUrl = '$baseUrl/media';

  // Auth
  static const String sendCode = '/auth/send-code';
  static const String verifyCode = '/auth/verify-code';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String logoutAll = '/auth/logout-all';
  static const String qrLogin = '/auth/qr';
  static const String qrVerify = '/auth/qr/verify';

  // Users
  static const String me = '/users/me';
  static const String meAvatar = '/users/me/avatar';
  static const String meSessions = '/users/me/sessions';
  static const String mePrivacy = '/users/me/privacy';
  static const String mePassword = '/users/me/password';

  // Chats
  static const String chats = '/chats';
  static const String privateChat = '/chats/private';

  // Messages
  static const String messages = '/messages';

  // Groups
  static const String groups = '/groups';

  // Channels
  static const String channels = '/channels';

  // Media
  static const String mediaUpload = '/media/upload';

  // Contacts
  static const String contacts = '/contacts';
  static const String blockedContacts = '/contacts/blocked';

  // Calls
  static const String calls = '/calls';

  // Stories
  static const String stories = '/stories';

  // Search
  static const String search = '/search';

  // Stickers
  static const String stickerSets = '/stickers/sets';
  static const String recentStickers = '/stickers/recent';

  // Folders
  static const String folders = '/folders';
}
