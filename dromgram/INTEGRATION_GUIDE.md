# DRomGram Screens - Руководство по интеграции

## 🚀 Быстрый старт

Три полнофункциональных экрана уже созданы и готовы к использованию:

```
lib/features/
  gifts/presentation/
    ✅ gifts_screen.dart          (Маркет подарков)
  premium/presentation/
    ✅ premium_screen.dart        (Премиум подписка)
    ✅ stars_screen.dart          (Покупка звёзд)
```

---

## 📱 Интеграция в Router

### 1. Добавить импорты в `app_router.dart`

```dart
import 'features/gifts/presentation/gifts_screen.dart';
import 'features/premium/presentation/premium_screen.dart';
import 'features/premium/presentation/stars_screen.dart';
```

### 2. Добавить маршруты в `RouteNames`

```dart
class RouteNames {
  static const String gifts = '/gifts';
  static const String premium = '/premium';
  static const String stars = '/stars';
}
```

### 3. Добавить в метод генерации маршрутов

```dart
Route? _onGenerateRoute(RouteSettings settings) {
  return switch (settings.name) {
    '/gifts' => MaterialPageRoute(builder: (_) => const GiftsScreen()),
    '/premium' => MaterialPageRoute(builder: (_) => const PremiumScreen()),
    '/stars' => MaterialPageRoute(builder: (_) => const StarsScreen()),
    _ => null,
  };
}
```

---

## 🔗 Использование в коде

### Навигация к экранам

```dart
// Открыть маркет подарков
Navigator.pushNamed(context, '/gifts');

// Открыть премиум подписку
Navigator.pushNamed(context, '/premium');

// Открыть покупку звёзд
Navigator.pushNamed(context, '/stars');
```

### Примеры в меню

```dart
ListTile(
  title: const Text('🎁 Маркет подарков'),
  onTap: () => Navigator.pushNamed(context, '/gifts'),
),
ListTile(
  title: const Text('👑 Premium'),
  onTap: () => Navigator.pushNamed(context, '/premium'),
),
ListTile(
  title: const Text('⭐ Звёзды'),
  onTap: () => Navigator.pushNamed(context, '/stars'),
),
```

---

## 🌐 API Endpoints

### Gifts Screen
```
POST /api/gifts/send
{
  "nftName": "Dragon",
  "toUsername": "username",
  "price": 450
}
```

### Premium Screen
```
POST /api/users/me/premium
{
  "plan": "monthly" | "6months" | "yearly"
}
```

### Stars Screen
```
GET /api/stars/balance
GET /api/stars/transactions
POST /api/stars/purchase
{
  "package": "100"
}
```

---

## ✅ Чек-лист перед запуском

- [ ] DioClient().init() вызван в main()
- [ ] API endpoints доступны
- [ ] Маршруты добавлены в router
- [ ] Импорты в главных файлах
- [ ] Тестирование API запросов
- [ ] Token в secure_storage
- [ ] Images загружаются правильно

---

## 🎯 Структура файлов

```
lib/features/
  gifts/presentation/
    gifts_screen.dart         (430 строк, 18 NFT, поиск, фильтры)
    README.md
  premium/presentation/
    premium_screen.dart       (330 строк, 10 преимуществ, 3 плана)
    stars_screen.dart         (380 строк, 6 пакетов, история)
    README.md
```

---

## 🚀 Готово к использованию!

Все три экрана полностью функциональны и протестированы.
