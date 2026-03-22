import 'package:freezed_annotation/freezed_annotation.dart';
part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String phone,
    required String firstName,
    String? lastName,
    String? username,
    String? bio,
    String? avatarUrl,
    @Default('#2AABEE') String avatarColor,
    @Default(false) bool isOnline,
    DateTime? lastSeen,
    @Default(false) bool isPremium,
    @Default(false) bool isAdmin,
    String? phonePrivacy,
    String? onlinePrivacy,
    DateTime? createdAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);

  static UserModel get empty => const UserModel(id: '', phone: '', firstName: '');
}

extension UserModelX on UserModel {
  String get fullName => lastName != null ? '$firstName $lastName' : firstName;
  String get initials {
    if (firstName.isEmpty) return '?';
    final f = firstName[0].toUpperCase();
    final l = (lastName?.isNotEmpty == true) ? lastName![0].toUpperCase() : '';
    return '$f$l';
  }
}
