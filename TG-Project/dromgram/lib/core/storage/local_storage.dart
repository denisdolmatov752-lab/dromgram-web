import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

class LocalStorage {
  static final LocalStorage _instance = LocalStorage._internal();
  factory LocalStorage() => _instance;
  LocalStorage._internal();

  late SharedPreferences _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  String getThemeMode() => _prefs.getString(AppConstants.themeKey) ?? 'system';
  Future<void> setThemeMode(String mode) => _prefs.setString(AppConstants.themeKey, mode);

  double getFontSize() => _prefs.getDouble(AppConstants.fontSizeKey) ?? 16.0;
  Future<void> setFontSize(double size) => _prefs.setDouble(AppConstants.fontSizeKey, size);

  Future<void> setBool(String key, bool value) => _prefs.setBool(key, value);
  bool getBool(String key, {bool defaultValue = false}) => _prefs.getBool(key) ?? defaultValue;
  Future<void> setString(String key, String value) => _prefs.setString(key, value);
  String? getString(String key) => _prefs.getString(key);
  Future<void> remove(String key) => _prefs.remove(key);
}
