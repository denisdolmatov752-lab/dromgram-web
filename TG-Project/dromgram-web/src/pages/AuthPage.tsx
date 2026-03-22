import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function AuthPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 8) { setError('Введите корректный номер телефона'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/send-code', { phone: phone.startsWith('+') ? phone : `+${phone}` });
      navigate('/auth/otp', { state: { phone, isNewUser: res.data.data.isNewUser } });
    } catch { setError('Ошибка отправки кода. Проверьте номер.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center safe-bottom" style={{
      background: 'linear-gradient(135deg, rgba(42,171,238,0.2) 0%, rgba(26,138,196,0.15) 100%)'
    }}>
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{background:'linear-gradient(135deg,#2AABEE,#1A8AC4)',animation:'float 6s ease-in-out infinite'}}/>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{background:'linear-gradient(135deg,#1A8AC4,#2AABEE)',animation:'float 6s ease-in-out infinite 2s'}}/>
      </div>

      {/* Glass card */}
      <div className="glass-strong max-w-md w-full mx-4 p-8 slide-up relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full float" style={{
            background: 'linear-gradient(135deg, #2AABEE, #1A8AC4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white'
          }}>D</div>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-black text-center mb-2" style={{color:'var(--color-text)'}}>DRomGram</h1>
        <p className="text-center text-sm mb-8" style={{color:'var(--color-text-secondary)'}}>Подтвердите номер телефона для входа</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color:'var(--color-text)'}}>Номер телефона</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+7 900 000-00-00"
              className="input-glass w-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              style={{color:'var(--color-text)'}}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl fade-up" style={{background:'rgba(255,59,48,0.15)',color:'#FF3B30',fontSize:'14px'}}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || phone.length < 7}
            className="btn-primary w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-all"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin mx-auto" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            ) : 'Далее'}
          </button>
        </form>

        {/* QR login option */}
        <button className="w-full mt-4 text-sm font-medium py-2 transition-colors" style={{color:'var(--color-primary)'}}>
          ↔️ Войти по QR-коду
        </button>
      </div>
    </div>
  );
}