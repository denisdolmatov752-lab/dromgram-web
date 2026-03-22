import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/dio_client.dart';
import '../network/socket_service.dart';
import '../storage/secure_storage.dart';
import '../storage/local_storage.dart';

final dioClientProvider = Provider<DioClient>((ref) => DioClient());
final socketServiceProvider = Provider<SocketService>((ref) => SocketService());
final secureStorageProvider = Provider<SecureStorageService>((ref) => SecureStorageService());
final localStorageProvider = Provider<LocalStorage>((ref) => LocalStorage());

final themeModeProvider = StateProvider<String>((ref) {
  final storage = ref.read(localStorageProvider);
  return storage.getThemeMode();
});

final fontSizeProvider = StateProvider<double>((ref) {
  final storage = ref.read(localStorageProvider);
  return storage.getFontSize();
});

final currentUserIdProvider = StateProvider<String?>((ref) => null);
