# Premium Features (Премиум подписка и звёзды)

## Два экрана

### 1. PremiumScreen (Премиум подписка)

#### Описание
Экран для оформления премиум подписки с красивым интерфейсом и 3 планами.

#### Функциональность
- 👑 Анимированный градиентный баннер (золото → фиолетовый)
- ✨ Список 10 преимуществ с иконками в сетке 2х2
- 💳 Три плана подписки:
  - **Месяц**: 299⭐ (без скидки)
  - **6 месяцев**: 1499⭐ (скидка 25%)
  - **Год**: 2499⭐ (скидка 30%) — **выделен**
- 🎯 Выбор плана с визуальным выделением
- ⭐ Оформление подписки за звёзды
- ✅ Анимация успешной активации
- 💰 Диалог "Недостаточно звёзд" с переводом на покупку звёзд

#### API Integration
```dart
// Активация премиума
POST /api/users/me/premium
{
  "plan": "monthly" | "6months" | "yearly"
}
```

#### Использование
```dart
import 'package:dromgram/features/premium/presentation/premium_screen.dart';

MaterialPageRoute(builder: (_) => const PremiumScreen())
```

#### Технические детали
- **SingleTickerProviderStateMixin** для анимаций
- **AnimationController** для градиентного баннера
- **ScaleTransition** для успешной активации
- **AlertDialog** для диалога ошибки
- **GridView** для преимуществ
- **DioClient** для API запросов

---

### 2. StarsScreen (Покупка звёзд)

#### Описание
Экран для покупки внутриигровой валюты (звёзд) с 6 пакетами и историей транзакций.

#### Функциональность
- ⭐ **Большой счётчик баланса** с пульсирующей анимацией
- 📦 **6 пакетов звёзд** в сетке 2х2:
  - 50⭐ = 99₽
  - 100⭐ = 179₽
  - **250⭐ = 399₽** (Популярный — выделен)
  - 500⭐ = 749₽
  - 1000⭐ = 1299₽
  - 2500⭐ = 2999₽
- 💫 Диалог подтверждения перед покупкой
- 📱 Загрузка баланса (GET /api/stars/balance)
- 📊 История транзакций (GET /api/stars/transactions)
- 🔄 Автоматическое обновление баланса после покупки

#### API Integration
```dart
// Получить баланс
GET /api/stars/balance
Response: { "balance": 1000 }

// Получить историю транзакций
GET /api/stars/transactions
Response: {
  "transactions": [
    {
      "type": "income" | "expense",
      "amount": 100,
      "description": "Покупка пакета 100⭐",
      "date": "2024-01-15 10:30"
    }
  ]
}

// Купить пакет звёзд
POST /api/stars/purchase
{
  "package": "100" // количество звёзд
}
```

#### Использование
```dart
import 'package:dromgram/features/premium/presentation/stars_screen.dart';

MaterialPageRoute(builder: (_) => const StarsScreen())
```

#### Технические детали
- **SingleTickerProviderStateMixin** для анимаций
- **Animation** для пульсирующего счётчика
- **FutureBuilder** паттерн через setState (загрузка данных)
- **GridView.builder** для пакетов
- **ListView.separated** для истории с разделителями
- **AlertDialog** для подтверждения покупки
- **SnackBar** для уведомлений
- **Gradient** для красивого баланса карточки

---

## Общие требования

### Импорты
```dart
import 'package:flutter/material.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
```

### Цвета (AppColors)
- **primary**: #2AABEE (синий Telegram)
- **bgDark**: #17212B (основной фон)
- **bgSecondaryDark**: #232E3C (вторичный фон)
- **textDark**: #FFFFFF (основной текст)
- **textSecondaryDark**: #8D8D8D (дополнительный текст)

### Стили текста (AppTextStyles)
- **h1**: 22px, 600 вес
- **h2**: 18px, 600 вес
- **chatName**: 15px, 500 вес
- **badge**: 11px, 700 вес
- **timeMeta**: 13px, 400 вес

---

## Интеграция с навигацией

```dart
// В app_router.dart
const giftsRoute = '/gifts';
const premiumRoute = '/premium';
const starsRoute = '/stars';

// В routes
Route? _onGenerateRoute(RouteSettings settings) {
  return switch (settings.name) {
    giftsRoute => MaterialPageRoute(builder: (_) => const GiftsScreen()),
    premiumRoute => MaterialPageRoute(builder: (_) => const PremiumScreen()),
    starsRoute => MaterialPageRoute(builder: (_) => const StarsScreen()),
    _ => null,
  };
}
```

---

## Примеры использования в коде

### Переход на экран премиума
```dart
Navigator.pushNamed(context, '/premium');
```

### Переход на покупку звёзд из премиума
```dart
Navigator.pushNamed(context, '/stars');
```

### Отправка подарка
```dart
Navigator.pushNamed(context, '/gifts');
```

---

## Состояние и обработка ошибок

### PremiumScreen
- ✅ Успешная активация → анимация + снятие диалога
- ❌ Недостаточно звёзд → диалог с кнопкой "Купить звёзды"
- ❌ Другая ошибка → SnackBar с текстом ошибки

### StarsScreen
- ✅ Успех покупки → SnackBar + обновление баланса и истории
- ❌ Ошибка покупки → SnackBar красный с текстом
- ⏳ Загрузка → спиннер и disabled состояние

---

## Возможные улучшения

### PremiumScreen
- Добавить информацию о дате окончания текущей подписки
- История платежей премиума
- Опция отмены подписки
- Более детальное описание каждого преимущества

### StarsScreen
- Фильтрация истории транзакций (доход/расход)
- Экспорт истории в PDF
- Фаворит пакетов (избранные для быстрого доступа)
- Рекомендации по выбору пакета на основе прошлых покупок

