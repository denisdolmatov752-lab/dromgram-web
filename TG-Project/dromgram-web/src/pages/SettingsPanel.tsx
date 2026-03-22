import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import api from '../api/axios';

// Spinner component
function Spinner({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <circle cx="12" cy="12" r="10" opacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

// Avatar component
function Avatar({ url, name, color, size = 80 }: { url?: string; name?: string; color?: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: url ? `url(${url})` : color || '#6366f1',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {!url && name?.charAt(0)?.toUpperCase()}
    </div>
  );
}

// Toggle switch
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative rounded-full transition-colors duration-200 flex-shrink-0"
      style={{
        width: 44,
        height: 26,
        background: value ? 'var(--color-primary)' : 'var(--color-divider)',
      }}
    >
      <div
        className="absolute top-[3px] rounded-full bg-white transition-transform duration-200"
        style={{
          width: 20,
          height: 20,
          left: 3,
          transform: value ? 'translateX(18px)' : 'translateX(0)',
        }}
      />
    </button>
  );
}

// Chevron component
function Chevron() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
      <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Modal backdrop
function ModalBackdrop({ onClick }: { onClick: () => void }) {
  return <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClick} />;
}

// Edit Profile Modal
function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (data: any) => void;
}) {
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFirstName(user?.firstName || '');
      setLastName(user?.lastName || '');
      setUsername(user?.username || '');
      setBio(user?.bio || '');
      setError('');
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    if (!firstName.trim()) {
      setError('Имя не может быть пустым');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.put('/users/me', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        bio: bio.trim(),
      });
      onSave(response.data.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalBackdrop onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <div
          className="glass-strong rounded-3xl max-w-lg w-full pointer-events-auto slide-up overflow-y-auto"
          style={{ maxHeight: '85vh' }}
        >
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-divider)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Редактировать профиль
            </h2>
            <button onClick={onClose} className="p-1" style={{ color: 'var(--color-text-secondary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--color-error)' }}>
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                Имя
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full px-3 py-2 rounded-xl focus:outline-none text-sm glass-sm"
                style={{ color: 'var(--color-text)', background: 'var(--glass-bg)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                Фамилия
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ваша фамилия"
                className="w-full px-3 py-2 rounded-xl focus:outline-none text-sm glass-sm"
                style={{ color: 'var(--color-text)', background: 'var(--glass-bg)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 rounded-xl focus:outline-none text-sm glass-sm"
                style={{ color: 'var(--color-text)', background: 'var(--glass-bg)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                О себе ({bio.length}/70)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 70))}
                placeholder="Расскажите о себе..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl focus:outline-none text-sm resize-none glass-sm"
                style={{ color: 'var(--color-text)', background: 'var(--glass-bg)' }}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 btn-primary"
            >
              {loading ? <Spinner size={18} /> : '✓'}
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Sessions Modal
function SessionsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) loadSessions();
  }, [isOpen]);

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await api.get('/sessions');
      setSessions(r.data.data || mockSessions);
    } catch {
      setSessions(mockSessions);
    } finally {
      setLoading(false);
    }
  };

  const mockSessions = [
    {
      id: '1',
      deviceName: 'Chrome — Windows',
      ip: '192.168.1.1',
      lastActive: new Date().toISOString(),
      isCurrent: true,
    },
    {
      id: '2',
      deviceName: 'Safari — iPhone',
      ip: '10.0.0.2',
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      isCurrent: false,
    },
  ];

  const endSession = async (id: string) => {
    try {
      await api.delete(`/sessions/${id}`);
      setSessions((s) => s.filter((x) => x.id !== id));
    } catch {
      setSessions((s) => s.filter((x) => x.id !== id));
    }
  };

  const endAllOther = async () => {
    try {
      await api.post('/sessions/logout-all-other');
      loadSessions();
    } catch {
      setSessions((s) => s.filter((x) => x.isCurrent));
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'только что';
    if (hours < 24) return `${hours}ч назад`;
    return Math.floor(hours / 24) + 'д назад';
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalBackdrop onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <div
          className="glass-strong rounded-3xl max-w-lg w-full pointer-events-auto slide-up overflow-y-auto"
          style={{ maxHeight: '85vh' }}
        >
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-divider)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Активные сессии
            </h2>
            <button onClick={onClose} className="p-1" style={{ color: 'var(--color-text-secondary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-3">
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--color-error)' }}>
                {error}
              </div>
            )}
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                Нет активных сессий
              </div>
            ) : (
              <>
                {sessions.map((s, i) => (
                  <div key={s.id}>
                    <div className="glass-sm p-3 rounded-xl">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                            {s.deviceName.includes('iPhone') || s.deviceName.includes('Mobile') ? '📱' : '💻'} {s.deviceName}
                            {s.isCurrent && (
                              <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                                Текущая
                              </span>
                            )}
                          </div>
                          <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                            IP: {s.ip || 'N/A'}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {formatTime(s.lastActive)}
                          </div>
                        </div>
                        {!s.isCurrent && (
                          <button
                            onClick={() => endSession(s.id)}
                            className="text-xs px-2 py-1 rounded font-medium"
                            style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--color-error)' }}
                          >
                            Завершить
                          </button>
                        )}
                      </div>
                    </div>
                    {i < sessions.length - 1 && <div style={{ height: '1px', background: 'var(--color-divider)', margin: '8px 0' }} />}
                  </div>
                ))}
                {sessions.some((s) => !s.isCurrent) && (
                  <button
                    onClick={endAllOther}
                    className="w-full py-3 rounded-xl font-medium text-white mt-4"
                    style={{ background: 'var(--color-error)' }}
                  >
                    Завершить все другие сессии
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Privacy Modal
function PrivacyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState({
    phoneVisibility: 'contacts',
    lastSeenVisibility: 'contacts',
    groupAddVisibility: 'everyone',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) loadSettings();
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const r = await api.get('/users/me/privacy');
      setSettings(r.data.data || settings);
    } catch {
      // Use defaults on error
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await api.put('/users/me/privacy', settings);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderOptions = (field: string, options: { value: string; label: string }[]) => (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:opacity-80">
          <input
            type="radio"
            name={field}
            value={opt.value}
            checked={(settings as any)[field] === opt.value}
            onChange={(e) => setSettings({ ...settings, [field]: e.target.value })}
            className="w-4 h-4"
          />
          <span className="text-sm" style={{ color: 'var(--color-text)' }}>
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );

  return (
    <>
      <ModalBackdrop onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <div
          className="glass-strong rounded-3xl max-w-lg w-full pointer-events-auto slide-up overflow-y-auto"
          style={{ maxHeight: '85vh' }}
        >
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-divider)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Конфиденциальность
            </h2>
            <button onClick={onClose} className="p-1" style={{ color: 'var(--color-text-secondary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--color-error)' }}>
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{ color: 'var(--color-text-secondary)' }}>
                Кто видит номер телефона
              </label>
              {renderOptions('phoneVisibility', [
                { value: 'everyone', label: 'Все' },
                { value: 'contacts', label: 'Мои контакты' },
                { value: 'nobody', label: 'Никто' },
              ])}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{ color: 'var(--color-text-secondary)' }}>
                Кто видит время входа
              </label>
              {renderOptions('lastSeenVisibility', [
                { value: 'everyone', label: 'Все' },
                { value: 'contacts', label: 'Мои контакты' },
                { value: 'nobody', label: 'Никто' },
              ])}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{ color: 'var(--color-text-secondary)' }}>
                Кто может добавлять в группы
              </label>
              {renderOptions('groupAddVisibility', [
                { value: 'everyone', label: 'Все' },
                { value: 'contacts', label: 'Мои контакты' },
              ])}
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 btn-primary"
            >
              {loading ? <Spinner size={18} /> : '✓'}
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// 2FA Modal
function TwoFAModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [enabled, setEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPass('');
      setError('');
      setSuccess('');
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      const r = await api.get('/auth/2fa/status');
      setEnabled(r.data.data?.enabled || false);
    } catch {
      setEnabled(false);
    }
  };

  const handleEnable = async () => {
    if (!password || password.length < 6) {
      setError('Минимум 6 символов');
      return;
    }
    if (password !== confirmPass) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/2fa/enable', { password });
      setEnabled(true);
      setPassword('');
      setConfirmPass('');
      setSuccess('2FA успешно включена');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!password) {
      setError('Введите пароль');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/2fa/disable', { password });
      setEnabled(false);
      setPassword('');
      setSuccess('2FA успешно отключена');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalBackdrop onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <div
          className="glass-strong rounded-3xl max-w-lg w-full pointer-events-auto slide-up overflow-y-auto"
          style={{ maxHeight: '85vh' }}
        >
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-divider)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Двухфакторная защита
            </h2>
            <button onClick={onClose} className="p-1" style={{ color: 'var(--color-text-secondary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--color-error)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--color-success)' }}>
                {success}
              </div>
            )}
            {!enabled ? (
              <>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Двухфакторная аутентификация повышает безопасность вашего аккаунта. При входе потребуется код из приложения.
                </p>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                    Пароль
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    className="w-full px-3 py-2 rounded-xl focus:outline-none text-sm glass-sm"
                    style={{ color: 'var(--color-text)', background: 'var(--glass-bg)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                    Подтверждение пароля
                  </label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Повторите пароль"
                    className="w-full px-3 py-2 rounded-xl focus:outline-none text-sm glass-sm"
                    style={{ color: 'var(--color-text)', background: 'var(--glass-bg)' }}
                  />
                </div>
                <button
                  onClick={handleEnable}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 btn-primary"
                >
                  {loading ? <Spinner size={18} /> : '✓'}
                  {loading ? 'Включение...' : 'Включить'}
                </button>
              </>
            ) : (
              <>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    ✓ Двухфакторная защита включена
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                    Пароль для отключения
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="w-full px-3 py-2 rounded-xl focus:outline-none text-sm glass-sm"
                    style={{ color: 'var(--color-text)', background: 'var(--glass-bg)' }}
                  />
                </div>
                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
                  style={{ background: 'var(--color-error)' }}
                >
                  {loading ? <Spinner size={18} /> : '✗'}
                  {loading ? 'Отключение...' : 'Отключить'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Blocked Users Modal
function BlockedUsersModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) loadBlocked();
  }, [isOpen]);

  const loadBlocked = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await api.get('/users/blocked');
      setUsers(r.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const unblock = async (id: string) => {
    try {
      await api.delete(`/users/blocked/${id}`);
      setUsers((u) => u.filter((x) => x.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalBackdrop onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <div
          className="glass-strong rounded-3xl max-w-lg w-full pointer-events-auto slide-up overflow-y-auto"
          style={{ maxHeight: '85vh' }}
        >
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-divider)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Заблокированные пользователи
            </h2>
            <button onClick={onClose} className="p-1" style={{ color: 'var(--color-text-secondary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-3">
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--color-error)' }}>
                {error}
              </div>
            )}
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                Нет заблокированных пользователей
              </div>
            ) : (
              users.map((u, i) => (
                <div key={u.id}>
                  <div className="glass-sm p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar url={u.avatarUrl} name={u.firstName} color={u.avatarColor} size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                          {u.firstName} {u.lastName || ''}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          @{u.username}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => unblock(u.id)}
                      className="text-xs px-2 py-1 rounded font-medium ml-2 flex-shrink-0"
                      style={{ background: 'rgba(42,171,238,0.1)', color: 'var(--color-primary)' }}
                    >
                      Разблокировать
                    </button>
                  </div>
                  {i < users.length - 1 && <div style={{ height: '1px', background: 'var(--color-divider)', margin: '8px 0' }} />}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Main Settings Panel Component
export default function SettingsPanel({ onLogout }: { onLogout: () => void }) {
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [editOpen, setEditOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [storageExpanded, setStorageExpanded] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem('notif_settings');
    return stored ? JSON.parse(stored) : { enabled: true, sound: true, vibrate: true };
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const name = user ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'Пользователь';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser({ ...user!, avatarUrl: response.data.data.avatarUrl });
    } catch (err: any) {
      setUploadError('Ошибка загрузки аватара');
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem('notif_settings', JSON.stringify(updated));
  };

  const handleEditSave = (data: any) => {
    setUser({ ...user!, ...data });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} скопирован в буфер обмена!`);
    });
  };

  const clearCache = () => {
    if (confirm('Вы уверены? Это удалит все кэшированные данные.')) {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
      alert('Кэш очищен');
    }
  };

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    const html = document.documentElement;
    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.classList.toggle('dark', isDark);
    } else {
      html.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const applyFontSize = (size: number) => {
    setFontSize(size);
    document.documentElement.style.fontSize = size + 'px';
  };

  // Section Component
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h3
        className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}
      >
        {title}
      </h3>
      <div className="glass-sm rounded-2xl overflow-hidden">{children}</div>
    </div>
  );

  // Row Component
  const Row = ({
    icon,
    label,
    value,
    rightElement,
    onClick,
    last,
  }: {
    icon: string;
    label: string;
    value?: string;
    rightElement?: React.ReactNode;
    onClick?: () => void;
    last?: boolean;
  }) => (
    <div>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 hover:opacity-75 transition-opacity text-left"
      >
        <div className="text-sm w-3 flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {label}
          </div>
          {value && (
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {value}
            </div>
          )}
        </div>
        {rightElement}
      </button>
      {!last && <div style={{ height: '1px', background: 'var(--color-divider)', marginLeft: 52 }} />}
    </div>
  );

  // Storage data
  const storageData = [
    { label: 'Чаты', percent: 45, color: '#0098EA' },
    { label: 'Медиа', percent: 30, color: '#F7931A' },
    { label: 'Кэш', percent: 15, color: '#7B5EA7' },
    { label: 'Другое', percent: 10, color: '#FFB800' },
  ];

  if (!user) {
    return <div style={{ color: 'var(--color-text)' }}>Загрузка...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-24">
      {/* Profile Section */}
      <div className="p-4 mb-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar url={user.avatarUrl} name={user.firstName} color={user.avatarColor} size={80} />
            {uploadLoading && (
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <Spinner size={24} />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full"
              style={{ background: 'var(--color-primary)' }}
            >
              📷
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              {name}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>@{user.username}</p>
            {user.isOnline && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  онлайн
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="px-4 py-2 rounded-xl font-medium text-white btn-primary"
          >
            Редактировать профиль
          </button>
          {uploadError && (
            <div className="text-sm" style={{ color: 'var(--color-error)' }}>
              {uploadError}
            </div>
          )}
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-4 space-y-6">
        {/* Account Section */}
        <Section title="Мой аккаунт">
          <Row
            icon="📞"
            label="Номер телефона"
            value={user.phone}
            rightElement={<Chevron />}
            onClick={() => copyToClipboard(user.phone, 'Номер телефона')}
          />
          <Row
            icon="👤"
            label="Редактировать имя"
            rightElement={<Chevron />}
            onClick={() => setEditOpen(true)}
          />
          <Row
            icon="🔗"
            label="Ссылка на профиль"
            value={`dromgram.ru/${user.username}`}
            rightElement={<Chevron />}
            onClick={() => copyToClipboard(`dromgram.ru/${user.username}`, 'Ссылка на профиль')}
          />
          <Row
            icon="💻"
            label="Активные сессии"
            rightElement={<Chevron />}
            onClick={() => setSessionsOpen(true)}
            last
          />
        </Section>

        {/* Privacy Section */}
        <Section title="Конфиденциальность">
          <Row
            icon="🔒"
            label="Конфиденциальность"
            rightElement={<Chevron />}
            onClick={() => setPrivacyOpen(true)}
          />
          <Row
            icon="🛡️"
            label="Двухфакторная защита"
            rightElement={<Chevron />}
            onClick={() => setTwoFAOpen(true)}
          />
          <Row
            icon="⛔"
            label="Заблокированные"
            rightElement={<Chevron />}
            onClick={() => setBlockedOpen(true)}
            last
          />
        </Section>

        {/* Notifications Section */}
        <Section title="Уведомления">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-sm">🔔</div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Уведомления
              </div>
            </div>
            <Toggle
              value={notifications.enabled}
              onChange={(v) => handleNotificationChange('enabled', v)}
            />
          </div>
          <div style={{ height: '1px', background: 'var(--color-divider)', marginLeft: 52 }} />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-sm">🔊</div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Звук сообщений
              </div>
            </div>
            <Toggle
              value={notifications.sound}
              onChange={(v) => handleNotificationChange('sound', v)}
            />
          </div>
          <div style={{ height: '1px', background: 'var(--color-divider)', marginLeft: 52 }} />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-sm">📳</div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Вибрация
              </div>
            </div>
            <Toggle
              value={notifications.vibrate}
              onChange={(v) => handleNotificationChange('vibrate', v)}
            />
          </div>
        </Section>

        {/* Storage Section */}
        <Section title="Данные и память">
          <Row
            icon="💾"
            label="Использование памяти"
            rightElement={
              <button onClick={() => setStorageExpanded(!storageExpanded)}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    transform: storageExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                  }}
                >
                  <path d="M2 6l6 6 6-6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </button>
            }
            onClick={() => setStorageExpanded(!storageExpanded)}
          />
          {storageExpanded && (
            <>
              <div style={{ height: '1px', background: 'var(--color-divider)' }} />
              <div className="px-4 py-4 space-y-3">
                {storageData.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                        {item.label}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.percent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: 'var(--color-divider)' }}>
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${item.percent}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
                <div className="text-xs" style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}>
                  Всего: 8.4 GB из 64 GB
                </div>
              </div>
            </>
          )}
          <div style={{ height: '1px', background: 'var(--color-divider)' }} />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-sm">⬇️</div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Автозагрузка медиа
              </div>
            </div>
            <Toggle value={true} onChange={() => {}} />
          </div>
          <div style={{ height: '1px', background: 'var(--color-divider)', marginLeft: 52 }} />
          <Row
            icon="🗑️"
            label="Очистить кэш"
            rightElement={<Chevron />}
            onClick={clearCache}
            last
          />
        </Section>

        {/* Appearance Section */}
        <Section title="Оформление">
          <div className="px-4 py-4 space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                Тема оформления
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'light' as const, label: '☀️ Светлая' },
                  { value: 'dark' as const, label: '🌙 Тёмная' },
                  { value: 'system' as const, label: '⚙️ Системная' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => applyTheme(opt.value)}
                    className="flex-1 py-2 rounded-lg font-medium text-sm transition-all"
                    style={{
                      background: theme === opt.value ? 'var(--color-primary)' : 'var(--glass-bg)',
                      color: theme === opt.value ? '#fff' : 'var(--color-text)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                Размер текста ({fontSize}px)
              </label>
              <input
                type="range"
                min="12"
                max="20"
                value={fontSize}
                onChange={(e) => applyFontSize(parseInt(e.target.value))}
                className="w-full"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Маленький</span>
                <span>Большой</span>
              </div>
            </div>
          </div>
        </Section>

        {/* About Section */}
        <Section title="О приложении">
          <div className="px-4 py-4 space-y-3">
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                DRomGram
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Версия 1.0.0
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => window.open('https://dromgram.ru/terms', '_blank')}
                className="text-sm hover:opacity-75 transition-opacity"
                style={{ color: 'var(--color-primary)' }}
              >
                Условия использования
              </button>
              <br />
              <button
                onClick={() => window.open('https://dromgram.ru/privacy', '_blank')}
                className="text-sm hover:opacity-75 transition-opacity"
                style={{ color: 'var(--color-primary)' }}
              >
                Политика конфиденциальности
              </button>
            </div>
          </div>
        </Section>

        {/* Logout Button */}
        <div className="pb-6">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
            style={{ color: 'var(--color-error)' }}
          >
            🚪 Выйти из аккаунта
          </button>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} user={user} onSave={handleEditSave} />
      <SessionsModal isOpen={sessionsOpen} onClose={() => setSessionsOpen(false)} />
      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <TwoFAModal isOpen={twoFAOpen} onClose={() => setTwoFAOpen(false)} />
      <BlockedUsersModal isOpen={blockedOpen} onClose={() => setBlockedOpen(false)} />
    </div>
  );
}
