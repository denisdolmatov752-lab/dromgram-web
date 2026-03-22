import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/router/route_names.dart';
import '../../../shared/widgets/avatar_widget.dart';

class ContactsScreen extends StatefulWidget {
  const ContactsScreen({super.key});
  @override
  State<ContactsScreen> createState() => _ContactsScreenState();
}

class _ContactsScreenState extends State<ContactsScreen> {
  List<dynamic> _contacts = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final resp = await DioClient().get(ApiConstants.contacts);
      if (mounted) setState(() { _contacts = resp.data['data'] ?? []; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Контакты'), actions: [
        IconButton(icon: const Icon(Icons.person_add_outlined), onPressed: () {}),
        IconButton(icon: const Icon(Icons.search), onPressed: () => context.push(RouteNames.search)),
      ]),
      body: _loading ? const Center(child: CircularProgressIndicator())
        : _contacts.isEmpty
          ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.people_outline, size: 64, color: AppColors.textSecondaryLight),
              SizedBox(height: 16), Text('Нет контактов', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight)),
            ]))
          : ListView.separated(
              itemCount: _contacts.length,
              separatorBuilder: (_, __) => const Divider(height: 0, indent: 80),
              itemBuilder: (_, i) {
                final c = _contacts[i];
                final u = c['contact'];
                final name = '${c['firstName']}${c['lastName'] != null ? ' ${c['lastName']}' : ''}';
                return ListTile(
                  leading: AvatarWidget(name: name, size: 46, avatarUrl: u?['avatarUrl'], avatarColor: u?['avatarColor'] ?? '#2AABEE', showOnline: u?['isOnline'] == true),
                  title: Text(name, style: const TextStyle(fontWeight: FontWeight.w500)),
                  subtitle: Text(u?['username'] != null ? '@${u!['username']}' : (u?['isOnline'] == true ? 'онлайн' : 'не в сети'), style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)),
                  onTap: () => context.push(RouteNames.profileRoute(u['id'])),
                );
              },
            ),
    );
  }
}
