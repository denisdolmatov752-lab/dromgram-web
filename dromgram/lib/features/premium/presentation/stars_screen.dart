import 'package:flutter/material.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class StarsScreen extends StatefulWidget {
  const StarsScreen({Key? key}) : super(key: key);

  @override
  State<StarsScreen> createState() => _StarsScreenState();
}

class _StarsScreenState extends State<StarsScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  int _balance = 0;
  bool _isLoadingBalance = true;
  bool _isLoadingTransactions = true;
  List<Map<String, dynamic>> _transactions = [];
  bool _isPurchasing = false;

  final _packages = [
    {'stars': 50, 'price': 99, 'label': '50⭐'},
    {'stars': 100, 'price': 179, 'label': '100⭐'},
    {'stars': 250, 'price': 399, 'label': '250⭐', 'popular': true},
    {'stars': 500, 'price': 749, 'label': '500⭐'},
    {'stars': 1000, 'price': 1299, 'label': '1000⭐'},
    {'stars': 2500, 'price': 2999, 'label': '2500⭐'},
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat();
    _scaleAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _loadBalance();
    _loadTransactions();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadBalance() async {
    try {
      final response = await DioClient().get('/api/stars/balance');
      if (mounted) {
        setState(() {
          _balance = response.data['balance'] as int? ?? 0;
          _isLoadingBalance = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingBalance = false);
      }
    }
  }

  Future<void> _loadTransactions() async {
    try {
      final response = await DioClient().get('/api/stars/transactions');
      if (mounted) {
        final data = response.data as Map<String, dynamic>?;
        final txList = data?['transactions'] as List? ?? [];
        setState(() {
          _transactions = txList.cast<Map<String, dynamic>>();
          _isLoadingTransactions = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingTransactions = false);
      }
    }
  }

  void _showPurchaseConfirmation(Map<String, dynamic> package) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.bgSecondaryDark,
        title: const Text(
          'Подтверждение покупки',
          style: TextStyle(color: AppColors.textDark),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${package['label']}',
              style: const TextStyle(
                color: AppColors.primary,
                fontSize: 24,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              '${package['price']}₽',
              style: const TextStyle(
                color: AppColors.textDark,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _purchasePackage(package);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
            ),
            child: const Text('Купить'),
          ),
        ],
      ),
    );
  }

  Future<void> _purchasePackage(Map<String, dynamic> package) async {
    setState(() => _isPurchasing = true);
    try {
      await DioClient().post('/api/stars/purchase', data: {
        'package': package['stars'].toString(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Успешно куплено ${package['label']}!',
              style: const TextStyle(color: Colors.white),
            ),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
        await _loadBalance();
        await _loadTransactions();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Ошибка: ${e.toString()}',
              style: const TextStyle(color: Colors.white),
            ),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isPurchasing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgDark,
        elevation: 0,
        title: const Text(
          '⭐ Звёзды',
          style: TextStyle(
            color: AppColors.textDark,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildBalanceCard(),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Выберите пакет',
                    style: TextStyle(
                      color: AppColors.textDark,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.9,
                    ),
                    itemCount: _packages.length,
                    itemBuilder: (context, index) {
                      final package = _packages[index];
                      final isPopular = package['popular'] as bool? ?? false;
                      return _buildPackageCard(package, isPopular);
                    },
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'История транзакций',
                    style: TextStyle(
                      color: AppColors.textDark,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildTransactionsList(),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBalanceCard() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary.withOpacity(0.8),
            AppColors.primary.withOpacity(0.5),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Текущий баланс',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 12),
          ScaleTransition(
            scale: _scaleAnimation,
            child: Row(
              children: [
                const Text(
                  '⭐',
                  style: TextStyle(fontSize: 32),
                ),
                const SizedBox(width: 12),
                _isLoadingBalance
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.white,
                          ),
                        ),
                      )
                    : Text(
                        _balance.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPackageCard(Map<String, dynamic> package, bool isPopular) {
    return GestureDetector(
      onTap: _isPurchasing ? null : () => _showPurchaseConfirmation(package),
      child: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              color: AppColors.bgSecondaryDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isPopular ? AppColors.primary : AppColors.dividerDark,
                width: isPopular ? 2 : 1,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (isPopular) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Популярный',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                Text(
                  '⭐',
                  style: TextStyle(
                    fontSize: isPopular ? 36 : 28,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  package['label'] as String,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${package['price']}₽',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          if (isPopular)
            Positioned(
              top: -10,
              right: -10,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: Colors.amber,
                  shape: BoxShape.circle,
                ),
                child: const Text(
                  '✨',
                  style: TextStyle(fontSize: 12),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTransactionsList() {
    if (_isLoadingTransactions) {
      return const SizedBox(
        height: 100,
        child: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(
              AppColors.primary,
            ),
          ),
        ),
      );
    }

    if (_transactions.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.bgSecondaryDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.dividerDark),
        ),
        child: Center(
          child: Text(
            'Нет транзакций',
            style: AppTextStyles.chatName.copyWith(
              color: AppColors.textSecondaryDark,
            ),
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgSecondaryDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.dividerDark),
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: _transactions.length,
        separatorBuilder: (context, index) => Divider(
          color: AppColors.dividerDark,
          height: 1,
          indent: 16,
          endIndent: 16,
        ),
        itemBuilder: (context, index) {
          final tx = _transactions[index];
          final isIncome = tx['type'] == 'income';
          final amount = tx['amount'] as dynamic;
          final amountStr = amount is int ? amount.toString() : amount;

          return Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tx['description'] as String? ?? 'Транзакция',
                      style: const TextStyle(
                        color: AppColors.textDark,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      tx['date'] as String? ?? 'Дата',
                      style: AppTextStyles.timeMeta.copyWith(
                        color: AppColors.textSecondaryDark,
                      ),
                    ),
                  ],
                ),
                Text(
                  '${isIncome ? '+' : '-'}⭐ $amountStr',
                  style: TextStyle(
                    color: isIncome ? Colors.green : AppColors.primary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
