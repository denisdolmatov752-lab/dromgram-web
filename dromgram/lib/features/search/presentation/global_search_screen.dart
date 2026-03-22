import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/router/route_names.dart';
import '../../../shared/widgets/avatar_widget.dart';
import 'dart:async';

class GlobalSearchScreen extends StatefulWidget {
  const GlobalSearchScreen({super.key});
  @override
  State<GlobalSearchScreen> createState() => _GlobalSearchScreenState();
}

class _GlobalSearchScreenState extends State<GlobalSearchScreen> {
  final _ctrl = TextEditingController();
  Map<String, dynamic> _results = {};
  bool _loading = false;
  Timer? _debounce;

  @override
  void initState() { super.initState(); _ctrl.addListener(_onSearch); }

  @override
  void dispose() { _ctrl.dispose(); _debounce?.cancel(); super.dispose(); }

  void _onSearch() {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () => _search(_ctrl.text));
  }

  Future<void> _search(String q) async {
    if (q.isEmpty) { setState(() => _results = {}); return; }
    setState(() => _loading = true);
    try {
      final r = await DioClient().get('/search', params: {'q': q});
      if (mounted) setState(() { _results = Map<String, dynamic>.from(r.data['data'] ?? {}); _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    final users = (_results['users'] as List?) ?? [];
    final chats = (_results['chats'] as List?) ?? [];
    final messages = (_results['messages'] as List?) ?? [];
    return Scaffold(
      appBar: AppBar(
        title: TextField(controller: _ctrl, autofocus: true,
          decoration: const InputDecoration(hintText: 'Поиск...', border: InputBorder.none),
          style: const TextStyle(fontSize: 18)),
      ),
      body: _loading ? const Center(child: CircularProgressIndicator())
        : _ctrl.text.isEmpty
          ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.search, size: 64, color: AppColors.textSecondaryLight),
              SizedBox(height: 16), Text('Введите запрос для поиска', style: TextStyle(color: AppColors.textSecondaryLight))
            ]))
          : ListView(children: [
              if (users.isNotEmpty) ...[
                const Padding(padding: EdgeInsets.fromLTRB(16, 12, 16, 4), child: Text('Пользователи', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondaryLight, fontSize: 13))),
                ...users.map((u) => ListTile(
                  leading: AvatarWidget(name: '${u['firstName']}', size: 40, avatarUrl: u['avatarUrl'], avatarColor: u['avatarColor'] ?? '#2AABEE'),
                  title: Text('${u['firstName']}${u['lastName'] != null ? ' ${u['lastName']}' : ''}', style: const TextStyle(fontWeight: FontWeight.w500)),
                  subtitle: u['username'] != null ? Text('@${u['username']}', style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)) : null,
                  onTap: () => context.push(RouteNames.profileRoute(u['id'])),
                )),
              ],
              if (chats.isNotEmpty) ...[
                const Padding(padding: EdgeInsets.fromLTRB(16, 12, 16, 4), child: Text('Чаты', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondaryLight, fontSize: 13))),
                ...chats.map((c) => ListTile(
                  leading: AvatarWidget(name: c['name'] ?? 'C', size: 40, avatarUrl: c['avatarUrl']),
                  title: Text(c['name'] ?? 'Чат', style: const TextStyle(fontWeight: FontWeight.w500)),
                  onTap: () => context.push(RouteNames.chatRoute(c['id']), extra: {'chatName': c['name'] ?? 'Чат'}),
                )),
              ],
              if (messages.isNotEmpty) ...[
                const Padding(padding: EdgeInsets.fromLTRB(16, 12, 16, 4), child: Text('Сообщения', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondaryLight, fontSize: 13))),
                ...messages.map((m) => ListTile(
                  leading: const Icon(Icons.message_outlined, color: AppColors.textSecondaryLight),
                  title: Text(m['text'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis),
                  subtitle: Text(m['chat']?['name'] ?? '', style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)),
                  onTap: () => context.push(RouteNames.chatRoute(m['chatId']), extra: {'chatName': m['chat']?['name'] ?? ''}),
                )),
              ],
              if (users.isEmpty && chats.isEmpty && messages.isEmpty)
                const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('Ничего не найдено', style: TextStyle(color: AppColors.textSecondaryLight)))),
            ]),
    );
  }
}
