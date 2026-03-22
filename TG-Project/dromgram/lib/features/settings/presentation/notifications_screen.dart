import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: const Center(child: Text('Notifications', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight))),
    );
  }
}
