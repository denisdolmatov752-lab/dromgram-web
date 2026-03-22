import 'package:flutter/material.dart';
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

  @override
  Widget build(BuildContext context) {
    final idx = _currentIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: idx,
        onTap: (i) {
          switch (i) {
            case 0: context.go('/contacts'); break;
            case 1: context.go('/calls'); break;
            case 2: context.go('/chats'); break;
            case 3: context.go('/channels'); break;
            case 4: context.go('/settings'); break;
          }
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.people_outline), activeIcon: Icon(Icons.people), label: 'Контакты'),
          BottomNavigationBarItem(icon: Icon(Icons.phone_outlined), activeIcon: Icon(Icons.phone), label: 'Звонки'),
          BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline), activeIcon: Icon(Icons.chat_bubble), label: 'Сообщения'),
          BottomNavigationBarItem(icon: Icon(Icons.campaign_outlined), activeIcon: Icon(Icons.campaign), label: 'Каналы'),
          BottomNavigationBarItem(icon: Icon(Icons.settings_outlined), activeIcon: Icon(Icons.settings), label: 'Настройки'),
        ],
      ),
    );
  }
}
