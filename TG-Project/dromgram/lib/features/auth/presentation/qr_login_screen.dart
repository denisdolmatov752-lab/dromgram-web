import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'dart:async';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/router/route_names.dart';
import '../../../core/theme/app_colors.dart';

class QrLoginScreen extends StatefulWidget {
  const QrLoginScreen({super.key});
  @override
  State<QrLoginScreen> createState() => _QrLoginScreenState();
}

class _QrLoginScreenState extends State<QrLoginScreen> {
  String? _qrToken;
  Timer? _refreshTimer;

  @override
  void initState() { super.initState(); _loadQr(); }

  @override
  void dispose() { _refreshTimer?.cancel(); super.dispose(); }

  Future<void> _loadQr() async {
    try {
      final resp = await DioClient().get(ApiConstants.qrLogin);
      if (mounted) setState(() => _qrToken = resp.data['data']['qrToken']);
      _refreshTimer = Timer(const Duration(seconds: 28), _loadQr);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Вход по QR-коду'), leading: BackButton(onPressed: () => context.go(RouteNames.phone))),
      body: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Text('Войдите с другого устройства', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        const Text('Откройте DRomGram → Настройки → Устройства → Подключить', textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondaryLight)),
        const SizedBox(height: 32),
        _qrToken != null
          ? QrImageView(data: 'dromgram://qr/$_qrToken', version: QrVersions.auto, size: 220, foregroundColor: Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black)
          : const CircularProgressIndicator(),
        const SizedBox(height: 32),
        TextButton(onPressed: () => context.go(RouteNames.phone), child: const Text('Войти по номеру телефона')),
      ])),
    );
  }
}
