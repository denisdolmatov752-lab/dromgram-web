import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';
import '../constants/app_constants.dart';
import 'package:logger/logger.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  final _storage = const FlutterSecureStorage();
  final _logger = Logger();

  IO.Socket? get socket => _socket;
  bool get isConnected => _socket?.connected ?? false;

  Future<void> connect() async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    if (token == null) return;
    _socket = IO.io(ApiConstants.wsUrl, IO.OptionBuilder()
      .setTransports(['websocket'])
      .setAuth({'token': 'Bearer $token'})
      .enableAutoConnect()
      .enableReconnection()
      .setReconnectionAttempts(10)
      .setReconnectionDelay(2000)
      .build());

    _socket!.onConnect((_) => _logger.i('Socket connected'));
    _socket!.onDisconnect((_) => _logger.w('Socket disconnected'));
    _socket!.onConnectError((e) => _logger.e('Socket connect error: $e'));
    _socket!.onError((e) => _logger.e('Socket error: $e'));
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }

  void emit(String event, dynamic data) => _socket?.emit(event, data);

  void on(String event, Function(dynamic) handler) => _socket?.on(event, handler);
  void off(String event) => _socket?.off(event);

  void joinChat(String chatId) => emit('join_chat', {'chatId': chatId});
  void leaveChat(String chatId) => emit('leave_chat', {'chatId': chatId});
  void startTyping(String chatId) => emit('typing_start', {'chatId': chatId});
  void stopTyping(String chatId) => emit('typing_stop', {'chatId': chatId});
  void markRead(String messageId, String chatId) => emit('message_read', {'messageId': messageId, 'chatId': chatId});
  void sendPresence() => emit('presence', {});
}
