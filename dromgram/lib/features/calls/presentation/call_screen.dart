import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/dio_client.dart';

class CallScreen extends StatefulWidget {
  final String callId;
  final String callType;
  final String remoteUserId;
  const CallScreen({super.key, required this.callId, required this.callType, required this.remoteUserId});
  @override
  State<CallScreen> createState() => _CallScreenState();
}

class _CallScreenState extends State<CallScreen> {
  bool _muted = false;
  bool _speakerOn = false;
  bool _cameraOn = true;

  Future<void> _endCall() async {
    try { await DioClient().put('/calls/${widget.callId}/end'); } catch (_) {}
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final isVideo = widget.callType == 'VIDEO';
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A2E),
      body: SafeArea(
        child: Column(children: [
          const SizedBox(height: 48),
          const CircleAvatar(radius: 60, backgroundColor: AppColors.primary, child: Icon(Icons.person, size: 60, color: Colors.white)),
          const SizedBox(height: 24),
          const Text('Звонок...', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
          const SizedBox(height: 8),
          Text(isVideo ? 'Видеозвонок' : 'Голосовой звонок', style: const TextStyle(fontSize: 16, color: Colors.white60)),
          const Spacer(),
          Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
            _callBtn(Icons.mic_off, 'Mute', _muted, () => setState(() => _muted = !_muted)),
            _callBtn(Icons.volume_up, 'Динамик', _speakerOn, () => setState(() => _speakerOn = !_speakerOn)),
            if (isVideo) _callBtn(Icons.videocam_off, 'Камера', !_cameraOn, () => setState(() => _cameraOn = !_cameraOn)),
          ]),
          const SizedBox(height: 32),
          GestureDetector(
            onTap: _endCall,
            child: Container(width: 72, height: 72, decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
              child: const Icon(Icons.call_end, color: Colors.white, size: 32)),
          ),
          const SizedBox(height: 48),
        ]),
      ),
    );
  }

  Widget _callBtn(IconData icon, String label, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(children: [
        Container(width: 56, height: 56, decoration: BoxDecoration(color: active ? AppColors.primary : Colors.white24, shape: BoxShape.circle),
          child: Icon(icon, color: Colors.white, size: 24)),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(color: Colors.white60, fontSize: 12)),
      ]),
    );
  }
}
