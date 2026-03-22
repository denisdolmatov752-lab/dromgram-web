import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class BlockedUsersScreen extends StatelessWidget {
  const BlockedUsersScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('BlockedUsers')),
      body: const Center(child: Text('BlockedUsers', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight))),
    );
  }
}
