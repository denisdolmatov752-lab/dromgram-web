import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) { setError('Введите имя'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { firstName: firstName.trim(), lastName: lastName.trim() || undefined });
      setUser(res.data.data.user);
      navigate('/');
    } catch { setError('Ошибка регистрации'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center safe-bottom" style={{
      background: 'linear-gradient(135deg, rgba(42,171,238,0.2) 0%, rgba(26,138,196,0.15) 100%)'
    }}>
      <div className="glass-strong max-w-md w-full mx-4 p-8 slide-up">
        <h2 className="text-2xl font-bold mb-2 text-center" style={{color:'var(--color-text)'}}>Ваше имя</h2>
        <p className="text-center text-sm mb-8" style={{color:'var(--color-text-secondary)'}}>Введите ваше имя для продолжения</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color:'var(--color-text)'}}>Имя</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ваше имя"
              className="input-glass w-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              style={{color:'var(--color-text)'}}/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{color:'var(--color-text)'}}>Фамилия (необязательно)</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Ваша фамилия"
              className="input-glass w-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              style={{color:'var(--color-text)'}}/>
          </div>

          {error && (
            <div className="p-3 rounded-xl fade-up" style={{background:'rgba(255,59,48,0.15)',color:'#FF3B30',fontSize:'14px'}}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !firstName.trim()}
            className="btn-primary w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-all">
            {loading ? 'Сохранение...' : 'Готово'}
          </button>
        </form>
      </div>
    </div>
  );
}