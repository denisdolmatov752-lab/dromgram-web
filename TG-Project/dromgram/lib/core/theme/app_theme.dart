import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';

class AppTheme {
  static ThemeData get light => ThemeData(
    brightness: Brightness.light,
    useMaterial3: true,
    fontFamily: AppTextStyles.fontFamily,
    colorScheme: ColorScheme.light(
      primary: AppColors.primary,
      secondary: AppColors.primaryDark,
      background: AppColors.bgLight,
      surface: AppColors.bgLight,
      error: AppColors.error,
      onPrimary: Colors.white,
      onBackground: AppColors.textLight,
      onSurface: AppColors.textLight,
    ),
    scaffoldBackgroundColor: AppColors.bgLight,
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.bgLight,
      foregroundColor: AppColors.textLight,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(fontFamily: AppTextStyles.fontFamily, fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textLight),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.navBgLight,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textSecondaryLight,
      elevation: 8,
      type: BottomNavigationBarType.fixed,
    ),
    dividerTheme: const DividerThemeData(color: AppColors.dividerLight, thickness: 0.5, space: 0),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.bgLight,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.dividerLight)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.dividerLight)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
      hintStyle: const TextStyle(color: AppColors.textSecondaryLight, fontFamily: AppTextStyles.fontFamily),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 50),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontFamily: AppTextStyles.fontFamily, fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
  );

  static ThemeData get dark => ThemeData(
    brightness: Brightness.dark,
    useMaterial3: true,
    fontFamily: AppTextStyles.fontFamily,
    colorScheme: ColorScheme.dark(
      primary: AppColors.primary,
      secondary: AppColors.primaryDark,
      background: AppColors.bgDark,
      surface: AppColors.surfaceDark,
      error: AppColors.error,
      onPrimary: Colors.white,
      onBackground: AppColors.textDark,
      onSurface: AppColors.textDark,
    ),
    scaffoldBackgroundColor: AppColors.bgDark,
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.bgDark,
      foregroundColor: AppColors.textDark,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(fontFamily: AppTextStyles.fontFamily, fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textDark),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.navBgDark,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textSecondaryDark,
      elevation: 8,
      type: BottomNavigationBarType.fixed,
    ),
    dividerTheme: const DividerThemeData(color: AppColors.dividerDark, thickness: 0.5, space: 0),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surfaceDark,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.dividerDark)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.dividerDark)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
      hintStyle: TextStyle(color: AppColors.textSecondaryDark, fontFamily: AppTextStyles.fontFamily),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 50),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontFamily: AppTextStyles.fontFamily, fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
  );
}
