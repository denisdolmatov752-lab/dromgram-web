import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/avatar_widget.dart';
import 'package:timeago/timeago.dart' as timeago;

class CallsScreen extends StatefulWidget {
  const CallsScreen({super.key});
  @override
  State<CallsScreen> createState() => _CallsScreenState();
}

class _CallsScreenState extends State<CallsScreen> {
  List<dynamic> _calls = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final resp = await DioClient().get(ApiConstants.calls);
      if (mounted) setState(() { _calls = resp.data['data'] ?? []; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Звонки'), actions: [IconButton(icon: const Icon(Icons.phone_outlined), onPressed: () {})]),
      body: _loading ? const Center(child: CircularProgressIndicator())
        : _calls.isEmpty
          ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.phone_outlined, size: 64, color: AppColors.textSecondaryLight),
              SizedBox(height: 16), Text('Нет звонков', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight)),
            ]))
          : ListView.separated(
              itemCount: _calls.length,
              separatorBuilder: (_, __) => const Divider(height: 0, indent: 80),
              itemBuilder: (_, i) {
                final call = _calls[i];
                final caller = call['caller'];
                final name = caller != null ? '${caller['firstName']}${caller['lastName'] != null ? ' ${caller['lastName']}' : ''}' : 'Неизвестный';
                final isMissed = call['status'] == 'MISSED' || call['status'] == 'DECLINED';
                final isVideo = call['type'] == 'VIDEO';
                return ListTile(
                  leading: AvatarWidget(name: name, size: 46, avatarUrl: caller?['avatarUrl'], avatarColor: caller?['avatarColor'] ?? '#2AABEE'),
                  title: Text(name, style: TextStyle(fontWeight: FontWeight.w500, color: isMissed ? AppColors.error : null)),
                  subtitle: Row(children: [
                    Icon(isVideo ? Icons.videocam_outlined : Icons.phone_outlined, size: 14, color: isMissed ? AppColors.error : AppColors.textSecondaryLight),
                    const SizedBox(width: 4),
                    Text(call['status'] == 'MISSED' ? 'Пропущенный' : call['status'] == 'ENDED' ? 'Завершён' : call['status'], style: TextStyle(fontSize: 13, color: isMissed ? AppColors.error : AppColors.textSecondaryLight)),
                  ]),
                  trailing: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(isVideo ? Icons.videocam_outlined : Icons.phone_outlined, color: AppColors.primary),
                    if (call['createdAt'] != null) Text(timeago.format(DateTime.parse(call['createdAt']), locale: 'ru'), style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                  ]),
                );
              },
            ),
    );
  }
}
