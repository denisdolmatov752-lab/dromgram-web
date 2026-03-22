import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

interface PremiumPlan {
  id: 'monthly' | '6months' | 'yearly';
  duration: string;
  price: number;
  currency: string;
  savings: number;
}

const PREMIUM_PLANS: PremiumPlan[] = [
  { id: 'monthly', duration: 'Месяц', price: 299, currency: '⭐', savings: 0 },
  { id: '6months', duration: '6 месяцев', price: 1499, currency: '⭐', savings: 25 },
  { id: 'yearly', duration: 'Год', price: 2499, currency: '⭐', savings: 30 },
];

const PREMIUM_FEATURES = [
  { icon: '⚡', title: 'Удвоенные лимиты', desc: 'Больше каналов, папок, пинов' },
  { icon: '🎭', title: 'Эксклюзивные стикеры', desc: 'Уникальные стикер-паки' },
  { icon: '🎁', title: 'Подарки', desc: 'Отправляй и получай NFT-подарки' },
  { icon: '📁', title: 'Папки чатов', desc: 'Неограниченное количество' },
  { icon: '🚫', title: 'Без рекламы', desc: 'Чистый мессенджер' },
  { icon: '✏️', title: 'Редактирование', desc: 'Бесконечное редактирование' },
  { icon: '🌟', title: 'Золотой бейдж', desc: 'В профиле и чатах' },
  { icon: '📤', title: 'Большие файлы', desc: 'До 4ГБ на файл' },
  { icon: '🎨', title: 'Эксклюзивные темы', desc: 'Уникальное оформление' },
  { icon: '🔒', title: 'Скрытый номер', desc: 'Полная конфиденциальность' },
];

