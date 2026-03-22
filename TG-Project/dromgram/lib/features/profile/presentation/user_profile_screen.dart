import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/router/route_names.dart';
import '../../../shared/widgets/avatar_widget.dart';

class UserProfileScreen extends StatefulWidget {
  final String userId;
  const UserProfileScreen({super.key, required this.userId});
  @override
  State<UserProfileScreen> createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen> {
  Map? _user;
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final resp = await DioClient().get('/users/${widget.userId}');
      if (mounted) setState(() { _user = resp.data['data']; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    final name = _user != null ? '${_user!['firstName']}${_user!['lastName'] != null ? ' ${_user!['lastName']}' : ''}' : '';
    return Scaffold(
      body: _loading ? const Center(child: CircularProgressIndicator())
        : CustomScrollView(slivers: [
            SliverAppBar(expandedHeight: 280, pinned: true,
              flexibleSpace: FlexibleSpaceBar(background: Container(
                decoration: const BoxDecoration(gradient: LinearGradient(colors: [AppColors.primary, AppColors.primaryDark], begin: Alignment.topLeft, end: Alignment.bottomRight)),
                child: Column(mainAxisAlignment: MainAxisAlignment.end, children: [
                  AvatarWidget(name: name, size: 100, avatarUrl: _user?['avatarUrl'], avatarColor: _user?['avatarColor'] ?? '#2AABEE'),
                  const SizedBox(height: 12),
                  Text(name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
                  if (_user?['username'] != null) Text('@${_user!['username']}', style: const TextStyle(color: Colors.white70)),
                  const SizedBox(height: 16),
                ])),
            ),
            SliverList(delegate: SliverChildListDelegate([
              Padding(padding: const EdgeInsets.all(16), child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
                _actionBtn(Icons.message, 'Написать', () async {
                  final resp = await DioClient().post('/chats/private', data: {'userId': widget.userId});
                  if (mounted) context.push(RouteNames.chatRoute(resp.data['data']['id']), extra: {'chatName': name});
                }),
                _actionBtn(Icons.phone_outlined, 'Звонок', () {}),
                _actionBtn(Icons.videocam_outlined, 'Видео', () {}),
                _actionBtn(Icons.more_horiz, 'Ещё', () {}),
              ])),
              if (_user?['bio'] != null) ListTile(leading: const Icon(Icons.info_outline), title: Text(_user!['bio'])),
              if (_user?['phone'] != null) ListTile(leading: const Icon(Icons.phone), title: Text(_user!['phone']), subtitle: const Text('Мобильный')),
              const Divider(),
              ListTile(leading: const Icon(Icons.block, color: AppColors.error), title: const Text('Заблокировать', style: TextStyle(color: AppColors.error))),
            ])),
          ]),
    );
  }

  Widget _actionBtn(IconData icon, String label, VoidCallback onTap) {
    return InkWell(onTap: onTap, child: Column(children: [
      Container(width: 52, height: 52, decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), shape: BoxShape.circle),
        child: Icon(icon, color: AppColors.primary)),
      const SizedBox(height: 4),
      Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
    ]));
  }
}
