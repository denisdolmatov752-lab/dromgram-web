import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});
  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  bool _messages = true;
  bool _groups = true;
  bool _channels = true;
  bool _calls = true;
  bool _sound = true;
  bool _vibration = true;
  bool _preview = true;
  bool _badge = true;

  void _save() {
    // Save to local storage
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Настройки сохранены'), backgroundColor: AppColors.primary));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgSecondaryDark,
        title: const Text('Уведомления', style: TextStyle(color: AppColors.textDark, fontSize: 17, fontWeight: FontWeight.w600)),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios, color: AppColors.primary, size: 20), onPressed: () => Navigator.pop(context)),
        actions: [TextButton(onPressed: _save, child: const Text('Готово', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)))],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildCard('Уведомления', [
            _buildSwitch('Сообщения', _messages, Icons.chat_bubble_outline, (v) => setState(() => _messages = v)),
            _divider(),
            _buildSwitch('Группы', _groups, Icons.group_outlined, (v) => setState(() => _groups = v)),
            _divider(),
            _buildSwitch('Каналы', _channels, Icons.campaign_outlined, (v) => setState(() => _channels = v)),
            _divider(),
            _buildSwitch('Звонки', _calls, Icons.phone_outlined, (v) => setState(() => _calls = v)),
          ]),
          const SizedBox(height: 16),
          _buildCard('Звук и вибрация', [
            _buildSwitch('Звук', _sound, Icons.volume_up_outlined, (v) => setState(() => _sound = v)),
            _divider(),
            _buildSwitch('Вибрация', _vibration, Icons.vibration, (v) => setState(() => _vibration = v)),
          ]),
          const SizedBox(height: 16),
          _buildCard('Отображение', [
            _buildSwitch('Предпросмотр сообщений', _preview, Icons.preview_outlined, (v) => setState(() => _preview = v)),
            _divider(),
            _buildSwitch('Счётчик на иконке', _badge, Icons.notifications_outlined, (v) => setState(() => _badge = v)),
          ]),
        ],
      ),
    );
  }

  Widget _divider() => const Divider(height: 1, color: Color(0x18FFFFFF), indent: 56);

  Widget _buildCard(String title, List<Widget> children) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Padding(padding: const EdgeInsets.only(left: 4, bottom: 8), child: Text(title, style: const TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w600))),
      Container(
        decoration: BoxDecoration(color: AppColors.bgSecondaryDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(0.07))),
        child: Column(children: children),
      ),
    ],
  );

  Widget _buildSwitch(String label, bool value, IconData icon, ValueChanged<bool> onChanged) {
    return SwitchListTile(
      secondary: Icon(icon, color: AppColors.primary, size: 22),
      title: Text(label, style: const TextStyle(color: AppColors.textDark, fontSize: 15)),
      value: value, onChanged: onChanged, activeColor: AppColors.primary,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
    );
  }
}
