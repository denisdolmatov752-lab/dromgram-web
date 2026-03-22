import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class TwoFaScreen extends StatelessWidget {
  const TwoFaScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('TwoFa')),
      body: const Center(child: Text('TwoFa', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight))),
    );
  }
}
