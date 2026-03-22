import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';
import '../constants/app_constants.dart';
import 'package:logger/logger.dart';

class DioClient {
  static final DioClient _instance = DioClient._internal();
  factory DioClient() => _instance;
  DioClient._internal();

  final _logger = Logger();
  late final Dio _dio;
  final _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  Dio get dio => _dio;

  void init() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.apiUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: AppConstants.tokenKey);
        if (token != null) options.headers['Authorization'] = 'Bearer $token';
        _logger.d('REQUEST: ${options.method} ${options.path}');
        handler.next(options);
      },
      onResponse: (response, handler) {
        _logger.d('RESPONSE: ${response.statusCode} ${response.requestOptions.path}');
        handler.next(response);
      },
      onError: (error, handler) {
        _logger.e('ERROR: ${error.response?.statusCode} ${error.requestOptions.path}');
        handler.next(error);
      },
    ));
  }

  Future<Response> get(String path, {Map<String, dynamic>? params}) =>
      _dio.get(path, queryParameters: params);
  Future<Response> post(String path, {dynamic data}) => _dio.post(path, data: data);
  Future<Response> put(String path, {dynamic data}) => _dio.put(path, data: data);
  Future<Response> delete(String path, {dynamic data}) => _dio.delete(path, data: data);
  Future<Response> uploadFile(String path, FormData formData,
      {void Function(int, int)? onSendProgress}) =>
      _dio.post(path, data: formData, onSendProgress: onSendProgress);
}
