import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_colors.dart';

class AvatarWidget extends StatelessWidget {
  final String? avatarUrl;
  final String name;
  final double size;
  final bool showOnline;
  final String avatarColor;

  const AvatarWidget({super.key, this.avatarUrl, required this.name, this.size = 46, this.showOnline = false, this.avatarColor = '#2AABEE'});

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) { return AppColors.primary; }
  }

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.isEmpty || parts[0].isEmpty) return '?';
    final f = parts[0][0].toUpperCase();
    final l = parts.length > 1 && parts[1].isNotEmpty ? parts[1][0].toUpperCase() : '';
    return '$f$l';
  }

  @override
  Widget build(BuildContext context) {
    final avatar = avatarUrl != null && avatarUrl!.isNotEmpty
        ? ClipOval(child: CachedNetworkImage(imageUrl: avatarUrl!, width: size, height: size, fit: BoxFit.cover,
            placeholder: (c, u) => _placeholder(), errorWidget: (c, u, e) => _placeholder()))
        : _placeholder();

    if (!showOnline) return avatar;
    return Stack(children: [
      avatar,
      Positioned(right: 0, bottom: 0, child: Container(
        width: size * 0.28, height: size * 0.28,
        decoration: BoxDecoration(color: AppColors.online, shape: BoxShape.circle,
          border: Border.all(color: Theme.of(context).scaffoldBackgroundColor, width: 2)),
      ))
    ]);
  }

  Widget _placeholder() => Container(
    width: size, height: size,
    decoration: BoxDecoration(shape: BoxShape.circle, color: _parseColor(avatarColor)),
    child: Center(child: Text(initials, style: TextStyle(color: Colors.white, fontSize: size * 0.38, fontWeight: FontWeight.w600))),
  );
}
