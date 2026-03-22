import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';

class MainScaffold extends StatelessWidget {
  final Widget child;
  const MainScaffold({super.key, required this.child});

  int _currentIndex(BuildContext context) {
    final loc = GoRouterState.of(context).matchedLocation;
    if (loc.startsWith('/contacts')) return 0;
    if (loc.startsWith('/calls')) return 1;
    if (loc.startsWith('/chats')) return 2;
    if (loc.startsWith('/channels')) return 3;
    if (loc.startsWith('/settings')) return 4;
    return 2;
  }

  void _onTap(BuildContext context, int i) {
    HapticFeedback.lightImpact();
    switch (i) {
      case 0: context.go('/contacts'); break;
      case 1: context.go('/calls'); break;
      case 2: context.go('/chats'); break;
      case 3: context.go('/channels'); break;
      case 4: context.go('/settings'); break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final idx = _currentIndex(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      extendBody: true,
      body: child,
      bottomNavigationBar: _LiquidGlassNavBar(
        currentIndex: idx,
        isDark: isDark,
        onTap: (i) => _onTap(context, i),
      ),
    );
  }
}

class _LiquidGlassNavBar extends StatelessWidget {
  final int currentIndex;
  final bool isDark;
  final ValueChanged<int> onTap;

  const _LiquidGlassNavBar({
    required this.currentIndex,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final items = [
      _NavItem(Icons.people_outline, Icons.people, 'Контакты'),
      _NavItem(Icons.phone_outlined, Icons.phone, 'Звонки'),
      _NavItem(Icons.chat_bubble_outline, Icons.chat_bubble, 'Чаты'),
      _NavItem(Icons.campaign_outlined, Icons.campaign, 'Каналы'),
      _NavItem(Icons.settings_outlined, Icons.settings, 'Настройки'),
    ];

    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          decoration: BoxDecoration(
            color: isDark
                ? Colors.black.withOpacity(0.55)
                : Colors.white.withOpacity(0.72),
            border: Border(
              top: BorderSide(
                color: isDark
                    ? Colors.white.withOpacity(0.08)
                    : Colors.black.withOpacity(0.08),
                width: 0.5,
              ),
            ),
          ),
          child: SafeArea(
            top: false,
            child: SizedBox(
              height: 60,
              child: Row(
                children: List.generate(items.length, (i) {
                  final item = items[i];
                  final selected = i == currentIndex;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => onTap(i),
                      behavior: HitTestBehavior.opaque,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        curve: Curves.easeOutCubic,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              decoration: BoxDecoration(
                                color: selected ? AppColors.primary.withOpacity(0.15) : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                selected ? item.activeIcon : item.icon,
                                color: selected ? AppColors.primary : (isDark ? Colors.white54 : Colors.black45),
                                size: 24,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              item.label,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
                                color: selected ? AppColors.primary : (isDark ? Colors.white54 : Colors.black45),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _NavItem(this.icon, this.activeIcon, this.label);
}