export default function PremiumPanel() {
  const { user, updateUser } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | '6months' | 'yearly'>('monthly');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isPremium = user?.isPremium || false;
  const premiumUntil = user?.premiumUntil ? new Date(user.premiumUntil) : null;

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const response = await api.post('/premium/subscribe', {
        plan: selectedPlan,
      });

      if (response.data.success) {
        setSuccessMessage(`✅ Подписка активирована до ${formatDate(new Date(response.data.premiumUntil))}`);
        updateUser({ isPremium: true, premiumUntil: response.data.premiumUntil });
        setTimeout(() => {
          setShowPaymentModal(false);
          setShowSubscribeModal(false);
          setSuccessMessage(null);
        }, 2000);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setSuccessMessage('❌ Ошибка при оформлении подписки');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Вы уверены? Подписка будет отменена.')) return;

    try {
      const response = await api.post('/premium/cancel');
      if (response.data.success) {
        setSuccessMessage('✅ Подписка отменена');
        updateUser({ isPremium: false, premiumUntil: null });
        setTimeout(() => setSuccessMessage(null), 2000);
      }
    } catch (err) {
      console.error('Cancel error:', err);
      setSuccessMessage('❌ Ошибка при отмене подписки');
    }
  };

  return (
    <div className="panel-container bg-gradient-to-b from-slate-900 to-slate-950 overflow-y-auto">
      {/* Hero Section */}
      <div className="relative h-80 bg-gradient-to-br from-purple-600 via-blue-600 to-yellow-500 overflow-hidden">
        <div className="absolute inset-0 opacity-20 animate-pulse">
          <div className="absolute top-10 right-10 text-6xl">⭐</div>
          <div className="absolute bottom-20 left-10 text-5xl">✨</div>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center text-white p-4">
          <div className="text-6xl mb-3 animate-bounce">⭐</div>
          <h1 className="text-3xl font-bold mb-2">DRomGram Premium</h1>
          <p className="text-white/80 text-sm max-w-xs">
            Откройте все возможности DRomGram и получите эксклюзивный опыт
          </p>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Status Badge */}
        {isPremium && premiumUntil && (
          <div className="glass glass-sm rounded-lg p-4 border-l-4 border-yellow-500 bg-yellow-500/10">
            <p className="text-yellow-200 text-sm font-semibold">
              🌟 Вы Premium до {formatDate(premiumUntil)}
            </p>
            <button
              onClick={() => setShowSubscribeModal(true)}
              className="text-yellow-300 text-xs mt-2 hover:text-yellow-200 transition-colors"
            >
              Продлить подписку →
            </button>
          </div>
        )}

        {/* Features Grid */}
        <div>
          <h2 className="text-white font-semibold mb-4">Что вы получите</h2>
          <div className="grid grid-cols-2 gap-3">
            {PREMIUM_FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="glass glass-sm rounded-lg p-3 hover:bg-white/10 transition-colors fade-up"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <p className="text-white text-sm font-semibold">{feature.title}</p>
                <p className="text-white/60 text-xs mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div>
          <h2 className="text-white font-semibold mb-4">Выберите подписку</h2>
          <div className="space-y-3">
            {PREMIUM_PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`glass glass-sm rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'ring-2 ring-gradient bg-gradient-to-r from-blue-500/20 to-purple-500/20'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold">{plan.duration}</p>
                    {plan.savings > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/30 text-green-200 text-xs rounded-full">
                        Сэкономьте {plan.savings}%
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-white text-xl font-bold">
                      {plan.price}
                      <span className="text-sm ml-1">{plan.currency}</span>
                    </p>
                    {plan.id === 'monthly' && (
                      <p className="text-white/50 text-xs">/месяц</p>
                    )}
                  </div>
                </div>
                {selectedPlan === plan.id && (
                  <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mt-3"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe Button */}
        {!isPremium ? (
          <button
            onClick={() => setShowSubscribeModal(true)}
            className="w-full btn-primary py-3 rounded-lg font-semibold text-white text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            Оформить подписку
          </button>
        ) : (
          <button
            onClick={() => setShowSubscribeModal(true)}
            className="w-full bg-white/10 border border-white/20 py-3 rounded-lg font-semibold text-white hover:bg-white/15 transition-colors"
          >
            Продлить подписку
          </button>
        )}

        {/* Stars Info Link */}
        <button
          onClick={() => (window.location.href = '/stars')}
          className="w-full glass glass-sm py-3 rounded-lg text-white/70 hover:text-white transition-colors text-sm"
        >
          ❓ Что такое звёзды?
        </button>

        {/* Cancel Subscription */}
        {isPremium && (
          <button
            onClick={handleCancel}
            className="w-full text-red-400 hover:text-red-300 transition-colors text-sm py-2"
          >
            Отменить подписку
          </button>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="glass glass-sm p-4 rounded-lg text-center text-white/80 text-sm">
            {successMessage}
          </div>
        )}
      </div>

      {/* Subscribe Confirmation Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="glass glass-strong rounded-lg w-full max-w-md p-6 space-y-4">
            <div className="text-center">
              <div className="text-5xl mb-3">⭐</div>
              <h2 className="text-white text-xl font-bold">DRomGram Premium</h2>
              <p className="text-white/60 text-sm mt-2">
                Подпишитесь на {PREMIUM_PLANS.find((p) => p.id === selectedPlan)?.duration.toLowerCase()} и получите доступ ко всем возможностям
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between text-white">
                <span>Сумма платежа:</span>
                <span className="text-xl font-bold">
                  {PREMIUM_PLANS.find((p) => p.id === selectedPlan)?.price}⭐
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="flex-1 glass glass-sm py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setShowSubscribeModal(false);
                  setShowPaymentModal(true);
                }}
                className="flex-1 btn-primary py-2 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                Оплатить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleSubscribe}
          amount={PREMIUM_PLANS.find((p) => p.id === selectedPlan)?.price || 0}
          loading={loading}
        />
      )}
    </div>
  );
}

interface PaymentModalProps {
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  loading: boolean;
}

function PaymentModal({ onClose, onConfirm, amount, loading }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    // Format as XXXX XXXX XXXX XXXX
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(value);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    // Format as MM/YY
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

  const isValid = cardNumber.length === 19 && expiry.length === 5 && cvv.length === 3;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="glass glass-strong rounded-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Оплата</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Amount */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 text-center">
            <p className="text-white/70 text-sm mb-1">К оплате</p>
            <p className="text-white text-3xl font-bold">{amount}⭐</p>
          </div>

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
            onClick={onConfirm}
            disabled={!isValid || loading}
            className="flex-1 btn-primary py-2.5 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            {loading ? '⏳ Обработка...' : `Оплатить ${amount}⭐`}
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

function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
