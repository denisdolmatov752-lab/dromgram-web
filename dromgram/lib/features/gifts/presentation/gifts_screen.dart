import 'package:flutter/material.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class GiftsScreen extends StatefulWidget {
  const GiftsScreen({Key? key}) : super(key: key);

  @override
  State<GiftsScreen> createState() => _GiftsScreenState();
}

class _GiftsScreenState extends State<GiftsScreen> {
  static const _nfts = [
    {'name': 'Absinthe', 'display': 'Absinthe', 'price': 50, 'rarity': 'Common'},
    {'name': '8Ball', 'display': '8 Ball', 'price': 75, 'rarity': 'Common'},
    {'name': '2048', 'display': '2048', 'price': 80, 'rarity': 'Common'},
    {'name': '3DRender', 'display': '3D Render', 'price': 90, 'rarity': 'Common'},
    {'name': 'Abubu', 'display': 'Abubu', 'price': 60, 'rarity': 'Common'},
    {'name': 'Adventure', 'display': 'Adventure', 'price': 130, 'rarity': 'Rare'},
    {'name': 'Alien', 'display': 'Alien', 'price': 280, 'rarity': 'Epic'},
    {'name': 'Alchemy', 'display': 'Alchemy', 'price': 200, 'rarity': 'Rare'},
    {'name': 'Alpha', 'display': 'Alpha', 'price': 350, 'rarity': 'Epic'},
    {'name': 'Dragon', 'display': 'Dragon', 'price': 450, 'rarity': 'Legendary'},
    {'name': 'Academic', 'display': 'Academic', 'price': 85, 'rarity': 'Common'},
    {'name': 'AceMachine', 'display': 'Ace Machine', 'price': 95, 'rarity': 'Common'},
    {'name': '1May', 'display': '1 May', 'price': 55, 'rarity': 'Common'},
    {'name': '4thofJuly', 'display': '4th of July', 'price': 65, 'rarity': 'Common'},
    {'name': 'Abandoned', 'display': 'Abandoned', 'price': 70, 'rarity': 'Common'},
    {'name': 'AlienAttack', 'display': 'Alien Attack', 'price': 280, 'rarity': 'Epic'},
    {'name': 'Aladdin', 'display': 'Aladdin', 'price': 180, 'rarity': 'Rare'},
    {'name': 'AlCapone', 'display': 'Al Capone', 'price': 160, 'rarity': 'Rare'},
  ];

  late TextEditingController _searchController;
  String _selectedRarity = 'Все';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filteredNfts {
    return _nfts.where((nft) {
      final matchesSearch = nft['display']
          .toString()
          .toLowerCase()
          .contains(_searchController.text.toLowerCase());
      final matchesRarity =
          _selectedRarity == 'Все' || nft['rarity'] == _selectedRarity;
      return matchesSearch && matchesRarity;
    }).toList();
  }

  Color _getRarityColor(String rarity) {
    switch (rarity) {
      case 'Common':
        return Colors.grey;
      case 'Rare':
        return AppColors.primary;
      case 'Epic':
        return Colors.deepPurple;
      case 'Legendary':
        return Colors.amber;
      default:
        return Colors.grey;
    }
  }

