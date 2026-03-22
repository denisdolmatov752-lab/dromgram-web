import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';

class PrivacyScreen extends ConsumerStatefulWidget {
  const PrivacyScreen({super.key});
  @override
  ConsumerState<PrivacyScreen> createState() => _PrivacyScreenState();
}

class _PrivacyScreenState extends ConsumerState<PrivacyScreen> {
  bool _loading = true;
  bool _saving = false;
  String _phoneVisibility = 'contacts';
  String _lastSeenVisibility = 'contacts';
  String _profilePhotoVisibility = 'everyone';
  bool _allowForwardMessages = true;
  bool _allowVoiceMessages = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final r = await DioClient().get('/users/me/privacy');
      final d = r.data['data'] ?? {};
      setState(() {
        _phoneVisibility = d['phoneVisibility'] ?? 'contacts';
        _lastSeenVisibility = d['lastSeenVisibility'] ?? 'contacts';
        _profilePhotoVisibility = d['profilePhotoVisibility'] ?? 'everyone';
        _allowForwardMessages = d['allowForwardMessages'] ?? true;
        _allowVoiceMessages = d['allowVoiceMessages'] ?? true;
        _loading = false;
      });
    } catch (e) { setState(() => _loading = false); }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await DioClient().put('/users/me/privacy', data: {
        'phoneVisibility': _phoneVisibility,
        'lastSeenVisibility': _lastSeenVisibility,
        'profilePhotoVisibility': _profilePhotoVisibility,
        'allowForwardMessages': _allowForwardMessages,
        'allowVoiceMessages': _allowVoiceMessages,
      });
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Сохранено'), backgroundColor: AppColors.primary));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Ошибка: $e'), backgroundColor: Colors.red));
    } finally { if (mounted) setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgSecondaryDark,
        title: const Text('Конфиденциальность', style: TextStyle(color: AppColors.textDark, fontSize: 17, fontWeight: FontWeight.w600)),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios, color: AppColors.primary, size: 20), onPressed: () => Navigator.pop(context)),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: _saving
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
              : const Text('Сохранить', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildSection('Кто видит мой номер телефона', _phoneVisibility, (v) => setState(() => _phoneVisibility = v!)),
              const SizedBox(height: 16),
              _buildSection('Кто видит моё время последнего посещения', _lastSeenVisibility, (v) => setState(() => _lastSeenVisibility = v!)),
              const SizedBox(height: 16),
              _buildSection('Кто видит моё фото профиля', _profilePhotoVisibility, (v) => setState(() => _profilePhotoVisibility = v!)),
              const SizedBox(height: 16),
              _buildCard([
                _buildSwitch('Разрешить пересылку сообщений', _allowForwardMessages, (v) => setState(() => _allowForwardMessages = v)),
                const Divider(height: 1, color: Color(0x18FFFFFF)),
                _buildSwitch('Разрешить голосовые сообщения', _allowVoiceMessages, (v) => setState(() => _allowVoiceMessages = v)),
              ]),
            ],
          ),
    );
  }

  Widget _buildSection(String title, String value, ValueChanged<String?> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(padding: const EdgeInsets.only(left: 4, bottom: 8), child: Text(title, style: const TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w600))),
        _buildCard([
          _buildRadio('Все', 'everyone', value, onChanged),
          const Divider(height: 1, color: Color(0x18FFFFFF)),
          _buildRadio('Мои контакты', 'contacts', value, onChanged),
          const Divider(height: 1, color: Color(0x18FFFFFF)),
          _buildRadio('Никто', 'nobody', value, onChanged),
        ]),
      ],
    );
  }

  Widget _buildCard(List<Widget> children) => Container(
    decoration: BoxDecoration(color: AppColors.bgSecondaryDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(0.07))),
    child: Column(children: children),
  );

  Widget _buildRadio(String label, String val, String groupValue, ValueChanged<String?> onChanged) {
    return RadioListTile<String>(
      title: Text(label, style: const TextStyle(color: AppColors.textDark, fontSize: 15)),
      value: val, groupValue: groupValue, onChanged: onChanged,
      activeColor: AppColors.primary,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
    );
  }

  Widget _buildSwitch(String label, bool value, ValueChanged<bool> onChanged) {
    return SwitchListTile(
      title: Text(label, style: const TextStyle(color: AppColors.textDark, fontSize: 15)),
      value: value, onChanged: onChanged,
      activeColor: AppColors.primary,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
    );
  }
}
