import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTextStyles {
  static const String fontFamily = 'Inter';

  static const TextStyle heroTitle = TextStyle(fontFamily: fontFamily, fontSize: 28, fontWeight: FontWeight.w700);
  static const TextStyle h1 = TextStyle(fontFamily: fontFamily, fontSize: 22, fontWeight: FontWeight.w600);
  static const TextStyle h2 = TextStyle(fontFamily: fontFamily, fontSize: 18, fontWeight: FontWeight.w600);
  static const TextStyle chatName = TextStyle(fontFamily: fontFamily, fontSize: 15, fontWeight: FontWeight.w500);
  static const TextStyle messageText = TextStyle(fontFamily: fontFamily, fontSize: 16, fontWeight: FontWeight.w400, height: 1.4);
  static const TextStyle chatPreview = TextStyle(fontFamily: fontFamily, fontSize: 14, fontWeight: FontWeight.w400, height: 1.2);
  static const TextStyle timeMeta = TextStyle(fontFamily: fontFamily, fontSize: 13, fontWeight: FontWeight.w400);
  static const TextStyle badge = TextStyle(fontFamily: fontFamily, fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white);
  static const TextStyle caption = TextStyle(fontFamily: fontFamily, fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textSecondaryLight);
}
