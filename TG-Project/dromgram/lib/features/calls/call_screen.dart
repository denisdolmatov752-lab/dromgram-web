import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class CallScreen extends StatelessWidget {
  const CallScreen({super.key, String? chatId, String? chatName, String? callId, String? callType, String? remoteUserId, String? mediaUrl, String? mediaType, String? userId}) : super();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Звонок')),
      body: const Center(child: Text('Звонок', style: TextStyle(fontSize: 18))),
    );
  }
}
