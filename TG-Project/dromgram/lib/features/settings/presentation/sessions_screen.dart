import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class SessionsScreen extends StatelessWidget {
  const SessionsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sessions')),
      body: const Center(child: Text('Sessions', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight))),
    );
  }
}
