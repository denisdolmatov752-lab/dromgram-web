import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class IncomingCallScreen extends StatelessWidget {
  const IncomingCallScreen({super.key, String? chatId, String? chatName, String? callId, String? callType, String? remoteUserId, String? mediaUrl, String? mediaType, String? userId}) : super();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Входящий звонок')),
      body: const Center(child: Text('Входящий звонок', style: TextStyle(fontSize: 18))),
    );
  }
}
