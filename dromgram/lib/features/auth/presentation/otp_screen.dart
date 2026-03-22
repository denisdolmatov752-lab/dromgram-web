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
  const OtpScreen({super.key, required this.phone, required this.isNewUser});
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
    Future.delayed(const Duration(milliseconds: 300), () => _focusNodes[0].requestFocus());
  }

  void _startTimer() {
    _countdown = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_timer <= 0) { t.cancel(); return; }
      if (mounted) setState(() => _timer--);
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
    if (val.length == 1 && idx < 4) {
      _focusNodes[idx + 1].requestFocus();
    } else if (val.isEmpty && idx > 0) {
      _focusNodes[idx - 1].requestFocus();
    }
    setState(() {});
    if (_code.length == 5 && !_loading) {
      Future.delayed(const Duration(milliseconds: 100), () {
        if (_code.length == 5 && !_loading && mounted) _verify();
      });
    }
  }

  Future<void> _verify() async {
    if (_loading) return;
    setState(() { _loading = true; _error = null; });
    try {
      final info = DeviceInfoPlugin();
      String deviceName = 'Android', deviceOs = 'Android';
      if (Platform.isAndroid) {
        final a = await info.androidInfo;
        deviceName = '${a.manufacturer} ${a.model}';
        deviceOs = 'Android ${a.version.release}';
      }
      final resp = await DioClient().post(ApiConstants.verifyCode, data: {
        'phone': widget.phone, 'code': _code, 'deviceName': deviceName, 'deviceOs': deviceOs
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
      setState(() { _error = 'Неверный код. Попробуйте снова.'; _loading = false; });
      for (final c in _controllers) c.clear();
      _focusNodes[0].requestFocus();
    }
  }

  Future<void> _resend() async {
    try {
      await DioClient().post(ApiConstants.sendCode, data: {'phone': widget.phone});
      setState(() { _timer = 60; _error = null; });
      _startTimer();
    } catch (e) {
      setState(() => _error = 'Ошибка повторной отправки');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(leading: BackButton(onPressed: () => context.go(RouteNames.phone))),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(children: [
            const SizedBox(height: 20),
            const Text('Введите код', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text('Мы отправили SMS на ${widget.phone}', textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondaryLight)),
            const SizedBox(height: 40),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(5, (i) =>
              Container(margin: const EdgeInsets.symmetric(horizontal: 6),
                width: 50, height: 60,
                decoration: BoxDecoration(
                  border: Border.all(color: _error != null ? AppColors.error : AppColors.dividerLight, width: _focusNodes[i].hasFocus ? 2 : 1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TextField(
                  controller: _controllers[i], focusNode: _focusNodes[i],
                  textAlign: TextAlign.center, keyboardType: TextInputType.number,
                  maxLength: 1, inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  decoration: const InputDecoration(counterText: '', border: InputBorder.none),
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
                  onChanged: (v) => _onDigitChanged(i, v),
                )))),
            if (_error != null) ...[const SizedBox(height: 16), Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13))],
            const SizedBox(height: 24),
            _timer > 0
              ? Text('Повторная отправка через $_timer с', style: const TextStyle(color: AppColors.textSecondaryLight))
              : TextButton(onPressed: _resend, child: const Text('Отправить код повторно')),
            const Spacer(),
            if (_loading) const CircularProgressIndicator(),
          ]),
        ),
      ),
    );
  }
}
