import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/router/route_names.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../shared/widgets/avatar_widget.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});
  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  Map? _user;
  bool _loading = true;

  @override
  void initState() { super.initState(); _loadProfile(); }

  Future<void> _loadProfile() async {
    try {
      final resp = await DioClient().get(ApiConstants.me);
      if (mounted) setState(() { _user = resp.data['data']; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _logout() async {
    try {
      await DioClient().post(ApiConstants.logout);
    } catch (_) {}
    await SecureStorageService().deleteToken();
    if (mounted) context.go(RouteNames.phone);
  }

  Widget _buildSection(String title, List<Widget> tiles) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.fromLTRB(16, 20, 16, 8), child: Text(title, style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight, fontWeight: FontWeight.w600))),
      ...tiles,
      const Divider(height: 0),
    ]);
  }

  Widget _buildTile(IconData icon, String title, {String? subtitle, VoidCallback? onTap, Color? iconColor, Color? textColor}) {
    return ListTile(
      leading: Container(width: 36, height: 36, decoration: BoxDecoration(color: (iconColor ?? AppColors.primary).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: iconColor ?? AppColors.primary, size: 20)),
      title: Text(title, style: TextStyle(color: textColor)),
      subtitle: subtitle != null ? Text(subtitle, style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)) : null,
      trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondaryLight),
      onTap: onTap,
    );
  }

  @override
  Widget build(BuildContext context) {
    final name = _user != null ? '${_user!['firstName']}${_user!['lastName'] != null ? ' ${_user!['lastName']}' : ''}' : '';
    return Scaffold(
      appBar: AppBar(title: const Text('Настройки')),
      body: _loading ? const Center(child: CircularProgressIndicator())
        : ListView(children: [
          // Profile header
          InkWell(
            onTap: () => context.push(RouteNames.editProfile),
            child: Padding(padding: const EdgeInsets.all(16), child: Row(children: [
              AvatarWidget(name: name, size: 64, avatarUrl: _user?['avatarUrl'], avatarColor: _user?['avatarColor'] ?? '#2AABEE'),
              const SizedBox(width: 16),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                Text(_user?['username'] != null ? '@${_user!['username']}' : _user?['phone'] ?? '', style: const TextStyle(color: AppColors.textSecondaryLight)),
                const Text('онлайн', style: TextStyle(color: AppColors.primary, fontSize: 13)),
              ])),
              const Icon(Icons.chevron_right),
            ])),
          ),
          const Divider(height: 0),
          _buildSection('Аккаунт', [
            _buildTile(Icons.security, 'Конфиденциальность', onTap: () => context.push(RouteNames.privacy)),
            _buildTile(Icons.lock_outline, 'Двухфакторная защита', onTap: () => context.push(RouteNames.twoFa)),
            _buildTile(Icons.devices, 'Активные сессии', onTap: () => context.push(RouteNames.sessions)),
          ]),
          _buildSection('Внешний вид', [
            _buildTile(Icons.palette_outlined, 'Темы оформления', onTap: () => context.push(RouteNames.themes)),
          ]),
          _buildSection('Уведомления', [
            _buildTile(Icons.notifications_outlined, 'Уведомления и звуки', onTap: () => context.push(RouteNames.notifications)),
          ]),
          _buildSection('Данные', [
            _buildTile(Icons.storage_outlined, 'Данные и память', onTap: () => context.push(RouteNames.storage)),
          ]),
          _buildSection('Аккаунт', [
            _buildTile(Icons.logout, 'Выйти', iconColor: AppColors.error, textColor: AppColors.error, onTap: () {
              showDialog(context: context, builder: (_) => AlertDialog(
                title: const Text('Выйти из аккаунта?'),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(context), child: const Text('Отмена')),
                  TextButton(onPressed: () { Navigator.pop(context); _logout(); }, child: const Text('Выйти', style: TextStyle(color: AppColors.error))),
                ],
              ));
            }),
          ]),
          const Padding(padding: EdgeInsets.all(16), child: Text('DRomGram v1.0.0', textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondaryLight, fontSize: 13))),
        ]),
    );
  }
}
