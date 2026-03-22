import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/avatar_widget.dart';

class ChannelsScreen extends StatefulWidget {
  const ChannelsScreen({super.key});
  @override
  State<ChannelsScreen> createState() => _ChannelsScreenState();
}

class _ChannelsScreenState extends State<ChannelsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  List<dynamic> _channels = [];
  List<dynamic> _stories = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() { _tabCtrl.dispose(); super.dispose(); }

  Future<void> _loadData() async {
    try {
      final r1 = await DioClient().get('${ApiConstants.channels}/public');
      final r2 = await DioClient().get(ApiConstants.stories);
      if (mounted) setState(() {
        _channels = r1.data['data'] ?? [];
        _stories = r2.data['data'] ?? [];
        _loading = false;
      });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Каналы и Сторис'),
        bottom: TabBar(controller: _tabCtrl, tabs: const [Tab(text: 'Каналы'), Tab(text: 'Сторис')]),
      ),
      body: _loading ? const Center(child: CircularProgressIndicator())
        : TabBarView(controller: _tabCtrl, children: [
          _channels.isEmpty
            ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.campaign_outlined, size: 64, color: AppColors.textSecondaryLight),
                SizedBox(height: 16), Text('Нет каналов', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight))
              ]))
            : ListView.separated(
                itemCount: _channels.length,
                separatorBuilder: (_, __) => const Divider(height: 0),
                itemBuilder: (_, i) {
                  final c = _channels[i];
                  return ListTile(
                    leading: AvatarWidget(name: c['name'] ?? 'C', size: 46, avatarUrl: c['avatarUrl']),
                    title: Text(c['name'] ?? 'Канал', style: const TextStyle(fontWeight: FontWeight.w500)),
                    subtitle: Text(c['description'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)),
                  );
                }),
          _stories.isEmpty
            ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.auto_stories_outlined, size: 64, color: AppColors.textSecondaryLight),
                SizedBox(height: 16), Text('Нет сторис', style: TextStyle(fontSize: 18, color: AppColors.textSecondaryLight))
              ]))
            : GridView.builder(
                padding: const EdgeInsets.all(8),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, crossAxisSpacing: 4, mainAxisSpacing: 4),
                itemCount: _stories.length,
                itemBuilder: (_, i) {
                  final s = _stories[i];
                  return ClipRRect(borderRadius: BorderRadius.circular(8),
                    child: s['mediaUrl'] != null
                      ? Image.network(s['mediaUrl'], fit: BoxFit.cover)
                      : Container(color: AppColors.primary.withOpacity(0.3)));
                }),
        ]),
    );
  }
}
