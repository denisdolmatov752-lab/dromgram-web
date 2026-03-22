import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';

class BlockedUsersScreen extends ConsumerStatefulWidget {
  const BlockedUsersScreen({super.key});
  @override
  ConsumerState<BlockedUsersScreen> createState() => _BlockedUsersScreenState();
}

class _BlockedUsersScreenState extends ConsumerState<BlockedUsersScreen> {
  List<dynamic> _users = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final r = await DioClient().get('/users/blocked');
      setState(() { _users = r.data['data'] ?? []; _loading = false; });
    } catch (e) { setState(() => _loading = false); }
  }

  Future<void> _unblock(String id, String name) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.bgSecondaryDark,
        title: Text('Разблокировать $name?', style: const TextStyle(color: AppColors.textDark)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Отмена')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Разблокировать', style: TextStyle(color: AppColors.primary))),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await DioClient().delete('/users/blocked/$id');
      setState(() => _users.removeWhere((u) => u['id'] == id));
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$name разблокирован'), backgroundColor: AppColors.primary));
    } catch (e) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgSecondaryDark,
        title: const Text('Заблокированные', style: TextStyle(color: AppColors.textDark, fontSize: 17, fontWeight: FontWeight.w600)),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios, color: AppColors.primary, size: 20), onPressed: () => Navigator.pop(context)),
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
        : _users.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.block, size: 64, color: AppColors.textSecondaryDark.withOpacity(0.4)),
                  const SizedBox(height: 16),
                  const Text('Нет заблокированных пользователей', style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 15)),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _users.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, i) {
                final u = _users[i];
                final name = '${u['firstName'] ?? ''}${u['lastName'] != null ? ' ${u['lastName']}' : ''}';
                return Container(
                  decoration: BoxDecoration(color: AppColors.bgSecondaryDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(0.07))),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppColors.primary.withOpacity(0.2),
                      backgroundImage: u['avatarUrl'] != null ? NetworkImage(u['avatarUrl']) : null,
                      child: u['avatarUrl'] == null ? Text(name.isNotEmpty ? name[0].toUpperCase() : '?', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)) : null,
                    ),
                    title: Text(name, style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w600)),
                    subtitle: u['username'] != null ? Text('@${u['username']}', style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 12)) : null,
                    trailing: TextButton(
                      onPressed: () => _unblock(u['id'], name),
                      child: const Text('Разблокировать', style: TextStyle(color: AppColors.primary, fontSize: 12)),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
