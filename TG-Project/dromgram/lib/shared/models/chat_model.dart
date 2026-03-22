import 'package:freezed_annotation/freezed_annotation.dart';
import 'user_model.dart';
import 'message_model.dart';
part 'chat_model.freezed.dart';
part 'chat_model.g.dart';

@freezed
class ChatModel with _$ChatModel {
  const factory ChatModel({
    required String id,
    required String type,
    String? name,
    String? description,
    String? avatarUrl,
    String? avatarColor,
    String? username,
    @Default(false) bool isPublic,
    @Default(false) bool isChannel,
    String? pinnedMessageId,
    @Default([]) List<ChatMemberModel> members,
    List<MessageModel>? lastMessage,
    @Default(0) int unreadCount,
    @Default(false) bool isMuted,
    @Default(false) bool isPinned,
    @Default(false) bool isArchived,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _ChatModel;

  factory ChatModel.fromJson(Map<String, dynamic> json) => _$ChatModelFromJson(json);
}

@freezed
class ChatMemberModel with _$ChatMemberModel {
  const factory ChatMemberModel({
    required String id,
    required String chatId,
    required String userId,
    UserModel? user,
    @Default('MEMBER') String role,
    @Default(false) bool isMuted,
    @Default(false) bool isPinned,
    @Default(false) bool isArchived,
    String? lastReadMessageId,
    DateTime? joinedAt,
  }) = _ChatMemberModel;

  factory ChatMemberModel.fromJson(Map<String, dynamic> json) => _$ChatMemberModelFromJson(json);
}

extension ChatModelX on ChatModel {
  String get displayName {
    if (type == 'PRIVATE' || type == 'SECRET') {
      final otherMember = members.isNotEmpty ? members.first.user : null;
      return otherMember?.fullName ?? name ?? 'Чат';
    }
    return name ?? 'Группа';
  }

  String? get displayAvatarUrl {
    if (type == 'PRIVATE' || type == 'SECRET') {
      return members.isNotEmpty ? members.first.user?.avatarUrl : avatarUrl;
    }
    return avatarUrl;
  }

  bool get isPrivate => type == 'PRIVATE';
  bool get isGroup => type == 'GROUP';
  bool get isSaved => type == 'SAVED';
  bool get isSecret => type == 'SECRET';
}
