import 'package:flutter/material.dart';
import 'package:photo_view/photo_view.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_colors.dart';

class MediaViewerScreen extends StatelessWidget {
  final String mediaUrl;
  final String mediaType;
  const MediaViewerScreen({super.key, required this.mediaUrl, required this.mediaType});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(backgroundColor: Colors.transparent, foregroundColor: Colors.white,
        actions: [
          IconButton(icon: const Icon(Icons.share), onPressed: () {}),
          IconButton(icon: const Icon(Icons.download), onPressed: () {}),
        ]),
      body: mediaType == 'photo'
        ? PhotoView(imageProvider: CachedNetworkImageProvider(mediaUrl),
            minScale: PhotoViewComputedScale.contained,
            maxScale: PhotoViewComputedScale.covered * 3,
            backgroundDecoration: const BoxDecoration(color: Colors.black))
        : Center(child: Text('Видео: $mediaUrl', style: const TextStyle(color: Colors.white))),
    );
  }
}
