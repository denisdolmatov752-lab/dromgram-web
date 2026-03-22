# Gifts Screen (Маркет подарков)

## Описание
Полнофункциональный экран маркета подарков DRomGram с поддержкой Material 3 и тёмной темы.

## Функциональность
- 🎁 Отображение NFT подарков в сетке 2х2
- 🔍 Поиск подарков по названию
- 🎯 Фильтрация по редкости (Все/Common/Rare/Epic/Legendary)
- 📊 Динамическая цветовая кодировка редкости:
  - Common: серый
  - Rare: синий (#2AABEE)
  - Epic: фиолетовый
  - Legendary: золотой
- 💝 Bottom Sheet с деталями подарка
- 📸 Загрузка изображений с https://orproject.ru/nft/{name}.png
- ⭐ Отправка подарка за звёзды (API: POST /api/gifts/send)
- 🎨 Плавные анимации и переходы
- 📱 Адаптивный дизайн для всех размеров экранов

## API Integration
```dart
// Отправка подарка
POST /api/gifts/send
{
  "nftName": "Dragon",
  "toUsername": "username",
  "price": 450
}
```

## Использование
```dart
import 'package:dromgram/features/gifts/presentation/gifts_screen.dart';

// В Router или Navigation
MaterialPageRoute(builder: (_) => const GiftsScreen())
```

## Встроенные данные
18 NFT с предустановленными ценами и редкостью:
- 5 Common (55-95⭐)
- 4 Rare (130-200⭐)
- 4 Epic (200-350⭐)
- 1 Legendary (450⭐)

## Технические детали
- **StatefulWidget** для управления состоянием поиска и фильтров
- **TextEditingController** для управления поиском
- **GridView.builder** для эффективной визуализации
- **Image.network** с error handling
- **showModalBottomSheet** для деталей подарка
- **DioClient** для API запросов
- **AppColors** и **AppTextStyles** для консистентного дизайна

## Возможные улучшения
- Кэширование изображений NFT
- Пагинация для больших списков
- Сохранение истории отправленных подарков
- Рейтинг популярности подарков
