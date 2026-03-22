import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';

class TwoFaScreen extends ConsumerStatefulWidget {
  const TwoFaScreen({super.key});
  @override
  ConsumerState<TwoFaScreen> createState() => _TwoFaScreenState();
}

class _TwoFaScreenState extends ConsumerState<TwoFaScreen> {
  bool _enabled = false;
  bool _loading = true;
  bool _saving = false;
  final _passCtrl = TextEditingController();
  final _newPassCtrl = TextEditingController();
  bool _showPass = false;

  @override
  void initState() { super.initState(); _load(); }
  @override
  void dispose() { _passCtrl.dispose(); _newPassCtrl.dispose(); super.dispose(); }

  Future<void> _load() async {
    try {
      final r = await DioClient().get('/auth/2fa/status');
      setState(() { _enabled = r.data['data']?['enabled'] ?? false; _loading = false; });
    } catch (e) { setState(() => _loading = false); }
  }

  Future<void> _toggle() async {
    if (_newPassCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Введите пароль'), backgroundColor: Colors.red));
      return;
    }
    setState(() => _saving = true);
    try {
      if (_enabled) {
        await DioClient().post('/auth/2fa/disable', data: {'password': _passCtrl.text});
        setState(() => _enabled = false);
      } else {
        await DioClient().post('/auth/2fa/enable', data: {'password': _newPassCtrl.text});
        setState(() => _enabled = true);
      }
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_enabled ? '2FA включена' : '2FA отключена'), backgroundColor: AppColors.primary));
      _passCtrl.clear(); _newPassCtrl.clear();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Ошибка: $e'), backgroundColor: Colors.red));
    } finally { if (mounted) setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgSecondaryDark,
        title: const Text('Двухфакторная защита', style: TextStyle(color: AppColors.textDark, fontSize: 17, fontWeight: FontWeight.w600)),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios, color: AppColors.primary, size: 20), onPressed: () => Navigator.pop(context)),
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
        : Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Icon(_enabled ? Icons.lock : Icons.lock_open_outlined, color: _enabled ? AppColors.primary : AppColors.textSecondaryDark, size: 64),
                const SizedBox(height: 16),
                Text(_enabled ? 'Двухфакторная аутентификация включена' : 'Защитите аккаунт дополнительным паролем',
                  style: const TextStyle(color: AppColors.textDark, fontSize: 16, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
                const SizedBox(height: 8),
                Text(_enabled ? 'При входе потребуется ввести пароль' : 'Дополнительный пароль запрашивается при каждом входе',
                  style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 13), textAlign: TextAlign.center),
                const SizedBox(height: 32),
                if (_enabled) ...[
                  _buildInput(_passCtrl, 'Текущий пароль'),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _saving ? null : _toggle,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 50), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                    child: _saving ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2) : const Text('Отключить 2FA', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                  ),
                ] else ...[
                  _buildInput(_newPassCtrl, 'Новый пароль'),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _saving ? null : _toggle,
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 50), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                    child: _saving ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2) : const Text('Включить 2FA', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                  ),
                ],
              ],
            ),
          ),
    );
  }

  Widget _buildInput(TextEditingController ctrl, String label) {
    return Container(
      decoration: BoxDecoration(color: AppColors.bgSecondaryDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(0.07))),
      child: TextField(
        controller: ctrl,
        obscureText: !_showPass,
        style: const TextStyle(color: AppColors.textDark),
        decoration: InputDecoration(
          labelText: label, labelStyle: const TextStyle(color: AppColors.textSecondaryDark),
          border: InputBorder.none, contentPadding: const EdgeInsets.all(16),
          suffixIcon: IconButton(icon: Icon(_showPass ? Icons.visibility_off : Icons.visibility, color: AppColors.textSecondaryDark), onPressed: () => setState(() => _showPass = !_showPass)),
        ),
      ),
    );
  }
}
