import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

interface StarPackage {
  id: string;
  stars: number;
  price: number;
  currency: string;
  savings?: number;
}

interface Transaction {
  id: string;
  type: 'purchase' | 'gift' | 'tip' | 'subscription' | 'earned';
  description: string;
  amount: number;
  timestamp: string;
  icon: string;
}

const STAR_PACKAGES: StarPackage[] = [
  { id: '50', stars: 50, price: 99, currency: '₽' },
  { id: '100', stars: 100, price: 179, currency: '₽' },
  { id: '250', stars: 250, price: 399, currency: '₽' },
  { id: '500', stars: 500, price: 749, currency: '₽' },
  { id: '1000', stars: 1000, price: 1299, currency: '₽' },
  { id: '2500', stars: 2500, price: 2999, currency: '₽' },
];

export default function StarsPanel() {
  const { user, updateUser } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const stars = user?.stars || 0;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stars/history');
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowPaymentModal(true);
  };

  const handlePurchaseComplete = (amount: number) => {
    const newStars = stars + amount;
    updateUser({ stars: newStars });
    setSuccessMessage(`✅ +${amount}⭐ звёзд добавлено в ваш баланс!`);
    setTimeout(() => {
      setSuccessMessage(null);
      setShowPaymentModal(false);
      setSelectedPackage(null);
    }, 2000);
    fetchTransactions();
  };

  return (
    <div className="panel-container bg-gradient-to-b from-slate-900 to-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="glass-header sticky top-0 z-40 p-4">
        <h1 className="text-xl font-bold text-white">⭐ Звёзды DRomGram</h1>
      </div>

      <div className="space-y-6 p-4">
        {/* Balance Card */}
        <div className="glass glass-strong rounded-lg p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-5xl">⭐</div>
            <div>
              <p className="text-white/70 text-sm">Ваш баланс</p>
              <p className="text-white text-4xl font-bold">{stars}</p>
            </div>
          </div>
          <p className="text-center text-white/60 text-sm">
            Используйте звёзды для подарков, подписок и поддержки авторов
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="glass glass-sm p-4 rounded-lg text-center text-white text-sm border border-green-500/30 bg-green-500/10">
            {successMessage}
          </div>
        )}

        {/* Buy Stars Section */}
        <div>
          <h2 className="text-white font-semibold mb-4">Купить звёзды</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {STAR_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handleSelectPackage(pkg.id)}
                className="glass glass-sm rounded-lg p-4 hover:bg-white/10 transition-all group"
              >
                <div className="text-3xl mb-2 text-center group-hover:scale-110 transition-transform">
                  ⭐
                </div>
                <p className="text-white font-bold text-lg text-center">{pkg.stars}</p>
                <p className="text-white/70 text-center mt-1 text-sm">
                  {pkg.price}
                  <span className="text-xs ml-0.5">{pkg.currency}</span>
                </p>
                {pkg.savings && (
                  <div className="mt-2 text-center text-xs text-green-300 font-semibold">
                    -{pkg.savings}%
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* How to Use */}
        <div>
          <h2 className="text-white font-semibold mb-4">Как использовать звёзды</h2>
          <div className="space-y-3">
            <HowToUseItem
              icon="🎁"
              title="Покупать подарки"
              desc="Дарите эксклюзивные NFT-подарки своим друзьям"
            />
            <HowToUseItem
              icon="⭐"
              title="Premium подписка"
              desc="Оформите подписку на DRomGram Premium"
            />
            <HowToUseItem
              icon="👍"
              title="Поддержать авторов"
              desc="Отправляйте звёзды создателям контента"
            />
          </div>
        </div>

        {/* Ways to Earn */}
        <div>
          <h2 className="text-white font-semibold mb-4">Получайте звёзды</h2>
          <div className="space-y-3">
            <EarnWayItem
              icon="🎁"
              title="Получайте подарки от друзей"
              desc="Когда друзья дарят вам подарки, вы получаете звёзды"
            />
            <EarnWayItem
              icon="📤"
              title="Приглашайте друзей"
              desc="Получите +50⭐ за каждого друга, который присоединится"
            />
            <EarnWayItem
              icon="🏆"
              title="Участвуйте в акциях"
              desc="Выигрывайте звёзды в еженедельных конкурсах"
            />
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">История транзакций</h2>
            {loading && <div className="spinner w-4 h-4"></div>}
          </div>

          {transactions.length === 0 ? (
            <div className="glass glass-sm p-8 rounded-lg text-center text-white/50">
              <p className="text-3xl mb-2">📜</p>
              <p className="text-sm">Пока нет транзакций</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="glass glass-sm p-4 rounded-lg text-white/70 text-xs space-y-2">
          <p>💡 Звёзды — виртуальная валюта DRomGram</p>
          <p>🔄 Обменять звёзды на деньги нельзя</p>
          <p>⏰ Минимальная покупка: 50⭐</p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <PaymentModal
          package={STAR_PACKAGES.find((p) => p.id === selectedPackage)!}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPackage(null);
          }}
          onSuccess={(amount) => handlePurchaseComplete(amount)}
        />
      )}
    </div>
  );
}

