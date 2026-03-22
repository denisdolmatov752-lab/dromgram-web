import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('EditProfile')),
      body: const Center(child: Text('EditProfile', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight))),
    );
  }
}
