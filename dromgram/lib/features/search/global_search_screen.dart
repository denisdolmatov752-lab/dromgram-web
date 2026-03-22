import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class GlobalSearchScreen extends StatelessWidget {
  const GlobalSearchScreen({super.key, String? chatId, String? chatName, String? callId, String? callType, String? remoteUserId, String? mediaUrl, String? mediaType, String? userId}) : super();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Поиск')),
      body: const Center(child: Text('Поиск', style: TextStyle(fontSize: 18))),
    );
  }
}
