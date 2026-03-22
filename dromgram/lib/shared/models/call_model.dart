import 'package:freezed_annotation/freezed_annotation.dart';
import 'user_model.dart';
part 'call_model.freezed.dart';
part 'call_model.g.dart';

@freezed
class CallModel with _$CallModel {
  const factory CallModel({
    required String id,
    required String callerId,
    UserModel? caller,
    required String receiverId,
    required String type,
    required String status,
    DateTime? startedAt,
    DateTime? endedAt,
    int? duration,
    DateTime? createdAt,
  }) = _CallModel;

  factory CallModel.fromJson(Map<String, dynamic> json) => _$CallModelFromJson(json);
}
