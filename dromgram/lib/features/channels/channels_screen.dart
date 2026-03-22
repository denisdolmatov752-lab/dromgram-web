import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class ChannelsScreen extends StatelessWidget {
  const ChannelsScreen({super.key, String? chatId, String? chatName, String? callId, String? callType, String? remoteUserId, String? mediaUrl, String? mediaType, String? userId}) : super();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Каналы')),
      body: const Center(child: Text('Каналы', style: TextStyle(fontSize: 18))),
    );
  }
}
