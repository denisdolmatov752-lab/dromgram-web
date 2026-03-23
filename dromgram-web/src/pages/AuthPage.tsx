import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CountryFlag = ({ code = 'ru' }: { code?: string }) => (
  <svg width="24" height="24" viewBox="0 0 36 36">
    {code === 'ru' && (
      <>
        <rect fill="#FFFFFF" width="36" height="12"/>
        <rect fill="#0052CC" y="12" width="36" height="12"/>
        <rect fill="#D52B1E" y="24" width="36" height="12"/>
      </>
    )}
  </svg>
);

export default function AuthPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Auto-prepend +7 for Russian numbers
    if (value.length > 0 && !value.startsWith('7')) {
      // If starts with 8 (old Russian format), replace with 7
      if (value.startsWith('8')) {
        value = '7' + value.slice(1);
      } else if (!value.startsWith('7')) {
        value = '7' + value;
      }
    }
    
    // Limit to 11 digits (7 + 10 digit number)
    value = value.slice(0, 11);
    
    // Format for display: +7 900 000-00-00
    let formatted = '';
    if (value.length > 0) {
      formatted = '+' + value.slice(0, 1);
      if (value.length > 1) formatted += ' ' + value.slice(1, 4);
      if (value.length > 4) formatted += ' ' + value.slice(4, 7);
      if (value.length > 7) formatted += '-' + value.slice(7, 9);
      if (value.length > 9) formatted += '-' + value.slice(9, 11);
    }
    
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = '+' + phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 12) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/send-code', { phone: cleanPhone });
      setIsNewUser(res.data.data?.isNewUser || false);
      navigate('/auth/otp', { state: { phone: cleanPhone, isNewUser: res.data.data?.isNewUser } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка отправки кода. Проверьте номер.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center safe-bottom"
      style={{
        background: 'linear-gradient(135deg, rgba(42,171,238,0.2) 0%, rgba(26,138,196,0.15) 100%)'
      }}
    >
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background: 'linear-gradient(135deg,#2AABEE,#1A8AC4)',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background: 'linear-gradient(135deg,#1A8AC4,#2AABEE)',
            animation: 'float 6s ease-in-out infinite 2s'
          }}
        />
      </div>

      {/* Glass card */}
      <div className="glass-strong max-w-md w-full mx-4 p-8 slide-up relative z-10">
        {/* Logo */}
        <div
          className="flex justify-center mb-8"
          style={{
            background: 'linear-gradient(135deg, #2AABEE, #1A8AC4)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            margin: '0 auto 32px'
          }}
        >
          D
        </div>

        {/* Header */}
        <h1 className="text-3xl font-black text-center mb-2" style={{ color: 'var(--color-text)' }}>
          DRomGram
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Подтвердите номер телефона для входа
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Country Selector & Phone Input */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Номер телефона
            </label>
            <div className="flex items-center gap-3 input-glass px-4 py-3 rounded-xl border border-white/20 focus-within:ring-2 focus-within:ring-blue-500">
              <CountryFlag code="ru" />
              <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm font-medium">
                Россия
              </span>
              <div className="h-6 w-px bg-white/20" />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 900 000-00-00"
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: 'var(--color-text)' }}
              />
            </div>
          </div>

          {/* Sync Contacts Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded"
              defaultChecked={true}
              style={{
                accentColor: '#2AABEE',
                cursor: 'pointer'
              }}
            />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Синхронизировать контакты
            </span>
          </label>

          {error && (
            <div
              className="p-3 rounded-xl fade-up text-sm"
              style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || phone.replace(/\D/g, '').length < 11}
            className="btn-primary w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-all"
          >
            {loading ? (
              <svg
                className="w-5 h-5 animate-spin mx-auto"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            ) : (
              'Далее'
            )}
          </button>
        </form>

        {/* QR login option */}
        <button
          className="w-full mt-4 text-sm font-medium py-2 transition-colors"
          style={{ color: 'var(--color-primary)' }}
        >
          ↔️ Войти по QR-коду
        </button>
      </div>
    </div>
  );
}
