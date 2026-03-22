import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:country_picker/country_picker.dart';
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
  final _phoneCtrl = TextEditingController();
  Country _country = Country(phoneCode: '7', countryCode: 'RU', e164Sc: 0, geographic: true, level: 1, name: 'Russia', example: '9123456789', displayName: 'Russia (RU) [+7]', displayNameNoCountryCode: 'Russia (RU)', e164Key: '');
  bool _loading = false;
  String? _error;

  @override
  void dispose() { _phoneCtrl.dispose(); super.dispose(); }

  String get _fullPhone => '+${_country.phoneCode}${_phoneCtrl.text.replaceAll(RegExp(r'\D'), '')}';

  Future<void> _sendCode() async {
    final phone = _fullPhone;
    if (phone.length < 8) { setState(() => _error = 'Введите корректный номер телефона'); return; }
    setState(() { _loading = true; _error = null; });
    try {
      final resp = await DioClient().post(ApiConstants.sendCode, data: {'phone': phone});
      if (!mounted) return;
      final data = resp.data['data'];
      context.go(RouteNames.otp, extra: {'phone': phone, 'isNewUser': data['isNewUser']});
    } catch (e) {
      setState(() { _error = 'Ошибка отправки кода. Проверьте номер.'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(children: [
            const SizedBox(height: 40),
            const Text('DRomGram', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: AppColors.primary)),
            const SizedBox(height: 12),
            const Text('Пожалуйста, подтвердите код страны\nи введите номер телефона', textAlign: TextAlign.center, style: TextStyle(fontSize: 15, color: AppColors.textSecondaryLight)),
            const SizedBox(height: 40),
            InkWell(
              onTap: () => showCountryPicker(context: context, showPhoneCode: true, onSelect: (c) => setState(() => _country = c)),
              child: Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(border: Border.all(color: AppColors.dividerLight), borderRadius: BorderRadius.circular(12)),
                child: Row(children: [
                  Text('${_country.flagEmoji} ${_country.name}', style: const TextStyle(fontSize: 16)),
                  const Spacer(),
                  Text('+${_country.phoneCode}', style: const TextStyle(fontSize: 16, color: AppColors.primary)),
                  const SizedBox(width: 4), const Icon(Icons.arrow_drop_down),
                ])),
            ),
            const SizedBox(height: 16),
            TextField(controller: _phoneCtrl, keyboardType: TextInputType.phone,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: const InputDecoration(hintText: 'Номер телефона', prefixIcon: Icon(Icons.phone_outlined)),
              onChanged: (_) => setState(() {})),
            if (_error != null) ...[const SizedBox(height: 8), Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13))],
            const Spacer(),
            ElevatedButton(
              onPressed: _loading || _phoneCtrl.text.length < 7 ? null : _sendCode,
              child: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Далее'),
            ),
            const SizedBox(height: 16),
            TextButton(onPressed: () => context.go(RouteNames.qrLogin), child: const Text('Войти по QR-коду')),
          ]),
        ),
      ),
    );
  }
}
