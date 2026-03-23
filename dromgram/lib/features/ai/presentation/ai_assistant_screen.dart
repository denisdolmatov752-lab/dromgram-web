import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/theme/app_colors.dart';

class _AiMessage {
  final String id;
  final bool isUser;
  final String text;
  final String? imageBase64;
  final String? imageMime;
  final DateTime time;
  final bool isError;

  _AiMessage({
    required this.id,
    required this.isUser,
    required this.text,
    this.imageBase64,
    this.imageMime,
    required this.time,
    this.isError = false,
  });
}

class AiAssistantScreen extends StatefulWidget {
  const AiAssistantScreen({super.key});

  @override
  State<AiAssistantScreen> createState() => _AiAssistantScreenState();
}

class _AiAssistantScreenState extends State<AiAssistantScreen>
    with TickerProviderStateMixin {
  final _ctrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _picker = ImagePicker();
  final List<_AiMessage> _messages = [];
  bool _loading = false;
  String? _pendingImageBase64;
  String? _pendingImageMime;
  File? _pendingImageFile;
  late AnimationController _dotController;

  final List<Map<String, String>> _quickPrompts = [
    {'icon': '✍️', 'text': 'Помоги написать сообщение'},
    {'icon': '🌐', 'text': 'Переведи на английский'},
    {'icon': '💡', 'text': 'Придумай идею'},
    {'icon': '🔍', 'text': 'Объясни что-то'},
    {'icon': '😄', 'text': 'Расскажи анекдот'},
    {'icon': '📝', 'text': 'Помоги с текстом'},
  ];

  @override
  void initState() {
    super.initState();
    _dotController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _scrollCtrl.dispose();
    _dotController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picked = await _picker.pickImage(
        source: source,
        maxWidth: 1280,
        maxHeight: 1280,
        imageQuality: 85,
      );
      if (picked == null) return;

      final file = File(picked.path);
      final bytes = await file.readAsBytes();
      // Limit 4MB
      if (bytes.length > 4 * 1024 * 1024) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Фото слишком большое (макс. 4 МБ)')),
          );
        }
        return;
      }

      final base64Str = base64Encode(bytes);
      final ext = picked.path.split('.').last.toLowerCase();
      final mime = ext == 'png' ? 'image/png' : 'image/jpeg';

      setState(() {
        _pendingImageFile = file;
        _pendingImageBase64 = base64Str;
        _pendingImageMime = mime;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Не удалось загрузить фото')),
        );
      }
    }
  }

  void _showImageSourceDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: BoxDecoration(
          color: Theme.of(context).brightness == Brightness.dark
              ? const Color(0xFF1E2030)
              : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Прикрепить фото',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.camera_alt, color: AppColors.primary),
              ),
              title: const Text('Камера'),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.photo_library, color: AppColors.primary),
              ),
              title: const Text('Галерея'),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<void> _send() async {
    final text = _ctrl.text.trim();
    if ((text.isEmpty && _pendingImageBase64 == null) || _loading) return;

    HapticFeedback.lightImpact();

    final imageB64 = _pendingImageBase64;
    final imageMime = _pendingImageMime;
    final displayText = text.isNotEmpty ? text : 'Что на этом фото?';

    final userMsg = _AiMessage(
      id: '${DateTime.now().millisecondsSinceEpoch}-u',
      isUser: true,
      text: displayText,
      imageBase64: imageB64,
      imageMime: imageMime,
      time: DateTime.now(),
    );

    setState(() {
      _messages.add(userMsg);
      _ctrl.clear();
      _pendingImageBase64 = null;
      _pendingImageMime = null;
      _pendingImageFile = null;
      _loading = true;
    });
    _scrollToBottom();

    try {
      // Build messages payload (last 20 for context)
      final history = _messages.take(_messages.length).toList();
      final payloadMessages = <Map<String, dynamic>>[];
      for (final m in history) {
        if (m.imageBase64 != null && m.isUser) {
          payloadMessages.add({
            'role': 'user',
            'content': [
              {
                'type': 'image_url',
                'image_url': {
                  'url': 'data:${m.imageMime ?? "image/jpeg"};base64,${m.imageBase64}',
                },
              },
              {'type': 'text', 'text': m.text},
            ],
          });
        } else {
          payloadMessages.add({
            'role': m.isUser ? 'user' : 'assistant',
            'content': m.text,
          });
        }
      }

      final response = await DioClient().post(
        '/ai/chat',
        data: {'messages': payloadMessages},
      );

      final content = response.data['data']['content'] as String? ?? 'Нет ответа';
      final aiMsg = _AiMessage(
        id: '${DateTime.now().millisecondsSinceEpoch}-a',
        isUser: false,
        text: content,
        time: DateTime.now(),
      );

      setState(() {
        _messages.add(aiMsg);
        _loading = false;
      });
    } catch (e) {
      String errText = '❌ Ошибка при обращении к AI. Попробуйте снова.';
      if (e is DioException) {
        final detail = e.response?.data?['detail'] ?? e.response?.data?['error'];
        if (detail != null) errText = '❌ AI ошибка: $detail';
      }
      setState(() {
        _messages.add(_AiMessage(
          id: '${DateTime.now().millisecondsSinceEpoch}-err',
          isUser: false,
          text: errText,
          time: DateTime.now(),
          isError: true,
        ));
        _loading = false;
      });
    }
    _scrollToBottom();
  }

  String _formatTime(DateTime t) {
    final h = t.hour.toString().padLeft(2, '0');
    final m = t.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0F1117) : const Color(0xFFF5F5F5);
    final inputBg = isDark ? const Color(0xFF1E2030) : Colors.white;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF17212B) : Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: const Center(
                child: Text('✦', style: TextStyle(color: Colors.white, fontSize: 16)),
              ),
            ),
            const SizedBox(width: 12),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'DRomGram AI',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Text(
                  'Gemini 2.0 Flash · анализ фото ✓',
                  style: TextStyle(fontSize: 11, color: Colors.grey),
                ),
              ],
            ),
          ],
        ),
        actions: [
          if (_messages.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              tooltip: 'Очистить историю',
              onPressed: () => setState(() => _messages.clear()),
            ),
        ],
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: _messages.isEmpty
                ? _buildEmptyState(isDark)
                : ListView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
                    itemCount: _messages.length + (_loading ? 1 : 0),
                    itemBuilder: (ctx, i) {
                      if (_loading && i == _messages.length) {
                        return _buildTypingIndicator(isDark);
                      }
                      return _buildMessage(_messages[i], isDark);
                    },
                  ),
          ),

          // Pending image preview
          if (_pendingImageFile != null) _buildPendingImagePreview(),

          // Input bar
          _buildInputBar(inputBg, isDark),
        ],
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 40),
          Container(
            width: 90,
            height: 90,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: const Center(
              child: Text('✦', style: TextStyle(color: Colors.white, fontSize: 40)),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'DRomGram AI',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Ваш умный помощник. Спросите что угодно\nили отправьте фото для анализа!',
            textAlign: TextAlign.center,
            style: TextStyle(color: isDark ? Colors.white54 : Colors.black54),
          ),
          const SizedBox(height: 32),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 2.2,
            ),
            itemCount: _quickPrompts.length,
            itemBuilder: (ctx, i) {
              final p = _quickPrompts[i];
              return GestureDetector(
                onTap: () {
                  _ctrl.text = p['text']!;
                  _ctrl.selection = TextSelection.fromPosition(
                    TextPosition(offset: _ctrl.text.length),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withOpacity(0.06)
                        : Colors.black.withOpacity(0.04),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isDark ? Colors.white12 : Colors.black12,
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(p['icon']!, style: const TextStyle(fontSize: 20)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          p['text']!,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMessage(_AiMessage msg, bool isDark) {
    final isUser = msg.isUser;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isUser) ...[
            Container(
              width: 28,
              height: 28,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)],
                ),
              ),
              child: const Center(
                child: Text('✦', style: TextStyle(color: Colors.white, fontSize: 12)),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.75,
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isUser
                    ? AppColors.primary
                    : msg.isError
                        ? Colors.red.withOpacity(0.15)
                        : (isDark ? const Color(0xFF1E2030) : Colors.white),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: Radius.circular(isUser ? 18 : 4),
                  bottomRight: Radius.circular(isUser ? 4 : 18),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (msg.imageBase64 != null) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.memory(
                        base64Decode(msg.imageBase64!),
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: 180,
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                  if (msg.text.isNotEmpty)
                    Text(
                      msg.text,
                      style: TextStyle(
                        color: isUser
                            ? Colors.white
                            : msg.isError
                                ? Colors.red[300]
                                : (isDark ? Colors.white : Colors.black87),
                        fontSize: 14,
                      ),
                    ),
                  const SizedBox(height: 4),
                  Text(
                    _formatTime(msg.time),
                    style: TextStyle(
                      fontSize: 11,
                      color: isUser
                          ? Colors.white60
                          : (isDark ? Colors.white38 : Colors.black38),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypingIndicator(bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)],
              ),
            ),
            child: const Center(
              child: Text('✦', style: TextStyle(color: Colors.white, fontSize: 12)),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E2030) : Colors.white,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
                bottomRight: Radius.circular(18),
                bottomLeft: Radius.circular(4),
              ),
            ),
            child: Row(
              children: List.generate(3, (i) {
                return AnimatedBuilder(
                  animation: _dotController,
                  builder: (_, __) {
                    final offset = ((_dotController.value * 3) - i).clamp(0.0, 1.0);
                    final bounce = (offset < 0.5 ? offset : 1.0 - offset) * 2;
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      width: 7,
                      height: 7,
                      transform: Matrix4.translationValues(0, -4 * bounce, 0),
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.6),
                        shape: BoxShape.circle,
                      ),
                    );
                  },
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingImagePreview() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 4),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.file(
              _pendingImageFile!,
              width: 52,
              height: 52,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 10),
          const Expanded(
            child: Text(
              'Фото прикреплено. Напишите вопрос или отправьте сразу.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, size: 18, color: Colors.grey),
            onPressed: () => setState(() {
              _pendingImageFile = null;
              _pendingImageBase64 = null;
              _pendingImageMime = null;
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildInputBar(Color inputBg, bool isDark) {
    return Container(
      padding: const EdgeInsets.fromLTRB(8, 8, 8, 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF17212B) : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? Colors.white12 : Colors.black12,
            width: 0.5,
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            // Photo button
            GestureDetector(
              onTap: _showImageSourceDialog,
              child: Container(
                width: 42,
                height: 42,
                margin: const EdgeInsets.only(right: 6),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(21),
                ),
                child: Icon(
                  Icons.image_outlined,
                  color: _pendingImageBase64 != null ? AppColors.primary : Colors.grey,
                  size: 22,
                ),
              ),
            ),
            // Text field
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: inputBg,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: isDark ? Colors.white12 : Colors.black12,
                  ),
                ),
                child: TextField(
                  controller: _ctrl,
                  maxLines: null,
                  minLines: 1,
                  textInputAction: TextInputAction.newline,
                  keyboardType: TextInputType.multiline,
                  style: const TextStyle(fontSize: 14),
                  decoration: InputDecoration(
                    hintText: _pendingImageBase64 != null
                        ? 'Что хотите узнать о фото?'
                        : 'Спросите что угодно...',
                    hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    border: InputBorder.none,
                  ),
                  onSubmitted: (_) => _send(),
                ),
              ),
            ),
            const SizedBox(width: 6),
            // Send button
            GestureDetector(
              onTap: _send,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: (_ctrl.text.isNotEmpty || _pendingImageBase64 != null) && !_loading
                      ? AppColors.primary
                      : Colors.grey.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(21),
                ),
                child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
