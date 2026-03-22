import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class LanguageScreen extends StatelessWidget {
  const LanguageScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Language')),
      body: const Center(child: Text('Language', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight))),
    );
  }
}
