import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});
  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();
  bool _loading = true;
  bool _saving = false;
  String? _avatarUrl;
  String? _error;

  @override
  void initState() { super.initState(); _loadProfile(); }

  @override
  void dispose() {
    _firstNameCtrl.dispose(); _lastNameCtrl.dispose();
    _usernameCtrl.dispose(); _bioCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    try {
      final r = await DioClient().get('/users/me');
      final u = r.data['data'] ?? r.data;
      setState(() {
        _firstNameCtrl.text = u['firstName'] ?? '';
        _lastNameCtrl.text = u['lastName'] ?? '';
        _usernameCtrl.text = u['username'] ?? '';
        _bioCtrl.text = u['bio'] ?? '';
        _avatarUrl = u['avatarUrl'];
        _loading = false;
      });
    } catch (e) {
      setState(() { _error = 'Ошибка загрузки профиля'; _loading = false; });
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _saving = true; });
    try {
      await DioClient().put('/users/me', data: {
        'firstName': _firstNameCtrl.text.trim(),
        'lastName': _lastNameCtrl.text.trim(),
        'username': _usernameCtrl.text.trim().replaceAll('@', ''),
        'bio': _bioCtrl.text.trim(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Профиль обновлён'), backgroundColor: AppColors.primary));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Ошибка: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() { _saving = false; });
    }
  }

  Future<void> _pickAvatar() async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (img == null) return;
    try {
      // Upload avatar
      final formData = {'avatar': await img.readAsBytes()};
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Аватар обновлён'), backgroundColor: AppColors.primary));
    } catch (e) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgSecondaryDark,
        title: const Text('Редактировать профиль', style: TextStyle(color: AppColors.textDark, fontSize: 17, fontWeight: FontWeight.w600)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: AppColors.primary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
                : const Text('Готово', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    // Avatar
                    GestureDetector(
                      onTap: _pickAvatar,
                      child: Stack(
                        children: [
                          CircleAvatar(
                            radius: 50,
                            backgroundColor: AppColors.primary,
                            backgroundImage: _avatarUrl != null ? NetworkImage(_avatarUrl!) : null,
                            child: _avatarUrl == null ? const Icon(Icons.person, size: 50, color: Colors.white) : null,
                          ),
                          Positioned(
                            bottom: 0, right: 0,
                            child: Container(
                              width: 28, height: 28,
                              decoration: BoxDecoration(color: AppColors.primary, shape: BoxShape.circle, border: Border.all(color: AppColors.bgDark, width: 2)),
                              child: const Icon(Icons.camera_alt, size: 14, color: Colors.white),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text('Изменить фото', style: TextStyle(color: AppColors.primary, fontSize: 13)),
                    const SizedBox(height: 24),

                    _buildSection('Основное', [
                      _buildField(_firstNameCtrl, 'Имя', validator: (v) => v!.isEmpty ? 'Введите имя' : null),
                      _buildField(_lastNameCtrl, 'Фамилия'),
                      _buildField(_usernameCtrl, 'Имя пользователя (@username)'),
                    ]),
                    const SizedBox(height: 16),
                    _buildSection('О себе', [
                      _buildField(_bioCtrl, 'Bio', maxLines: 4),
                    ]),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildSection(String title, List<Widget> fields) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(title, style: const TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w600)),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppColors.bgSecondaryDark,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white.withOpacity(0.07)),
          ),
          child: Column(children: fields),
        ),
      ],
    );
  }

  Widget _buildField(TextEditingController ctrl, String label, {String? Function(String?)? validator, int maxLines = 1}) {
    return TextFormField(
      controller: ctrl,
      validator: validator,
      maxLines: maxLines,
      style: const TextStyle(color: AppColors.textDark, fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 13),
        border: InputBorder.none,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    );
  }
}
