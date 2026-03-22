import 'package:flutter/material.dart';

class AppColors {
  // Primary
  static const Color primary = Color(0xFF2AABEE);
  static const Color primaryDark = Color(0xFF1A8AC4);

  // Light theme
  static const Color bgLight = Color(0xFFFFFFFF);
  static const Color bgSecondaryLight = Color(0xFFF0F2F5);
  static const Color chatBgLight = Color(0xFFE3EDF7);
  static const Color navBgLight = Color(0xFFFFFFFF);
  static const Color textLight = Color(0xFF000000);
  static const Color textSecondaryLight = Color(0xFF8D8D8D);
  static const Color dividerLight = Color(0xFFE0E0E0);
  static const Color bubbleOutLight = Color(0xFFEFFFDE);
  static const Color bubbleInLight = Color(0xFFFFFFFF);
  static const Color timeOutLight = Color(0xFF4FAB83);
  static const Color tickReadLight = Color(0xFF2AABEE);

  // Dark theme
  static const Color bgDark = Color(0xFF17212B);
  static const Color bgSecondaryDark = Color(0xFF232E3C);
  static const Color surfaceDark = Color(0xFF1E2C3A);
  static const Color navBgDark = Color(0xFF17212B);
  static const Color chatBgDark = Color(0xFF0F1923);
  static const Color bubbleOutDark = Color(0xFF2B5278);
  static const Color bubbleInDark = Color(0xFF1E2C3A);
  static const Color textDark = Color(0xFFFFFFFF);
  static const Color textSecondaryDark = Color(0xFF8D8D8D);
  static const Color dividerDark = Color(0xFF2C3E50);

  // Common
  static const Color online = Color(0xFF2AABEE);
  static const Color error = Color(0xFFFF3B30);
  static const Color success = Color(0xFF4FAB83);
  static const Color unread = Color(0xFF2AABEE);
  static const Color unreadMuted = Color(0xFFB2BAC2);

  // Avatar colors
  static const List<Color> avatarColors = [
    Color(0xFFFF516A), Color(0xFFFF7519), Color(0xFFEBAC00),
    Color(0xFF26B35E), Color(0xFF00B9FF), Color(0xFF0072BB),
    Color(0xFF6B72FF), Color(0xFFFF5DA2), Color(0xFFE11584),
  ];

  static Color getAvatarColor(String name) {
    if (name.isEmpty) return avatarColors[0];
    int hash = 0;
    for (int i = 0; i < name.length; i++) {
      hash = name.codeUnitAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[hash.abs() % avatarColors.length];
  }
}
