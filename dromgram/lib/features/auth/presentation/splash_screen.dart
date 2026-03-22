import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/router/route_names.dart';
import '../../../core/theme/app_colors.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});
  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    await Future.delayed(const Duration(milliseconds: 1500));
    if (!mounted) return;
    final storage = SecureStorageService();
    final token = await storage.getToken();
    if (token != null) {
      context.go(RouteNames.chats);
    } else {
      context.go(RouteNames.phone);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: LinearGradient(colors: [AppColors.primary, AppColors.primaryDark], begin: Alignment.topLeft, end: Alignment.bottomRight)),
        child: Center(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Container(width: 100, height: 100, decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
              child: const Center(child: Text('D', style: TextStyle(fontSize: 56, fontWeight: FontWeight.w900, color: AppColors.primary))))
              .animate().scale(begin: const Offset(0, 0), end: const Offset(1, 1), duration: 600.ms, curve: Curves.easeOutBack),
            const SizedBox(height: 24),
            const Text(AppConstants.appName, style: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: Colors.white))
              .animate().fadeIn(delay: 300.ms, duration: 400.ms),
            const SizedBox(height: 8),
            const Text('Общайся без ограничений', style: TextStyle(fontSize: 16, color: Colors.white70))
              .animate().fadeIn(delay: 500.ms, duration: 400.ms),
          ]),
        ),
      ),
    );
  }
}
