import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/splash_screen.dart';
import '../../features/auth/presentation/phone_screen.dart';
import '../../features/auth/presentation/otp_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/auth/presentation/qr_login_screen.dart';
import '../../features/chats/presentation/chats_list_screen.dart';
import '../../features/chats/presentation/chat_screen.dart';
import '../../features/contacts/presentation/contacts_screen.dart';
import '../../features/calls/presentation/calls_screen.dart';
import '../../features/calls/presentation/call_screen.dart';
import '../../features/channels/presentation/channels_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import '../../features/settings/presentation/edit_profile_screen.dart';
import '../../features/settings/presentation/privacy_screen.dart';
import '../../features/settings/presentation/sessions_screen.dart';
import '../../features/settings/presentation/notifications_screen.dart';
import '../../features/settings/presentation/storage_screen.dart';
import '../../features/settings/presentation/themes_screen.dart';
import '../../features/settings/presentation/two_fa_screen.dart';
import '../../features/profile/presentation/user_profile_screen.dart';
import '../../features/search/presentation/global_search_screen.dart';
import '../../features/media/presentation/media_viewer_screen.dart';
import '../../features/gifts/presentation/gifts_screen.dart';
import '../../features/premium/presentation/premium_screen.dart';
import '../../features/premium/presentation/stars_screen.dart';
import '../../features/settings/presentation/blocked_users_screen.dart';
import '../../shared/widgets/main_scaffold.dart';
import 'route_names.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: RouteNames.splash,
    routes: [
      GoRoute(path: RouteNames.splash, builder: (_, __) => const SplashScreen()),
      GoRoute(path: RouteNames.phone, builder: (_, __) => const PhoneScreen()),
      GoRoute(path: RouteNames.otp, builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>? ?? {};
        return OtpScreen(phone: extra['phone'] ?? '', isNewUser: extra['isNewUser'] ?? false);
      }),
      GoRoute(path: RouteNames.register, builder: (_, __) => const RegisterScreen()),
      GoRoute(path: RouteNames.qrLogin, builder: (_, __) => const QrLoginScreen()),
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(path: RouteNames.chats, builder: (_, __) => const ChatsListScreen()),
          GoRoute(path: RouteNames.contacts, builder: (_, __) => const ContactsScreen()),
          GoRoute(path: RouteNames.calls, builder: (_, __) => const CallsScreen()),
          GoRoute(path: RouteNames.channels, builder: (_, __) => const ChannelsScreen()),
          GoRoute(path: RouteNames.settings, builder: (_, __) => const SettingsScreen()),
        ],
      ),
      GoRoute(path: RouteNames.chat, builder: (context, state) {
        final chatId = state.pathParameters['id']!;
        final extra = state.extra as Map<String, dynamic>? ?? {};
        return ChatScreen(chatId: chatId, chatName: extra['chatName'] ?? '');
      }),
      GoRoute(path: RouteNames.profile, builder: (context, state) {
        return UserProfileScreen(userId: state.pathParameters['id']!);
      }),
      GoRoute(path: RouteNames.editProfile, builder: (_, __) => const EditProfileScreen()),
      GoRoute(path: RouteNames.privacy, builder: (_, __) => const PrivacyScreen()),
      GoRoute(path: RouteNames.sessions, builder: (_, __) => const SessionsScreen()),
      GoRoute(path: RouteNames.notifications, builder: (_, __) => const NotificationsScreen()),
      GoRoute(path: RouteNames.storage, builder: (_, __) => const StorageScreen()),
      GoRoute(path: RouteNames.themes, builder: (_, __) => const ThemesScreen()),
      GoRoute(path: RouteNames.twoFa, builder: (_, __) => const TwoFaScreen()),
      GoRoute(path: RouteNames.search, builder: (_, __) => const GlobalSearchScreen()),
      GoRoute(path: RouteNames.mediaViewer, builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>? ?? {};
        return MediaViewerScreen(mediaUrl: extra['mediaUrl'] ?? '', mediaType: extra['mediaType'] ?? 'photo');
      }),
      GoRoute(path: RouteNames.callScreen, builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>? ?? {};
        return CallScreen(callId: extra['callId'] ?? '', callType: extra['callType'] ?? 'VOICE', remoteUserId: extra['remoteUserId'] ?? '');
      }),
      GoRoute(path: RouteNames.gifts, builder: (_, __) => const GiftsScreen()),
      GoRoute(path: RouteNames.premium, builder: (_, __) => const PremiumScreen()),
      GoRoute(path: RouteNames.stars, builder: (_, __) => const StarsScreen()),
      GoRoute(path: RouteNames.blockedUsers, builder: (_, __) => const BlockedUsersScreen()),
    ],
  );
});
