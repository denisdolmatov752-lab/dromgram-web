import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class MediaViewerScreen extends StatelessWidget {
  const MediaViewerScreen({super.key, String? chatId, String? chatName, String? callId, String? callType, String? remoteUserId, String? mediaUrl, String? mediaType, String? userId}) : super();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Медиа')),
      body: const Center(child: Text('Медиа', style: TextStyle(fontSize: 18))),
    );
  }
}
