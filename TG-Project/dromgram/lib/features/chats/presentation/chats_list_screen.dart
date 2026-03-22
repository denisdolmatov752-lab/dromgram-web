import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/router/route_names.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/avatar_widget.dart';
import '../../../shared/widgets/unread_badge.dart';
import 'package:timeago/timeago.dart' as timeago;

class ChatsListScreen extends ConsumerStatefulWidget {
  const ChatsListScreen({super.key});
  @override
  ConsumerState<ChatsListScreen> createState() => _ChatsListScreenState();
}

class _ChatsListScreenState extends ConsumerState<ChatsListScreen> {
  List<dynamic> _chats = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() { super.initState(); timeago.setLocaleMessages('ru', timeago.RuMessages()); _loadChats(); }

  Future<void> _loadChats() async {
    try {
      final resp = await DioClient().get(ApiConstants.chats);
      if (mounted) setState(() { _chats = resp.data['data'] ?? []; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = 'Ошибка загрузки чатов'; _loading = false; });
    }
  }

  String _getChatName(Map chat) {
    if (chat['type'] == 'PRIVATE' || chat['type'] == 'SECRET') {
      final members = chat['members'] as List? ?? [];
      if (members.isNotEmpty) {
        final u = members.first['user'];
        if (u != null) return '${u['firstName']}${u['lastName'] != null ? ' ${u['lastName']}' : ''}';
      }
    }
    return chat['name'] ?? 'Чат';
  }

  String? _getAvatarUrl(Map chat) {
    if (chat['type'] == 'PRIVATE' || chat['type'] == 'SECRET') {
      final members = chat['members'] as List? ?? [];
      if (members.isNotEmpty) return members.first['user']?['avatarUrl'];
    }
    return chat['avatarUrl'];
  }

  String _getPreview(Map chat) {
    final msgs = chat['messages'] as List? ?? [];
    if (msgs.isEmpty) return '';
    final m = msgs.first;
    final type = m['type'] ?? 'TEXT';
    if (type == 'TEXT') return m['text'] ?? '';
    if (type == 'PHOTO') return '📷 Фото';
    if (type == 'VIDEO') return '🎥 Видео';
    if (type == 'VOICE') return '🎤 Голосовое';
    if (type == 'DOCUMENT') return '📎 ${m['fileName'] ?? 'Файл'}';
    if (type == 'STICKER') return '${m['text'] ?? ''}  Стикер';
    return '';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('DRomGram', style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          IconButton(icon: const Icon(Icons.search), onPressed: () => context.push(RouteNames.search)),
          IconButton(icon: const Icon(Icons.edit_outlined), onPressed: () {}),
        ],
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _error != null
          ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 8), Text(_error!),
              TextButton(onPressed: _loadChats, child: const Text('Повторить'))
            ]))
          : _chats.isEmpty
            ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.chat_bubble_outline, size: 64, color: AppColors.textSecondaryLight),
                SizedBox(height: 16), Text('Нет чатов', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight)),
                Text('Начните новый разговор', style: TextStyle(color: AppColors.textSecondaryLight))
              ]))
            : RefreshIndicator(
                onRefresh: _loadChats,
                child: ListView.separated(
                  itemCount: _chats.length,
                  separatorBuilder: (_, __) => const Divider(height: 0, indent: 80),
                  itemBuilder: (ctx, i) {
                    final chat = _chats[i] as Map;
                    final name = _getChatName(chat);
                    final avatarUrl = _getAvatarUrl(chat);
                    final preview = _getPreview(chat);
                    final unread = chat['unreadCount'] ?? 0;
                    final muted = chat['member']?['isMuted'] ?? false;
                    final pinned = chat['member']?['isPinned'] ?? false;
                    final msgs = chat['messages'] as List? ?? [];
                    final lastTime = msgs.isNotEmpty ? msgs.first['createdAt'] : null;
                    return ListTile(
                      leading: AvatarWidget(
                        avatarUrl: avatarUrl, name: name, size: 46,
                        avatarColor: chat['avatarColor'] ?? '#2AABEE',
                        showOnline: chat['type'] == 'PRIVATE'),
                      title: Row(children: [
                        Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15), maxLines: 1, overflow: TextOverflow.ellipsis)),
                        if (pinned) const Icon(Icons.push_pin, size: 14, color: AppColors.textSecondaryLight),
                        if (lastTime != null) Text(timeago.format(DateTime.parse(lastTime), locale: 'ru'), style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                      ]),
                      subtitle: Row(children: [
                        Expanded(child: Text(preview, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 14, color: AppColors.textSecondaryLight))),
                        if (muted) const Icon(Icons.volume_off, size: 14, color: AppColors.textSecondaryLight),
                        if (unread > 0) UnreadBadge(count: unread, muted: muted),
                      ]),
                      onTap: () => context.push(RouteNames.chatRoute(chat['id']), extra: {'chatName': name}),
                    );
                  },
                ),
              ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary, foregroundColor: Colors.white,
        onPressed: () {},
        child: const Icon(Icons.edit),
      ),
    );
  }
}
