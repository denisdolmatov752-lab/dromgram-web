import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/router/route_names.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';

class PhoneScreen extends ConsumerStatefulWidget {
  const PhoneScreen({super.key});
  @override
  ConsumerState<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends ConsumerState<PhoneScreen> {
  // Step 1: phone, Step 2: email
  int _step = 1;

  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  bool _loading = false;
  String? _error;
  bool _syncContacts = true;

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  // Full phone with +7
  String get _fullPhone {
    String digits = _phoneCtrl.text.replaceAll(RegExp(r'\D'), '');
    if (digits.startsWith('8')) digits = '7' + digits.substring(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    return '+$digits';
  }

  bool get _phoneValid {
    final d = _phoneCtrl.text.replaceAll(RegExp(r'\D'), '');
    return d.length >= 10;
  }

  bool get _emailValid => _emailCtrl.text.contains('@') && _emailCtrl.text.contains('.');

  void _goToEmailStep() {
    if (!_phoneValid) {
      setState(() => _error = 'Введите корректный номер телефона');
      return;
    }
    setState(() { _step = 2; _error = null; });
  }

  Future<void> _sendCode() async {
    if (!_emailValid) {
      setState(() => _error = 'Введите корректный email адрес');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final resp = await DioClient().post(ApiConstants.sendCode, data: {
        'phone': _fullPhone,
        'email': _emailCtrl.text.trim().toLowerCase(),
      });
      if (!mounted) return;
      final data = resp.data['data'];
      context.go(RouteNames.otp, extra: {
        'phone': _fullPhone,
        'email': _emailCtrl.text.trim().toLowerCase(),
        'isNewUser': data['isNewUser'] ?? false,
        'codeId': data['codeId'] ?? '',
      });
    } catch (e) {
      setState(() {
        _error = 'Ошибка отправки кода. Попробуйте позже.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              // Logo
              Container(
                width: 80, height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [AppColors.primary, AppColors.primary.withOpacity(0.7)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: const Center(
                  child: Text('D', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900)),
                ),
              ),
              const SizedBox(height: 20),
              const Text('DRomGram', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Colors.white)),
              const SizedBox(height: 8),

              if (_step == 1) ...[
                const Text(
                  'Введите ваш номер телефона',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 15, color: AppColors.textSecondaryLight),
                ),
                const SizedBox(height: 32),
                // Country selector
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.07),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Row(children: [
                    // Russia flag via colored box
                    ClipRRect(
                      borderRadius: BorderRadius.circular(3),
                      child: SizedBox(
                        width: 28, height: 20,
                        child: Column(children: [
                          Container(height: 6.67, color: Colors.white),
                          Container(height: 6.67, color: const Color(0xFF0052CC)),
                          Container(height: 6.67, color: const Color(0xFFD52B1E)),
                        ]),
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Text('Россия', style: TextStyle(color: Colors.white, fontSize: 15)),
                    const Spacer(),
                    const Text('+7', style: TextStyle(color: AppColors.primary, fontSize: 15, fontWeight: FontWeight.w600)),
                    const Icon(Icons.keyboard_arrow_down, color: Colors.white38, size: 20),
                  ]),
                ),
                const SizedBox(height: 12),
                // Phone input
                TextField(
                  controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  autofocus: true,
                  style: const TextStyle(color: Colors.white, fontSize: 16),
                  decoration: InputDecoration(
                    hintText: '+7 (900) 000-00-00',
                    hintStyle: TextStyle(color: Colors.white38),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.07),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Colors.white24),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Colors.white24),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: AppColors.primary, width: 1.5),
                    ),
                    prefixIcon: Icon(Icons.phone_outlined, color: AppColors.primary, size: 20),
                  ),
                  onChanged: (v) {
                    // Auto format with +7
                    String digits = v.replaceAll(RegExp(r'\D'), '');
                    if (digits.startsWith('8')) digits = '7' + digits.substring(1);
                    setState(() => _error = null);
                  },
                ),
                const SizedBox(height: 16),
                // Sync contacts checkbox
                GestureDetector(
                  onTap: () => setState(() => _syncContacts = !_syncContacts),
                  child: Row(children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 20, height: 20,
                      decoration: BoxDecoration(
                        color: _syncContacts ? AppColors.primary : Colors.transparent,
                        borderRadius: BorderRadius.circular(5),
                        border: Border.all(
                          color: _syncContacts ? AppColors.primary : Colors.white38,
                          width: 1.5,
                        ),
                      ),
                      child: _syncContacts
                          ? const Icon(Icons.check, color: Colors.white, size: 14)
                          : null,
                    ),
                    const SizedBox(width: 10),
                    const Text('Синхронизировать контакты',
                        style: TextStyle(color: AppColors.textSecondaryLight, fontSize: 14)),
                  ]),
                ),
              ] else ...[
                // Step 2: Email
                Text(
                  'Телефон: $_fullPhone',
                  style: const TextStyle(fontSize: 14, color: AppColors.textSecondaryLight),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Введите email — на него придёт\nкод подтверждения',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 15, color: AppColors.textSecondaryLight),
                ),
                const SizedBox(height: 32),
                TextField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  autofocus: true,
                  style: const TextStyle(color: Colors.white, fontSize: 16),
                  decoration: InputDecoration(
                    hintText: 'ваш@email.com',
                    hintStyle: TextStyle(color: Colors.white38),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.07),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Colors.white24),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Colors.white24),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: AppColors.primary, width: 1.5),
                    ),
                    prefixIcon: Icon(Icons.email_outlined, color: AppColors.primary, size: 20),
                  ),
                  onChanged: (_) => setState(() => _error = null),
                  onSubmitted: (_) { if (_emailValid && !_loading) _sendCode(); },
                ),
              ],

              if (_error != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.error.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(children: [
                    Icon(Icons.error_outline, color: AppColors.error, size: 16),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_error!, style: TextStyle(color: AppColors.error, fontSize: 13))),
                  ]),
                ),
              ],

              const Spacer(),

              // Buttons
              if (_step == 1) ...[
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _phoneValid ? _goToEmailStep : null,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Далее', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward_rounded, size: 18),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => context.go(RouteNames.qrLogin),
                  child: const Text('Войти по QR-коду', style: TextStyle(color: AppColors.primary)),
                ),
              ] else ...[
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: (_emailValid && !_loading) ? _sendCode : null,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: _loading
                        ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('Получить код', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                              SizedBox(width: 8),
                              Icon(Icons.send_rounded, size: 18),
                            ],
                          ),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => setState(() { _step = 1; _error = null; }),
                  child: const Text('← Назад', style: TextStyle(color: AppColors.textSecondaryLight)),
                ),
              ],
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
