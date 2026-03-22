import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Privacy')),
      body: const Center(child: Text('Privacy', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight))),
    );
  }
}
