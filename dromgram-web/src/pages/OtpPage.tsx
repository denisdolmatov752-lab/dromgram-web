import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export default function OtpPage() {
  const [digits, setDigits] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const refs = Array.from({ length: 5 }, () => useRef<HTMLInputElement>(null));
  const navigate = useNavigate();
  const { state } = useLocation();
  const { setToken, setUser } = useAuthStore();
  const phone = state?.phone || '';

  useEffect(() => {
    refs[0].current?.focus();
    const t = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  const code = digits.join('');

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...digits]; next[i] = v.slice(-1);
    setDigits(next);
    if (v && i < 4) refs[i + 1].current?.focus();
    if (!v && i > 0) refs[i - 1].current?.focus();
    if (next.join('').length === 5) verify(next.join(''));
  };

  const verify = async (c: string) => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/verify-code', { phone, code: c, deviceName: 'Web Browser', deviceOs: navigator.userAgent });
      setToken(res.data.data.token);
      setUser(res.data.data.user);
      if (res.data.data.isNewUser) navigate('/auth/register');
      else navigate('/');
    } catch {
      setError('Неверный код. Попробуйте снова.');
      setDigits(['', '', '', '', '']);
      refs[0].current?.focus();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center safe-bottom" style={{
      background: 'linear-gradient(135deg, rgba(42,171,238,0.2) 0%, rgba(26,138,196,0.15) 100%)'
    }}>
      <div className="glass-strong max-w-md w-full mx-4 p-8 slide-up">
        <h2 className="text-2xl font-bold mb-2 text-center" style={{color:'var(--color-text)'}}>Введите код</h2>
        <p className="text-center text-sm mb-8" style={{color:'var(--color-text-secondary)'}}>Мы отправили SMS на {phone}</p>

        {/* OTP Input */}
        <div className="flex justify-center gap-2 mb-8">
          {digits.map((d, i) => (
            <input key={i} ref={refs[i]} maxLength={1} value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && refs[i-1].current?.focus()}
              className="w-12 h-14 text-2xl font-bold text-center rounded-2xl border-2 transition-all" style={{
                borderColor: error ? '#FF3B30' : 'var(--glass-border)',
                background: 'var(--glass-bg-strong)',
                color: 'var(--color-text)'
              }}
            />
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-xl mb-4 fade-up" style={{background:'rgba(255,59,48,0.15)',color:'#FF3B30',fontSize:'14px'}}>
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center mb-4">
            <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
        )}

        {/* Timer */}
        <div className="text-center mb-6">
          {timer > 0 ? (
            <p className="text-sm" style={{color:'var(--color-text-secondary)'}}>Повторная отправка через <strong>{timer}s</strong></p>
          ) : (
            <button onClick={() => { api.post('/auth/send-code', { phone }); setTimer(60); }} 
              className="text-sm font-medium" style={{color:'var(--color-primary)'}}>
              Отправить повторно
            </button>
          )}
        </div>

        <button onClick={() => navigate('/auth')} className="w-full text-sm font-medium py-2" style={{color:'var(--color-text-secondary)'}}>
          ← Изменить номер
        </button>
      </div>
    </div>
  );
}