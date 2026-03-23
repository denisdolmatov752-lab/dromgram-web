import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:async';
import '../../../core/theme/app_colors.dart';
import '../../../core/router/route_names.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../core/constants/api_constants.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'dart:io';

class OtpScreen extends ConsumerStatefulWidget {
  final String phone;
  final bool isNewUser;
  final String? email;
  final String? codeId;

  const OtpScreen({
    super.key,
    required this.phone,
    required this.isNewUser,
    this.email,
    this.codeId,
  });

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _controllers = List.generate(5, (_) => TextEditingController());
  final _focusNodes = List.generate(5, (_) => FocusNode());
  bool _loading = false;
  String? _error;
  int _timer = 60;
  Timer? _countdown;

  @override
  void initState() {
    super.initState();
    _startTimer();
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) _focusNodes[0].requestFocus();
    });
  }

  void _startTimer() {
    _countdown?.cancel();
    setState(() => _timer = 60);
    _countdown = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) { t.cancel(); return; }
      if (_timer <= 0) { t.cancel(); return; }
      setState(() => _timer--);
    });
  }

  @override
  void dispose() {
    _countdown?.cancel();
    for (final c in _controllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
  }

  String get _code => _controllers.map((c) => c.text).join();

  void _onDigitChanged(int idx, String val) {
    if (val.length > 1) {
      // Handle paste
      final digits = val.replaceAll(RegExp(r'\D'), '');
      for (int i = 0; i < 5 && i < digits.length; i++) {
        _controllers[i].text = digits[i];
      }
      _focusNodes[4].requestFocus();
      setState(() {});
      if (digits.length >= 5 && !_loading) {
        Future.delayed(const Duration(milliseconds: 150), _verify);
      }
      return;
    }
    if (val.length == 1 && idx < 4) {
      _focusNodes[idx + 1].requestFocus();
    } else if (val.isEmpty && idx > 0) {
      _focusNodes[idx - 1].requestFocus();
    }
    setState(() {});
    if (_code.length == 5 && !_loading) {
      Future.delayed(const Duration(milliseconds: 150), _verify);
    }
  }

  Future<void> _verify() async {
    if (_loading) return;
    final code = _code;
    if (code.length != 5) return;

    setState(() { _loading = true; _error = null; });

    try {
      String deviceName = 'Android', deviceOs = 'Android';
      try {
        final info = DeviceInfoPlugin();
        if (Platform.isAndroid) {
          final a = await info.androidInfo;
          deviceName = '${a.manufacturer} ${a.model}'.trim();
          deviceOs = 'Android ${a.version.release}';
        } else if (Platform.isIOS) {
          final i = await info.iosInfo;
          deviceName = i.name;
          deviceOs = 'iOS ${i.systemVersion}';
        }
      } catch (_) {}

      final resp = await DioClient().post(ApiConstants.verifyCode, data: {
        'phone': widget.phone,
        'code': code,
        'deviceName': deviceName,
        'deviceOs': deviceOs,
      });

      if (!mounted) return;
      final data = resp.data['data'];
      await SecureStorageService().saveToken(data['token']);

      if (data['isNewUser'] == true) {
        context.go(RouteNames.register);
      } else {
        context.go(RouteNames.chats);
      }
    } catch (e) {
      setState(() {
        _error = 'Неверный код. Попробуйте снова.';
        _loading = false;
      });
      for (final c in _controllers) c.clear();
      if (mounted) _focusNodes[0].requestFocus();
    }
  }

  Future<void> _resend() async {
    setState(() { _error = null; _loading = true; });
    try {
      await DioClient().post(ApiConstants.sendCode, data: {
        'phone': widget.phone,
        if (widget.email != null) 'email': widget.email,
      });
      for (final c in _controllers) c.clear();
      _focusNodes[0].requestFocus();
      _startTimer();
    } catch (e) {
      setState(() => _error = 'Ошибка повторной отправки. Попробуйте позже.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final emailDisplay = widget.email ?? 'вашу почту';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => context.go(RouteNames.phone),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 20),
              // Email icon
              Container(
                width: 72, height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary.withOpacity(0.15),
                  border: Border.all(color: AppColors.primary.withOpacity(0.3), width: 1.5),
                ),
                child: Icon(Icons.mark_email_read_rounded, color: AppColors.primary, size: 36),
              ),
              const SizedBox(height: 20),
              const Text(
                'Введите код',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Colors.white),
              ),
              const SizedBox(height: 8),
              Text(
                'Мы отправили 5-значный код на\n$emailDisplay',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, color: AppColors.textSecondaryLight, height: 1.5),
              ),
              const SizedBox(height: 36),

              // 5-digit OTP input
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (i) => Container(
                  margin: const EdgeInsets.symmetric(horizontal: 5),
                  width: 52, height: 64,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.07),
                    border: Border.all(
                      color: _error != null
                          ? AppColors.error
                          : _focusNodes[i].hasFocus
                              ? AppColors.primary
                              : Colors.white24,
                      width: _focusNodes[i].hasFocus ? 1.5 : 1,
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: TextField(
                    controller: _controllers[i],
                    focusNode: _focusNodes[i],
                    textAlign: TextAlign.center,
                    keyboardType: TextInputType.number,
                    maxLength: 1,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                    decoration: const InputDecoration(
                      counterText: '',
                      border: InputBorder.none,
                    ),
                    onChanged: (v) => _onDigitChanged(i, v),
                    onTap: () {
                      _controllers[i].selection = TextSelection.fromPosition(
                        TextPosition(offset: _controllers[i].text.length),
                      );
                    },
                  ),
                )),
              ),

              if (_error != null) ...[
                const SizedBox(height: 16),
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

              const SizedBox(height: 24),

              // Resend timer / button
              if (_timer > 0)
                Text(
                  'Повторная отправка через $_timer с',
                  style: const TextStyle(color: AppColors.textSecondaryLight, fontSize: 14),
                )
              else
                TextButton(
                  onPressed: _loading ? null : _resend,
                  child: Text(
                    'Отправить код повторно',
                    style: TextStyle(color: AppColors.primary, fontSize: 15, fontWeight: FontWeight.w600),
                  ),
                ),

              const Spacer(),

              if (_loading) ...[
                const CircularProgressIndicator(),
                const SizedBox(height: 16),
              ],

              // Confirm button (for manual submit)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: (_code.length == 5 && !_loading) ? _verify : null,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Подтвердить', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
