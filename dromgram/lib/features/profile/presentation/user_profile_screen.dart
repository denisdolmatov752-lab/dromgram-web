import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/router/route_names.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/avatar_widget.dart';

class UserProfileScreen extends StatefulWidget {
  final String userId;
  const UserProfileScreen({super.key, required this.userId});
  @override
  State<UserProfileScreen> createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen> {
  Map? _user;
  List<Map<String, dynamic>> _gifts = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final resp = await DioClient().get('/users/${widget.userId}');
      if (mounted) setState(() { _user = resp.data['data']; });
      _loadGifts();
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _loadGifts() async {
    try {
      final resp = await DioClient().get('/users/${widget.userId}/gifts');
      if (mounted) setState(() { _gifts = List<Map<String, dynamic>>.from(resp.data['data'] ?? []); _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    final name = _user != null ? '${_user!['firstName']}${_user!['lastName'] != null ? ' ${_user!['lastName']}' : ''}' : '';
    final isPremium = _user?['isPremium'] ?? false;
    final isOnline = _user?['isOnline'] ?? false;
    return Scaffold(
      appBar: AppBar(title: Text(name), actions: [
        IconButton(icon: const Icon(Icons.search), onPressed: () {}),
        IconButton(icon: const Icon(Icons.more_vert), onPressed: () {}),
      ]),
      body: _loading ? const Center(child: CircularProgressIndicator())
        : ListView(children: [
          // Header with avatar and info
          Container(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
            Stack(children: [
              AvatarWidget(name: name, size: 100, avatarUrl: _user?['avatarUrl'], avatarColor: _user?['avatarColor'] ?? '#2AABEE'),
              if (isOnline) Positioned(right: 0, bottom: 0, child: Container(width: 28, height: 28, decoration: BoxDecoration(color: AppColors.online, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 3)), child: const Icon(Icons.check, color: Colors.white, size: 16))),
            ]),
            const SizedBox(height: 12),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              Text(name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
              if (isPremium) const SizedBox(width: 8),
              if (isPremium) Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(12)), child: const Text('Premium', style: TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600))),
            ]),
            if (_user?['username'] != null) Text('@${_user!['username']}', style: const TextStyle(color: AppColors.textSecondaryLight)),
            const SizedBox(height: 4),
            Text(isOnline ? 'онлайн' : 'был(а) недавно', style: TextStyle(color: isOnline ? AppColors.primary : AppColors.textSecondaryLight, fontSize: 13)),
          ])),
          const Divider(),
          // Action buttons
          Padding(padding: const EdgeInsets.all(16), child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
            _actionBtn(Icons.message, 'Написать', () async {
              try {
                final resp = await DioClient().post(ApiConstants.privateChat, data: {'userId': widget.userId});
                if (mounted) context.push(RouteNames.chatRoute(resp.data['data']['id']), extra: {'chatName': name});
              } catch (_) {}
            }),
            _actionBtn(Icons.phone_outlined, 'Позвонить', () {}),
            _actionBtn(Icons.videocam_outlined, 'Видео', () {}),
            _actionBtn(Icons.more_horiz, 'Ещё', () {}),
          ])),
          const Divider(),
          // Info section
          if (_user?['bio'] != null) _buildInfoTile(Icons.info_outline, 'О себе', _user!['bio']),
          if (_user?['phone'] != null) _buildInfoTile(Icons.phone, 'Телефон', _user!['phone']),
          if (_user?['username'] != null) _buildInfoTile(Icons.person, 'Username', '@${_user!['username']}'),
          const Divider(),
          // Gifts section
          Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 8), child: Text('Подарки', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600))),
          if (_gifts.isEmpty)
            Padding(padding: const EdgeInsets.all(16), child: Center(child: Text('Нет подарков', style: TextStyle(color: AppColors.textSecondaryLight))))
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, crossAxisSpacing: 12, mainAxisSpacing: 12),
              itemCount: _gifts.length,
              itemBuilder: (_, i) => _buildGiftCard(_gifts[i]),
            ),
          const SizedBox(height: 16),
          const Divider(),
          // Media section
          Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 8), child: Text('Медиа', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600))),
          Padding(padding: const EdgeInsets.all(16), child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
            _buildMediaIcon(Icons.image, 'Фото'),
            _buildMediaIcon(Icons.videocam, 'Видео'),
            _buildMediaIcon(Icons.music_note, 'Музыка'),
            _buildMediaIcon(Icons.link, 'Ссылки'),
          ])),
          const SizedBox(height: 16),
        ]),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
      subtitle: Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
    );
  }

  Widget _buildGiftCard(Map<String, dynamic> gift) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Expanded(child: Image.network('https://orproject.ru/nft/${gift['nftName'] ?? 'unknown'}.png', errorBuilder: (_, __, ___) => Icon(Icons.card_giftcard, color: AppColors.primary, size: 40))),
        Padding(padding: const EdgeInsets.all(8), child: Column(children: [
          Text(gift['nftName'] ?? 'Подарок', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
          if (gift['fromUsername'] != null) Text('от @${gift['fromUsername']}', style: const TextStyle(fontSize: 9, color: AppColors.textSecondaryLight), maxLines: 1, overflow: TextOverflow.ellipsis),
        ])),
      ]),
    );
  }

  Widget _buildMediaIcon(IconData icon, String label) {
    return Column(children: [
      Container(width: 52, height: 52, decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)), child: Icon(icon, color: AppColors.primary)),
      const SizedBox(height: 4),
      Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
    ]);
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
