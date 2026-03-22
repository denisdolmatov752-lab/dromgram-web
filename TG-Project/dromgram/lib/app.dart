import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/di/providers.dart';

class DRomGramApp extends ConsumerWidget {
  const DRomGramApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final themeMode = ref.watch(themeModeProvider);

    ThemeMode mode = ThemeMode.system;
    if (themeMode == 'light') mode = ThemeMode.light;
    if (themeMode == 'dark') mode = ThemeMode.dark;

    return MaterialApp.router(
      title: 'DRomGram',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: mode,
      routerConfig: router,
    );
  }
}
