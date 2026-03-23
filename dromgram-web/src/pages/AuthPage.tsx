import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// SVG Flag for Russia
const RuFlag = () => (
  <svg width="24" height="18" viewBox="0 0 24 18" style={{ borderRadius: 3, flexShrink: 0 }}>
    <rect width="24" height="6" fill="#fff"/>
    <rect y="6" width="24" height="6" fill="#0052CC"/>
    <rect y="12" width="24" height="6" fill="#D52B1E"/>
  </svg>
);

// SVG Arrow right
const ArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

// Loading spinner
const Spinner = () => (
  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
);

type Step = 'phone' | 'email';

export default function AuthPage() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [syncContacts, setSyncContacts] = useState(true);
  const navigate = useNavigate();

  // Format phone as +7 XXX XXX-XX-XX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    // If starts with 8 convert to 7
    if (raw.startsWith('8')) raw = '7' + raw.slice(1);
    // If starts with something other than 7, prepend 7
    if (raw.length > 0 && raw[0] !== '7') raw = '7' + raw;
    raw = raw.slice(0, 11);

    let formatted = '';
    if (raw.length > 0) {
      formatted = '+' + raw[0];
      if (raw.length > 1) formatted += ' (' + raw.slice(1, 4);
      if (raw.length > 3) formatted += ')';
      if (raw.length > 4) formatted += ' ' + raw.slice(4, 7);
      if (raw.length > 7) formatted += '-' + raw.slice(7, 9);
      if (raw.length > 9) formatted += '-' + raw.slice(9, 11);
    }
    setPhone(formatted);
    setError('');
  };

  const getCleanPhone = () => '+' + phone.replace(/\D/g, '');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = getCleanPhone();
    if (clean.replace('+', '').length < 11) {
      setError('Введите корректный номер телефона');
      return;
    }
    setStep('email');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = getCleanPhone();

    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Введите корректный email адрес');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/send-code', {
        phone: clean,
        email: email.trim().toLowerCase(),
      });
      navigate('/auth/otp', {
        state: {
          phone: clean,
          email: email.trim().toLowerCase(),
          isNewUser: res.data.data?.isNewUser,
          codeId: res.data.data?.codeId,
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Ошибка отправки кода. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Animated gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '10%',
          width: 400, height: 400, borderRadius: '50%', opacity: 0.12,
          background: 'radial-gradient(circle, #2AABEE, transparent)',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '5%',
          width: 350, height: 350, borderRadius: '50%', opacity: 0.1,
          background: 'radial-gradient(circle, #8B5CF6, transparent)',
          filter: 'blur(60px)',
          animation: 'float 10s ease-in-out infinite 3s',
        }} />
      </div>

      <div className="glass-strong w-full max-w-sm p-8 slide-up" style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
          background: 'linear-gradient(135deg,#2AABEE,#1A8AC4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 900, color: 'white',
        }}>D</div>

        <h1 className="text-2xl font-bold text-center mb-1">DRomGram</h1>

        {step === 'phone' ? (
          <>
            <p className="text-sm text-center mb-7" style={{ color: 'var(--color-text-secondary)' }}>
              Подтвердите номер телефона для входа
            </p>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {/* Country selector */}
              <div className="input-glass rounded-2xl px-4 py-3 flex items-center gap-3">
                <RuFlag />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Россия</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', opacity: 0.4 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {/* Phone input */}
              <div className="input-glass rounded-2xl px-4 py-3 flex items-center gap-2 focus-within:ring-2" style={{ '--tw-ring-color': '#2AABEE' } as any}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5, flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.59 5a2 2 0 0 1 1.995-2H6.5a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 (900) 000-00-00"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  style={{ color: 'var(--color-text)' }}
                  autoFocus
                />
              </div>

              {/* Sync contacts */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setSyncContacts(v => !v)}
                  style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${syncContacts ? '#2AABEE' : 'rgba(255,255,255,0.3)'}`,
                    background: syncContacts ? '#2AABEE' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {syncContacts && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Синхронизировать контакты</span>
              </label>

              {error && (
                <div className="text-sm p-3 rounded-xl" style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={phone.replace(/\D/g, '').length < 11}
                className="w-full py-3 rounded-2xl font-semibold text-sm text-white disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#2AABEE,#1A8AC4)' }}
              >
                Далее <ArrowRight />
              </button>
            </form>

            <button className="w-full mt-4 py-2 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              Войти по QR-коду
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-center mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Телефон: <strong style={{ color: 'var(--color-text)' }}>{phone}</strong>
            </p>
            <p className="text-sm text-center mb-7" style={{ color: 'var(--color-text-secondary)' }}>
              Введите email — туда придёт код подтверждения
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="input-glass rounded-2xl px-4 py-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5, flexShrink: 0 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="ваш@email.com"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  style={{ color: 'var(--color-text)' }}
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm p-3 rounded-xl" style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.includes('@')}
                className="w-full py-3 rounded-2xl font-semibold text-sm text-white disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#2AABEE,#1A8AC4)' }}
              >
                {loading ? <Spinner /> : <><span>Получить код</span><ArrowRight /></>}
              </button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setError(''); }}
                className="w-full py-2 text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                ← Назад
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)}
        }
      `}</style>
    </div>
  );
}
