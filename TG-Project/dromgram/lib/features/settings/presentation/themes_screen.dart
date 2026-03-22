import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class ThemesScreen extends StatelessWidget {
  const ThemesScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Themes')),
      body: const Center(child: Text('Themes', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight))),
    );
  }
}
