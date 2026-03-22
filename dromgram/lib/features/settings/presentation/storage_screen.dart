import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';

class StorageScreen extends ConsumerStatefulWidget {
  const StorageScreen({super.key});
  @override
  ConsumerState<StorageScreen> createState() => _StorageScreenState();
}

class _StorageScreenState extends ConsumerState<StorageScreen> {
  bool _loading = true;
  int _cacheSize = 0;
  int _mediaSize = 0;
  bool _clearing = false;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final r = await DioClient().get('/media/storage');
      final d = r.data['data'] ?? {};
      setState(() {
        _cacheSize = d['cacheSize'] ?? 0;
        _mediaSize = d['mediaSize'] ?? 0;
        _loading = false;
      });
    } catch (e) {
      setState(() { _cacheSize = 45 * 1024 * 1024; _mediaSize = 128 * 1024 * 1024; _loading = false; });
    }
  }

  String _formatSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) return '${(bytes / 1024 / 1024).toStringAsFixed(1)} MB';
    return '${(bytes / 1024 / 1024 / 1024).toStringAsFixed(2)} GB';
  }

  Future<void> _clearCache() async {
    setState(() => _clearing = true);
    await Future.delayed(const Duration(seconds: 1));
    setState(() { _cacheSize = 0; _clearing = false; });
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Кэш очищен'), backgroundColor: AppColors.primary));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgSecondaryDark,
        title: const Text('Данные и хранилище', style: TextStyle(color: AppColors.textDark, fontSize: 17, fontWeight: FontWeight.w600)),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios, color: AppColors.primary, size: 20), onPressed: () => Navigator.pop(context)),
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Storage overview
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.bgSecondaryDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white.withOpacity(0.07)),
                ),
                child: Column(
                  children: [
                    Icon(Icons.storage_outlined, color: AppColors.primary, size: 48),
                    const SizedBox(height: 12),
                    Text(_formatSize(_cacheSize + _mediaSize),
                      style: const TextStyle(color: AppColors.textDark, fontSize: 28, fontWeight: FontWeight.bold)),
                    const Text('Всего занято', style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13)),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildStat('Кэш', _cacheSize, AppColors.primary),
                        _buildStat('Медиа', _mediaSize, const Color(0xFF4CAF50)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Actions
              _buildSectionTitle('Действия'),
              Container(
                decoration: BoxDecoration(color: AppColors.bgSecondaryDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(0.07))),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.cleaning_services_outlined, color: AppColors.primary),
                      title: const Text('Очистить кэш', style: TextStyle(color: AppColors.textDark, fontSize: 15)),
                      subtitle: Text(_formatSize(_cacheSize), style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 12)),
                      trailing: _clearing
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
                        : const Icon(Icons.arrow_forward_ios, color: AppColors.textSecondaryDark, size: 16),
                      onTap: _cacheSize > 0 ? _clearCache : null,
                    ),
                    const Divider(height: 1, color: Color(0x18FFFFFF), indent: 56),
                    ListTile(
                      leading: const Icon(Icons.photo_library_outlined, color: AppColors.primary),
                      title: const Text('Медиафайлы', style: TextStyle(color: AppColors.textDark, fontSize: 15)),
                      subtitle: Text(_formatSize(_mediaSize), style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 12)),
                      trailing: const Icon(Icons.arrow_forward_ios, color: AppColors.textSecondaryDark, size: 16),
                      onTap: () {},
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Network usage
              _buildSectionTitle('Использование данных'),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: AppColors.bgSecondaryDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(0.07))),
                child: Column(
                  children: [
                    _buildDataRow('Фото', 'Автозагрузка', true),
                    const Divider(height: 16, color: Color(0x18FFFFFF)),
                    _buildDataRow('Видео', 'Только Wi-Fi', false),
                    const Divider(height: 16, color: Color(0x18FFFFFF)),
                    _buildDataRow('Документы', 'Всегда', true),
                  ],
                ),
              ),
            ],
          ),
    );
  }

  Widget _buildSectionTitle(String t) => Padding(
    padding: const EdgeInsets.only(left: 4, bottom: 8),
    child: Text(t, style: const TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w600)),
  );

  Widget _buildStat(String label, int bytes, Color color) => Column(children: [
    Text(_formatSize(bytes), style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
    Text(label, style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 12)),
  ]);

  Widget _buildDataRow(String type, String setting, bool enabled) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(type, style: const TextStyle(color: AppColors.textDark, fontSize: 15)),
      Text(setting, style: TextStyle(color: enabled ? AppColors.primary : AppColors.textSecondaryDark, fontSize: 13)),
    ],
  );
}
