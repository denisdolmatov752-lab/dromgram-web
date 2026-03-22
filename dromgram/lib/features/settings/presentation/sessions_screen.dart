import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';

class SessionsScreen extends ConsumerStatefulWidget {
  const SessionsScreen({super.key});
  @override
  ConsumerState<SessionsScreen> createState() => _SessionsScreenState();
}

class _SessionsScreenState extends ConsumerState<SessionsScreen> {
  List<dynamic> _sessions = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final r = await DioClient().get('/sessions');
      setState(() { _sessions = r.data['data'] ?? []; _loading = false; });
    } catch (e) { setState(() => _loading = false); }
  }

  Future<void> _terminate(String id) async {
    try {
      await DioClient().delete('/sessions/$id');
      setState(() => _sessions.removeWhere((s) => s['id'] == id));
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Сессия завершена'), backgroundColor: AppColors.primary));
    } catch (e) {}
  }

  Future<void> _terminateAll() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.bgSecondaryDark,
        title: const Text('Завершить все сессии?', style: TextStyle(color: AppColors.textDark)),
        content: const Text('Все другие устройства будут отключены', style: TextStyle(color: AppColors.textSecondaryDark)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Отмена')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Завершить', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await DioClient().post('/sessions/logout-all-other', data: {});
      await _load();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Все сессии завершены'), backgroundColor: AppColors.primary));
    } catch (e) {}
  }

  IconData _deviceIcon(String? deviceType) {
    switch (deviceType?.toLowerCase()) {
      case 'android': return Icons.android;
      case 'ios': return Icons.phone_iphone;
      case 'web': return Icons.web;
      case 'desktop': return Icons.desktop_windows;
      default: return Icons.devices;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgSecondaryDark,
        title: const Text('Активные сессии', style: TextStyle(color: AppColors.textDark, fontSize: 17, fontWeight: FontWeight.w600)),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios, color: AppColors.primary, size: 20), onPressed: () => Navigator.pop(context)),
        actions: [
          if (_sessions.length > 1)
            TextButton(
              onPressed: _terminateAll,
              child: const Text('Завершить все', style: TextStyle(color: Colors.red, fontSize: 13)),
            ),
        ],
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
        : _sessions.isEmpty
          ? const Center(child: Text('Нет активных сессий', style: TextStyle(color: AppColors.textSecondaryDark)))
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _sessions.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, i) {
                final s = _sessions[i];
                final isCurrent = s['isCurrent'] == true;
                return Container(
                  decoration: BoxDecoration(
                    color: isCurrent ? AppColors.primary.withOpacity(0.1) : AppColors.bgSecondaryDark,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: isCurrent ? AppColors.primary.withOpacity(0.3) : Colors.white.withOpacity(0.07)),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(12),
                    leading: Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                      child: Icon(_deviceIcon(s['deviceType']), color: AppColors.primary, size: 22),
                    ),
                    title: Row(
                      children: [
                        Text(s['deviceName'] ?? s['deviceType'] ?? 'Устройство', style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w600, fontSize: 15)),
                        if (isCurrent) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                            child: const Text('Это устройство', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ],
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(s['ip'] ?? '', style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 12)),
                        Text(s['lastActiveAt'] != null ? 'Последний вход: ${s['lastActiveAt'].toString().substring(0, 10)}' : '', style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 12)),
                      ],
                    ),
                    trailing: isCurrent ? null : IconButton(
                      icon: const Icon(Icons.close, color: Colors.red, size: 20),
                      onPressed: () => _terminate(s['id']),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