interface HowToUseItemProps {
  icon: string;
  title: string;
  desc: string;
}

function HowToUseItem({ icon, title, desc }: HowToUseItemProps) {
  return (
    <div className="glass glass-sm rounded-lg p-3 flex gap-3">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <p className="text-white text-sm font-semibold">{title}</p>
        <p className="text-white/60 text-xs">{desc}</p>
      </div>
    </div>
  );
}

interface EarnWayItemProps {
  icon: string;
  title: string;
  desc: string;
}

function EarnWayItem({ icon, title, desc }: EarnWayItemProps) {
  return (
    <div className="glass glass-sm rounded-lg p-3 flex gap-3 hover:bg-white/10 transition-colors cursor-pointer">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <p className="text-white text-sm font-semibold">{title}</p>
        <p className="text-white/60 text-xs">{desc}</p>
      </div>
    </div>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const isEarned = transaction.type === 'earned' || transaction.type === 'gift';

  return (
    <div className="glass glass-sm rounded-lg p-3 flex items-center justify-between group hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{transaction.icon}</span>
        <div>
          <p className="text-white text-sm font-medium">{transaction.description}</p>
          <p className="text-white/50 text-xs">
            {new Date(transaction.timestamp).toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>
      <div
        className={`text-sm font-bold ${
          isEarned ? 'text-green-400' : 'text-orange-400'
        }`}
      >
        {isEarned ? '+' : '-'}
        {transaction.amount}⭐
      </div>
    </div>
  );
}

interface PaymentModalProps {
  package: StarPackage;
  onClose: () => void;
  onSuccess: (stars: number) => void;
}

function PaymentModal({ package: pkg, onClose, onSuccess }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(value);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setExpiry(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      const response = await api.post('/stars/purchase', {
        package: pkg.id,
        amount: pkg.price,
        cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
      });

      if (response.data.success) {
        onSuccess(pkg.stars);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Ошибка при обработке платежа');
    } finally {
      setLoading(false);
    }
  };

  const isValid = cardNumber.length === 19 && expiry.length === 5 && cvv.length === 3;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="glass glass-strong rounded-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Купить звёзды</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Package Info */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-white text-2xl font-bold">{pkg.stars} звёзд</p>
          <p className="text-white/70 text-sm mt-1">
            {pkg.price}
            <span className="ml-1">{pkg.currency}</span>
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Номер карты
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 ring-blue-500 font-mono text-lg tracking-widest"
              maxLength={19}
              disabled={loading}
            />
          </div>

          {/* Expiry & CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Срок
              </label>
              <input
                type="text"
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 ring-blue-500 font-mono text-lg"
                maxLength={5}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                CVV
              </label>
              <input
                type="password"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="000"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 ring-blue-500 font-mono text-lg"
                maxLength={3}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 glass glass-sm py-2.5 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handlePayment}
            disabled={!isValid || loading}
            className="flex-1 btn-primary py-2.5 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            {loading ? '⏳ Обработка...' : `Оплатить ${pkg.price}${pkg.currency}`}
          </button>
        </div>

        {/* Security Info */}
        <p className="text-white/50 text-xs text-center">
          🔒 Ваши данные защищены и не сохраняются
        </p>
      </div>
    </div>
  );
}
