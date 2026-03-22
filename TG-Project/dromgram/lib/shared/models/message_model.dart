import 'package:freezed_annotation/freezed_annotation.dart';
import 'user_model.dart';
part 'message_model.freezed.dart';
part 'message_model.g.dart';

@freezed
class MessageModel with _$MessageModel {
  const factory MessageModel({
    required String id,
    required String chatId,
    required String senderId,
    UserModel? sender,
    @Default('TEXT') String type,
    String? text,
    String? mediaUrl,
    String? mediaType,
    int? mediaSize,
    int? mediaDuration,
    int? mediaWidth,
    int? mediaHeight,
    String? fileName,
    String? mimeType,
    String? waveform,
    String? replyToId,
    MessageModel? replyTo,
    String? forwardFromId,
    String? forwardFromName,
    @Default(false) bool isEdited,
    DateTime? editedAt,
    @Default(false) bool isPinned,
    @Default(false) bool isDeleted,
    double? latitude,
    double? longitude,
    String? pollData,
    String? stickerSetId,
    String? stickerFileId,
    @Default('SENT') String status,
    @Default([]) List<ReactionModel> reactions,
    @Default([]) List<String> readByIds,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _MessageModel;

  factory MessageModel.fromJson(Map<String, dynamic> json) => _$MessageModelFromJson(json);
}

@freezed
class ReactionModel with _$ReactionModel {
  const factory ReactionModel({
    required String id,
    required String messageId,
    required String userId,
    UserModel? user,
    required String emoji,
    DateTime? createdAt,
  }) = _ReactionModel;

  factory ReactionModel.fromJson(Map<String, dynamic> json) => _$ReactionModelFromJson(json);
}
