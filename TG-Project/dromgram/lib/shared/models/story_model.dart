import 'package:freezed_annotation/freezed_annotation.dart';
import 'user_model.dart';
part 'story_model.freezed.dart';
part 'story_model.g.dart';

@freezed
class StoryModel with _$StoryModel {
  const factory StoryModel({
    required String id,
    required String userId,
    UserModel? user,
    required String mediaUrl,
    required String mediaType,
    String? text,
    required DateTime expiresAt,
    @Default(0) int viewCount,
    DateTime? createdAt,
  }) = _StoryModel;

  factory StoryModel.fromJson(Map<String, dynamic> json) => _$StoryModelFromJson(json);
}
