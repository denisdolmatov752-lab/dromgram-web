import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class StorageScreen extends StatelessWidget {
  const StorageScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Storage')),
      body: const Center(child: Text('Storage', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight))),
    );
  }
}
