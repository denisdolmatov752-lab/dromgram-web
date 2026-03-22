import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../../core/theme/app_colors.dart';
import '../../../core/router/route_names.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import 'package:dio/dio.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  File? _avatar;
  bool _loading = false;
  String? _error;

  @override
  void dispose() { _firstNameCtrl.dispose(); _lastNameCtrl.dispose(); super.dispose(); }

  Future<void> _pickAvatar() async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: ImageSource.gallery, maxWidth: 800);
    if (img != null) setState(() => _avatar = File(img.path));
  }

  Future<void> _register() async {
    final name = _firstNameCtrl.text.trim();
    if (name.isEmpty) { setState(() => _error = 'Введите ваше имя'); return; }
    setState(() { _loading = true; _error = null; });
    try {
      // Сначала регистрируем пользователя (имя/фамилия)
      await DioClient().post(ApiConstants.register, data: {
        'firstName': name,
        'lastName': _lastNameCtrl.text.trim(),
      });
      // Потом загружаем аватар если выбран
      if (_avatar != null) {
        final formData = FormData.fromMap({
          'avatar': await MultipartFile.fromFile(_avatar!.path, filename: 'avatar.jpg'),
        });
        await DioClient().uploadFile(ApiConstants.meAvatar, formData);
      }
      if (mounted) context.go(RouteNames.chats);
    } catch (e) {
      setState(() { _error = 'Ошибка регистрации. Попробуйте снова.'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ваше имя')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(children: [
            GestureDetector(
              onTap: _pickAvatar,
              child: CircleAvatar(radius: 50, backgroundColor: AppColors.primary,
                backgroundImage: _avatar != null ? FileImage(_avatar!) : null,
                child: _avatar == null ? const Icon(Icons.camera_alt, color: Colors.white, size: 36) : null),
            ),
            const SizedBox(height: 24),
            TextField(controller: _firstNameCtrl, decoration: const InputDecoration(labelText: 'Имя *', hintText: 'Введите имя')),
            const SizedBox(height: 16),
            TextField(controller: _lastNameCtrl, decoration: const InputDecoration(labelText: 'Фамилия', hintText: 'Необязательно')),
            if (_error != null) ...[const SizedBox(height: 8), Text(_error!, style: const TextStyle(color: AppColors.error))],
            const Spacer(),
            ElevatedButton(
              onPressed: _loading ? null : _register,
              child: _loading ? const CircularProgressIndicator(color: Colors.white) : const Text('Готово'),
            ),
          ]),
        ),
      ),
    );
  }
}