  void _showGiftDetails(Map<String, dynamic> nft) {
    final recipientController = TextEditingController();

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bgSecondaryDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 2,
                width: 40,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppColors.textSecondaryDark,
                  borderRadius: BorderRadius.circular(1),
                ),
              ),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  'https://orproject.ru/nft/${nft['name']}.png',
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    height: 200,
                    color: AppColors.bgDark,
                    child: const Center(
                      child: Icon(Icons.image_not_supported,
                          color: AppColors.textSecondaryDark),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                nft['display'],
                style: AppTextStyles.h1.copyWith(
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: _getRarityColor(nft['rarity']).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  nft['rarity'],
                  style: AppTextStyles.badge.copyWith(
                    color: _getRarityColor(nft['rarity']),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: recipientController,
                decoration: InputDecoration(
                  hintText: 'Введите username получателя',
                  hintStyle:
                      const TextStyle(color: AppColors.textSecondaryDark),
                  filled: true,
                  fillColor: AppColors.bgDark,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                ),
                style: const TextStyle(color: AppColors.textDark),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isLoading
                      ? null
                      : () async {
                          setState(() => _isLoading = true);
                          try {
                            await DioClient().post('/api/gifts/send', data: {
                              'nftName': nft['name'],
                              'toUsername': recipientController.text.trim(),
                              'price': nft['price'],
                            });

                            if (mounted) {
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    'Подарок ${nft['display']} отправлен!',
                                    style: const TextStyle(
                                      color: Colors.white,
                                    ),
                                  ),
                                  backgroundColor: Colors.green,
                                  duration: const Duration(seconds: 2),
                                ),
                              );
                            }
                          } catch (e) {
                            setState(() => _isLoading = false);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    'Ошибка: ${e.toString()}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                    ),
                                  ),
                                  backgroundColor: Colors.red,
                                  duration: const Duration(seconds: 2),
                                ),
                              );
                            }
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    disabledBackgroundColor:
                        AppColors.primary.withOpacity(0.5),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                          ),
                        )
                      : Text(
                          'Подарить за ${nft['price']} ⭐',
                          style: AppTextStyles.chatName.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgDark,
        elevation: 0,
        title: const Text(
          '🎁 Маркет подарков',
          style: TextStyle(
            color: AppColors.textDark,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Поиск подарка...',
                    hintStyle:
                        const TextStyle(color: AppColors.textSecondaryDark),
                    prefixIcon: const Icon(Icons.search,
                        color: AppColors.textSecondaryDark),
                    filled: true,
                    fillColor: AppColors.bgSecondaryDark,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding:
                        const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  ),
                  style: const TextStyle(color: AppColors.textDark),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 40,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: ['Все', 'Common', 'Rare', 'Epic', 'Legendary']
                        .map((rarity) {
                      final isSelected = _selectedRarity == rarity;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(rarity),
                          selected: isSelected,
                          onSelected: (_) {
                            setState(() => _selectedRarity = rarity);
                          },
                          backgroundColor: AppColors.bgSecondaryDark,
                          selectedColor: AppColors.primary,
                          labelStyle: TextStyle(
                            color: isSelected
                                ? Colors.white
                                : AppColors.textDark,
                            fontWeight: FontWeight.w500,
                          ),
                          side: BorderSide.none,
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _filteredNfts.isEmpty
                ? Center(
                    child: Text(
                      'Ничего не найдено',
                      style: AppTextStyles.chatName.copyWith(
                        color: AppColors.textSecondaryDark,
                      ),
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.75,
                    ),
                    itemCount: _filteredNfts.length,
                    itemBuilder: (context, index) {
                      final nft = _filteredNfts[index];
                      return _buildNftCard(nft);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildNftCard(Map<String, dynamic> nft) {
    return GestureDetector(
      onTap: () => _showGiftDetails(nft),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.bgSecondaryDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.dividerDark),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(12)),
                child: Image.network(
                  'https://orproject.ru/nft/${nft['name']}.png',
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    color: AppColors.bgDark,
                    child: const Center(
                      child: Icon(Icons.image_not_supported,
                          color: AppColors.textSecondaryDark),
                    ),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    nft['display'],
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.chatName.copyWith(
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color:
                          _getRarityColor(nft['rarity']).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      nft['rarity'],
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: _getRarityColor(nft['rarity']),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '⭐ ${nft['price']}',
                    style: AppTextStyles.chatName.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    height: 32,
                    child: ElevatedButton(
                      onPressed: () => _showGiftDetails(nft),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: EdgeInsets.zero,
                      ),
                      child: const Text(
                        'Подарить',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
