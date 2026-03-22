import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class UnreadBadge extends StatelessWidget {
  final int count;
  final bool muted;
  const UnreadBadge({super.key, required this.count, this.muted = false});

  @override
  Widget build(BuildContext context) {
    if (count <= 0) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: muted ? AppColors.unreadMuted : AppColors.unread, borderRadius: BorderRadius.circular(999)),
      child: Text(count > 9999 ? '9999+' : count.toString(),
          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
    );
  }
}
