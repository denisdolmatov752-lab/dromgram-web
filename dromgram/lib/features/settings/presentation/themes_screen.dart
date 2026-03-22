import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';

class ThemesScreen extends ConsumerStatefulWidget {
  const ThemesScreen({super.key});
  @override
  ConsumerState<ThemesScreen> createState() => _ThemesScreenState();
}

class _ThemesScreenState extends ConsumerState<ThemesScreen> {
  String _theme = 'dark';
  double _fontSize = 15.0;
  String _accent = '#2AABEE';

  final _accents = [
    {'color': const Color(0xFF2AABEE), 'hex': '#2AABEE', 'name': 'Синий (по умолчанию)'},
    {'color': const Color(0xFF4CAF50), 'hex': '#4CAF50', 'name': 'Зелёный'},
    {'color': const Color(0xFFFF5722), 'hex': '#FF5722', 'name': 'Оранжевый'},
    {'color': const Color(0xFF9C27B0), 'hex': '#9C27B0', 'name': 'Фиолетовый'},
    {'color': const Color(0xFFE91E63), 'hex': '#E91E63', 'name': 'Розовый'},
    {'color': const Color(0xFFFFD700), 'hex': '#FFD700', 'name': 'Золотой'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgSecondaryDark,
        title: const Text('Оформление', style: TextStyle(color: AppColors.textDark, fontSize: 17, fontWeight: FontWeight.w600)),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios, color: AppColors.primary, size: 20), onPressed: () => Navigator.pop(context)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Theme selection
          _buildSectionTitle('Тема'),
          Container(
            decoration: BoxDecoration(color: AppColors.bgSecondaryDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(0.07))),
            child: Column(
              children: [
                _buildRadio('Тёмная', 'dark', Icons.dark_mode_outlined),
                const Divider(height: 1, color: Color(0x18FFFFFF)),
                _buildRadio('Светлая', 'light', Icons.light_mode_outlined),
                const Divider(height: 1, color: Color(0x18FFFFFF)),
                _buildRadio('Системная', 'system', Icons.brightness_auto_outlined),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Font size
          _buildSectionTitle('Размер шрифта'),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.bgSecondaryDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(0.07))),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('A', style: TextStyle(color: AppColors.textDark, fontSize: 12)),
                    Text('Размер: ${_fontSize.round()}', style: const TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w600)),
                    Text('A', style: TextStyle(color: AppColors.textDark, fontSize: 20)),
                  ],
                ),
                Slider(
                  value: _fontSize, min: 12, max: 20, divisions: 8,
                  activeColor: AppColors.primary,
                  inactiveColor: Colors.white12,
                  onChanged: (v) => setState(() => _fontSize = v),
                ),
                Text('Пример текста с выбранным размером шрифта', style: TextStyle(color: AppColors.textDark, fontSize: _fontSize)),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Accent color
          _buildSectionTitle('Акцентный цвет'),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.bgSecondaryDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(0.07))),
            child: Wrap(
              spacing: 12, runSpacing: 12,
              children: _accents.map((a) {
                final selected = _accent == a['hex'];
                return GestureDetector(
                  onTap: () => setState(() => _accent = a['hex'] as String),
                  child: Column(
                    children: [
                      Container(
                        width: 44, height: 44,
                        decoration: BoxDecoration(
                          color: a['color'] as Color,
                          shape: BoxShape.circle,
                          border: Border.all(color: selected ? Colors.white : Colors.transparent, width: 3),
                          boxShadow: selected ? [BoxShadow(color: (a['color'] as Color).withOpacity(0.5), blurRadius: 8)] : [],
                        ),
                        child: selected ? const Icon(Icons.check, color: Colors.white, size: 20) : null,
                      ),
                      const SizedBox(height: 4),
                      Text(a['name'] as String, style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 10), textAlign: TextAlign.center),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) => Padding(
    padding: const EdgeInsets.only(left: 4, bottom: 8),
    child: Text(title, style: const TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w600)),
  );

  Widget _buildRadio(String label, String value, IconData icon) {
    return RadioListTile<String>(
      secondary: Icon(icon, color: _theme == value ? AppColors.primary : AppColors.textSecondaryDark, size: 22),
      title: Text(label, style: const TextStyle(color: AppColors.textDark, fontSize: 15)),
      value: value, groupValue: _theme,
      onChanged: (v) => setState(() => _theme = v!),
      activeColor: AppColors.primary,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
    );
  }
}
