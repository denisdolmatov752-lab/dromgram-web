import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

interface StarPackage {
  stars: number;
  price: number;
  currency: string;
  bonus: string | null;
  popular?: boolean;
}

interface Transaction {
  id: string;
  type: 'purchase' | 'gift' | 'tip' | 'subscription' | 'earned';
  description: string;
  amount: number;
  timestamp: string;
  icon: string;
}

const PACKAGES: StarPackage[] = [
  { stars: 50, price: 99, currency: '₽', bonus: null },
  { stars: 100, price: 179, currency: '₽', bonus: null },
  { stars: 250, price: 399, currency: '₽', bonus: null },
  { stars: 500, price: 749, currency: '₽', bonus: '+10%' },
  { stars: 1000, price: 1299, currency: '₽', bonus: '+20%' },
  { stars: 2500, price: 2999, currency: '₽', bonus: '+25%', popular: true },
  { stars: 5000, price: 5499, currency: '₽', bonus: '+35%' },
];

const StarIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='#FFD700'>
    <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/>
  </svg>
);

function PaymentModal({ pkg, onClose, onSuccess }: any) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    if (!/^\d*$/.test(value)) return;
    value = value.slice(0, 16);
    setCardNumber(value.replace(/(\d{4})/g, '$1 ').trim());
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) return;
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setExpiry(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvv(value);
  };

  const isValid = cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length === 3;

  const handlePayment = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await api.post('/stars/purchase', {
        stars: pkg.stars,
        price: pkg.price,
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiry,
        cvv
      });
      onSuccess(pkg.stars);
    } catch (err) {
      console.error('Payment failed:', err);
      alert('Ошибка платежа. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="glass glass-strong rounded-2xl w-full max-w-md p-6 space-y-4">
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
          <div className="flex justify-center mb-2">
            <StarIcon size={32} />
          </div>
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
           Ваши данные защищены и не сохраняются
        </p>
      </div>
    </div>
  );
}

export default function StarsPanel() {
  const { user, updateUser } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<StarPackage | null>(null);
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

  const handleSelectPackage = (pkg: StarPackage) => {
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  const handlePurchaseComplete = (amount: number) => {
    const newStars = stars + amount;
    updateUser({ stars: newStars });
    setSuccessMessage(`✅ +${amount} звёзд добавлено в ваш баланс!`);
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
        <div className="flex items-center gap-3">
          <StarIcon size={24} />
          <h1 className="text-xl font-bold text-white">Звёзды DRomGram</h1>
        </div>
      </div>

      <div className="space-y-6 p-4 pb-20">
        {/* Balance Card */}
        <div className="glass glass-strong rounded-2xl p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <StarIcon size={48} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Ваши звёзды DRomGram</p>
              <p className="text-white text-4xl font-bold">{stars.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="glass glass-sm p-4 rounded-2xl text-center text-white text-sm border border-green-500/30 bg-green-500/10">
            {successMessage}
          </div>
        )}

        {/* Star Packages Grid */}
        <div>
          <h2 className="text-white font-semibold mb-4 px-2">Купить звёзды</h2>
          <div className="grid grid-cols-2 gap-3">
            {PACKAGES.map((pkg) => (
              <button
                key={`${pkg.stars}-${pkg.price}`}
                onClick={() => handleSelectPackage(pkg)}
                className="relative group rounded-2xl p-4 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-200 text-left min-h-[90px] flex flex-col justify-between"
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ХИТ
                  </div>
                )}

                {/* Star Icon */}
                <div className="flex items-center gap-2 mb-2">
                  <StarIcon size={20} />
                </div>

                {/* Stars Count */}
                <div className="mb-2">
                  <p className="text-white font-bold text-lg">{pkg.stars}</p>
                  <p className="text-white/50 text-xs">звёзд</p>
                </div>

                {/* Price & Bonus */}
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold text-sm">
                    {pkg.price}{pkg.currency}
                  </p>
                  {pkg.bonus && (
                    <span className="bg-green-500/30 border border-green-500/60 text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {pkg.bonus}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-white font-semibold mb-4 px-2">История операций</h2>
          {loading ? (
            <div className="text-center text-white/60 py-8">Загрузка...</div>
          ) : transactions.length === 0 ? (
            <div className="glass glass-sm rounded-2xl p-8 text-center text-white/60">
              <p className="text-sm">Нет операций</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="glass glass-sm rounded-xl p-4 flex items-center justify-between border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                      {tx.icon}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{tx.description}</p>
                      <p className="text-white/50 text-xs">
                        {new Date(tx.timestamp).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <p className="text-white font-semibold text-sm">
                    {tx.type === 'purchase' || tx.type === 'earned' ? '+' : '-'}
                    {tx.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <PaymentModal
          pkg={selectedPackage}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPackage(null);
          }}
          onSuccess={handlePurchaseComplete}
        />
      )}
    </div>
  );
}
