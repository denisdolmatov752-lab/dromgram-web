import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:async';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/socket_service.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../shared/widgets/avatar_widget.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final String chatId;
  final String chatName;
  const ChatScreen({super.key, required this.chatId, required this.chatName});
  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _messageCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  List<dynamic> _messages = [];
  bool _loading = true;
  bool _sending = false;
  bool _isTyping = false;
  String? _typingUser;
  Timer? _typingTimer;
  String? _currentUserId;
  Map? _chatInfo;
  String? _replyToId;
  Map? _replyToMsg;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final token = await SecureStorageService().getToken();
    // decode userId from token
    if (token != null) {
      try {
        final parts = token.split('.');
        if (parts.length == 3) {
          final payload = parts[1];
          final padded = payload + '=' * ((4 - payload.length % 4) % 4);
          final decoded = String.fromCharCodes(Uri.parse('data:text/plain;base64,$padded').data!.contentAsBytes());
          final json = Map<String, dynamic>.from(decoded as dynamic);
          _currentUserId = json['userId'];
        }
      } catch (_) {}
    }
    await _loadMessages();
    _setupSocket();
  }

  Future<void> _loadMessages() async {
    try {
      final resp = await DioClient().get('${ApiConstants.messages}/${widget.chatId}');
      final chatResp = await DioClient().get('${ApiConstants.chats}/${widget.chatId}');
      if (mounted) setState(() {
        _messages = resp.data['data'] ?? [];
        _chatInfo = chatResp.data['data'];
        _loading = false;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _setupSocket() {
    final socket = SocketService();
    socket.joinChat(widget.chatId);
    socket.on('new_message', (data) {
      if (data['message']['chatId'] == widget.chatId && mounted) {
        setState(() => _messages.add(data['message']));
        _scrollToBottom();
        socket.markRead(data['message']['id'], widget.chatId);
      }
    });
    socket.on('typing_start', (data) {
      if (data['chatId'] == widget.chatId && mounted) {
        setState(() { _isTyping = true; _typingUser = data['userName']; });
        _typingTimer?.cancel();
        _typingTimer = Timer(const Duration(seconds: 5), () {
          if (mounted) setState(() { _isTyping = false; _typingUser = null; });
        });
      }
    });
    socket.on('typing_stop', (data) {
      if (data['chatId'] == widget.chatId && mounted) {
        setState(() { _isTyping = false; _typingUser = null; });
      }
    });
    socket.on('message_updated', (data) {
      if (mounted) {
        final idx = _messages.indexWhere((m) => m['id'] == data['message']['id']);
        if (idx >= 0) setState(() => _messages[idx] = data['message']);
      }
    });
    socket.on('message_deleted', (data) {
      if (mounted && data['chatId'] == widget.chatId) {
        setState(() => _messages.removeWhere((m) => m['id'] == data['messageId']));
      }
    });
  }

  void _scrollToBottom() {
    if (_scrollCtrl.hasClients) {
      _scrollCtrl.animateTo(_scrollCtrl.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
    }
  }

  void _onTextChanged(String val) {
    if (val.isNotEmpty) {
      SocketService().startTyping(widget.chatId);
    } else {
      SocketService().stopTyping(widget.chatId);
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageCtrl.text.trim();
    if (text.isEmpty || _sending) return;
    HapticFeedback.lightImpact();
    setState(() { _sending = true; });
    _messageCtrl.clear();
    SocketService().stopTyping(widget.chatId);
    try {
      final resp = await DioClient().post(ApiConstants.messages, data: {
        'chatId': widget.chatId, 'type': 'TEXT', 'text': text,
        if (_replyToId != null) 'replyToId': _replyToId,
      });
      if (mounted) {
        setState(() {
          _messages.add(resp.data['data']);
          _replyToId = null;
          _replyToMsg = null;
          _sending = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _showMessageMenu(Map msg) {
    HapticFeedback.mediumImpact();
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
        const SizedBox(height: 8),
        Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
        const SizedBox(height: 8),
        ListTile(leading: const Icon(Icons.reply), title: const Text('Ответить'), onTap: () {
          setState(() { _replyToId = msg['id']; _replyToMsg = msg; });
          Navigator.pop(context);
        }),
        if (msg['type'] == 'TEXT') ListTile(leading: const Icon(Icons.copy), title: const Text('Копировать'), onTap: () {
          Clipboard.setData(ClipboardData(text: msg['text'] ?? ''));
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Скопировано'), duration: Duration(seconds: 1)));
        }),
        ListTile(leading: const Icon(Icons.share), title: const Text('Переслать'), onTap: () => Navigator.pop(context)),
        if (msg['senderId'] == _currentUserId) ...[
          ListTile(leading: const Icon(Icons.delete, color: AppColors.error), title: const Text('Удалить', style: TextStyle(color: AppColors.error)), onTap: () async {
            Navigator.pop(context);
            HapticFeedback.heavyImpact();
            await DioClient().delete('${ApiConstants.messages}/${msg['id']}', data: {'forAll': true});
            if (mounted) setState(() => _messages.removeWhere((m) => m['id'] == msg['id']));
          }),
        ],
      ])),
    );
  }

  @override
  void dispose() {
    _messageCtrl.dispose();
    _scrollCtrl.dispose();
    _typingTimer?.cancel();
    SocketService().leaveChat(widget.chatId);
    SocketService().off('new_message');
    SocketService().off('typing_start');
    SocketService().off('typing_stop');
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final chatBg = isDark ? AppColors.chatBgDark : AppColors.chatBgLight;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
        title: Row(children: [
          AvatarWidget(name: widget.chatName, size: 36, avatarUrl: _chatInfo?['avatarUrl']),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(widget.chatName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis),
            if (_isTyping && _typingUser != null)
              Text('$_typingUser печатает...', style: const TextStyle(fontSize: 12, color: AppColors.primary))
            else
              const Text('онлайн', style: TextStyle(fontSize: 12, color: AppColors.primary)),
          ])),
        ]),
        actions: [
          IconButton(icon: const Icon(Icons.videocam_outlined), onPressed: () {}),
          IconButton(icon: const Icon(Icons.phone_outlined), onPressed: () {}),
          IconButton(icon: const Icon(Icons.more_vert), onPressed: () {}),
        ],
      ),
      body: Column(children: [
        Expanded(
          child: Container(
            color: chatBg,
            child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _messages.isEmpty
                ? const Center(child: Text('Нет сообщений. Начните разговор!', style: TextStyle(color: AppColors.textSecondaryLight)))
                : ListView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                    itemCount: _messages.length,
                    itemBuilder: (ctx, i) => _buildMessage(_messages[i]),
                  ),
          ),
        ),
        if (_replyToMsg != null) _buildReplyPreview(),
        _buildInputBar(),
      ]),
    );
  }

  Widget _buildMessage(Map msg) {
    final isMe = msg['senderId'] == _currentUserId;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bubbleColor = isMe
      ? (isDark ? AppColors.bubbleOutDark : AppColors.bubbleOutLight)
      : (isDark ? AppColors.bubbleInDark : AppColors.bubbleInLight);
    final time = msg['createdAt'] != null ? _formatTime(msg['createdAt']) : '';
    return GestureDetector(
      onLongPress: () => _showMessageMenu(msg),
      onHorizontalDragEnd: (d) { if (d.primaryVelocity! > 0) setState(() { _replyToId = msg['id']; _replyToMsg = msg; }); },
      child: Align(
        alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 2, horizontal: 4),
          constraints: const BoxConstraints(maxWidth: 280),
          decoration: BoxDecoration(
            color: bubbleColor,
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(16), topRight: const Radius.circular(16),
              bottomLeft: isMe ? const Radius.circular(16) : const Radius.circular(4),
              bottomRight: isMe ? const Radius.circular(4) : const Radius.circular(16),
            ),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2))],
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              if (msg['replyTo'] != null) Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8), border: const Border(left: BorderSide(color: AppColors.primary, width: 3))),
                child: Text(msg['replyTo']['text'] ?? 'Сообщение', maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)),
              ),
              if (msg['forwardFromName'] != null) Text('Переслано от ${msg['forwardFromName']}', style: const TextStyle(fontSize: 12, color: AppColors.primary, fontStyle: FontStyle.italic)),
              if (msg['text'] != null) Text(msg['text'], style: const TextStyle(fontSize: 16, height: 1.4)),
              const SizedBox(height: 4),
              Row(mainAxisSize: MainAxisSize.min, children: [
                if (msg['isEdited'] == true) const Text('ред. ', style: TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                Text(time, style: TextStyle(fontSize: 11, color: isMe ? AppColors.timeOutLight : AppColors.textSecondaryLight)),
                if (isMe) ...[
                  const SizedBox(width: 4),
                  Icon(_getStatusIcon(msg['status']), size: 14, color: msg['status'] == 'READ' ? AppColors.tickReadLight : AppColors.textSecondaryLight),
                ],
              ]),
            ]),
          ),
        ),
      ),
    );
  }

  IconData _getStatusIcon(String? status) {
    switch (status) {
      case 'SENDING': return Icons.access_time;
      case 'SENT': return Icons.check;
      case 'DELIVERED': return Icons.done_all;
      case 'READ': return Icons.done_all;
      case 'FAILED': return Icons.error_outline;
      default: return Icons.check;
    }
  }

  String _formatTime(String iso) {
    final dt = DateTime.tryParse(iso)?.toLocal();
    if (dt == null) return '';
    return '${dt.hour.toString().padLeft(2,'0')}:${dt.minute.toString().padLeft(2,'0')}';
  }

  Widget _buildReplyPreview() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Theme.of(context).scaffoldBackgroundColor,
      child: Row(children: [
        Container(width: 3, height: 36, color: AppColors.primary),
        const SizedBox(width: 8),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Ответить', style: TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w600)),
          Text(_replyToMsg?['text'] ?? 'Сообщение', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
        ])),
        IconButton(icon: const Icon(Icons.close, size: 18), onPressed: () => setState(() { _replyToId = null; _replyToMsg = null; })),
      ]),
    );
  }

  Widget _buildInputBar() {
    return Container(
      padding: EdgeInsets.only(left: 8, right: 8, top: 8, bottom: MediaQuery.of(context).padding.bottom + 8),
      decoration: BoxDecoration(color: Theme.of(context).scaffoldBackgroundColor, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)]),
      child: Row(children: [
        IconButton(icon: const Icon(Icons.attach_file), onPressed: () {}, color: AppColors.textSecondaryLight),
        Expanded(child: Container(
          decoration: BoxDecoration(
            color: Theme.of(context).brightness == Brightness.dark ? AppColors.surfaceDark : AppColors.bgSecondaryLight,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Row(children: [
            const SizedBox(width: 12),
            Expanded(child: TextField(
              controller: _messageCtrl,
              maxLines: null,
              onChanged: _onTextChanged,
              decoration: const InputDecoration(hintText: 'Сообщение...', border: InputBorder.none, contentPadding: EdgeInsets.symmetric(vertical: 10)),
            )),
            IconButton(icon: const Icon(Icons.emoji_emotions_outlined), onPressed: () {}, color: AppColors.textSecondaryLight),
          ]),
        )),
        const SizedBox(width: 8),
        ValueListenableBuilder<TextEditingValue>(
          valueListenable: _messageCtrl,
          builder: (_, val, __) => GestureDetector(
            onTap: val.text.isNotEmpty ? _sendMessage : null,
            child: Container(
              width: 44, height: 44,
              decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
              child: Icon(val.text.isNotEmpty ? Icons.send : Icons.mic, color: Colors.white, size: 20),
            ),
          ),
        ),
      ]),
    );
  }
}
