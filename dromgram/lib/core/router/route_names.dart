class RouteNames {
  static const splash = '/';
  static const phone = '/auth/phone';
  static const otp = '/auth/otp';
  static const register = '/auth/register';
  static const qrLogin = '/auth/qr';
  static const chats = '/chats';
  static const chat = '/chat/:id';
  static const contacts = '/contacts';
  static const calls = '/calls';
  static const channels = '/channels';
  static const settings = '/settings';
  static const editProfile = '/settings/profile';
  static const privacy = '/settings/privacy';
  static const sessions = '/settings/sessions';
  static const notifications = '/settings/notifications';
  static const storage = '/settings/storage';
  static const themes = '/settings/themes';
  static const twoFa = '/settings/2fa';
  static const profile = '/profile/:id';
  static const search = '/search';
  static const mediaViewer = '/media';
  static const callScreen = '/call';
  static const gifts = '/gifts';
  static const premium = '/premium';
  static const stars = '/stars';
  static const blockedUsers = '/settings/blocked';

  static String chatRoute(String id) => '/chat/$id';
  static String profileRoute(String id) => '/profile/$id';
}
