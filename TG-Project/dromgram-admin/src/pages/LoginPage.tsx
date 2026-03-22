import { useState } from 'react';
import axios from 'axios';
export default function LoginPage() {
  const [phone, setPhone] = useState(''); const [code, setCode] = useState(''); const [step, setStep] = useState(1); const [err, setErr] = useState('');
  const api = axios.create({ baseURL: 'https://orproject.ru/api' });
  const sendCode = async () => { try { await api.post('/auth/send-code', { phone }); setStep(2); } catch { setErr('Ошибка'); } };
  const verify = async () => {
    try {
      const r = await api.post('/auth/verify-code', { phone, code, deviceName: 'Admin Panel', deviceOs: 'Web' });
      if (!r.data.data.user?.isAdmin) { setErr('Нет прав администратора'); return; }
      localStorage.setItem('admin_token', r.data.data.token);
      window.location.reload();
    } catch { setErr('Неверный код'); }
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#2AABEE,#1A8AC4)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 360 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#2AABEE', textAlign: 'center' }}>DRomGram Admin</h1>
        {step === 1 ? <>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 900 000-00-00" style={{ width: '100%', padding: '12px', border: '1px solid #E0E0E0', borderRadius: 8, marginBottom: 12, boxSizing: 'border-box' }}/>
          <button onClick={sendCode} style={{ width: '100%', padding: 12, background: '#2AABEE', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Отправить код</button>
        </> : <>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="12345" style={{ width: '100%', padding: '12px', border: '1px solid #E0E0E0', borderRadius: 8, marginBottom: 12, boxSizing: 'border-box' }}/>
          <button onClick={verify} style={{ width: '100%', padding: 12, background: '#2AABEE', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Войти</button>
        </>}
        {err && <p style={{ color: 'red', fontSize: 13, marginTop: 8 }}>{err}</p>}
      </div>
    </div>
  );
}
