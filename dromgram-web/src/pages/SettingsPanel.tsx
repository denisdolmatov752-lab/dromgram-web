import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import api from '../api/axios';

// SVG Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const BackArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// Spinner component
function Spinner({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinner">
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
        background: url ? `url(${url})` : color || '#2AABEE',
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

// Modal backdrop
function ModalBackdrop({ onClick }: { onClick: () => void }) {
  return <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClick} />;
}

// Account Section
function AccountSection({ onBack, user }: { onBack: () => void; user: any }) {
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/users/me', { firstName, lastName, bio });
    } catch (err) {
      console.error('Error saving account info:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-[var(--color-bg)] rounded-t-3xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[var(--color-divider)]">
          <button onClick={onBack}><BackArrowIcon /></button>
          <h2 className="text-lg font-semibold">Аккаунт</h2>
        </div>
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="text-sm font-medium block mb-2">Имя</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-divider)] bg-[var(--color-surface)]" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Фамилия</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-divider)] bg-[var(--color-surface)]" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">О себе ({bio.length}/70)</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 70))} rows={3} className="w-full px-3 py-2 rounded-lg border border-[var(--color-divider)] bg-[var(--color-surface)]" />
          </div>
          <button onClick={handleSave} disabled={loading} className="w-full py-3 rounded-lg btn-primary">
            {loading ? <Spinner size={16} /> : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Chat Settings Section
function ChatSettingsSection({ onBack }: { onBack: () => void }) {
  const { fontSize, setFontSize } = useUIStore();
  const [radius, setRadius] = useState(18);
  const [dayNight, setDayNight] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-[var(--color-bg)] rounded-t-3xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[var(--color-divider)]">
          <button onClick={onBack}><BackArrowIcon /></button>
          <h2 className="text-lg font-semibold">Настройки чатов</h2>
        </div>
        <div className="p-4 space-y-6 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="text-sm font-medium block mb-2">Размер текста ({fontSize}px)</label>
            <input type="range" min="12" max="24" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Скругление углов ({radius}px)</label>
            <input type="range" min="4" max="28" value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} className="w-full" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">День/Ночь</span>
            <Toggle value={dayNight} onChange={setDayNight} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Privacy Section
function PrivacySection({ onBack, user }: { onBack: () => void; user: any }) {
  const [privacy, setPrivacy] = useState({ phoneVisible: true, lastSeen: true, photos: true });

  const handleSave = async () => {
    try {
      await api.put('/users/me/privacy', privacy);
    } catch (err) {
      console.error('Error saving privacy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-[var(--color-bg)] rounded-t-3xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[var(--color-divider)]">
          <button onClick={onBack}><BackArrowIcon /></button>
          <h2 className="text-lg font-semibold">Конфиденциальность</h2>
        </div>
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm">Номер телефона видит каждый</span>
            <Toggle value={privacy.phoneVisible} onChange={(v) => setPrivacy({ ...privacy, phoneVisible: v })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Последний вход видит каждый</span>
            <Toggle value={privacy.lastSeen} onChange={(v) => setPrivacy({ ...privacy, lastSeen: v })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Фотографии видит каждый</span>
            <Toggle value={privacy.photos} onChange={(v) => setPrivacy({ ...privacy, photos: v })} />
          </div>
          <button onClick={handleSave} className="w-full py-3 rounded-lg btn-primary mt-6">Сохранить</button>
        </div>
      </div>
    </div>
  );
}

// Sessions Section
function SessionsSection({ onBack }: { onBack: () => void }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/users/me/sessions');
        setSessions(res.data.data || []);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const revokeSession = async (id: string) => {
    try {
      await api.delete(`/users/me/sessions/${id}`);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error revoking session:', err);
    }
  };

  const revokeAll = async () => {
    if (!confirm('Завершить все сессии кроме текущей?')) return;
    try {
      await api.delete('/users/me/sessions');
      setSessions([]);
    } catch (err) {
      console.error('Error revoking all:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-[var(--color-bg)] rounded-t-3xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[var(--color-divider)]">
          <button onClick={onBack}><BackArrowIcon /></button>
          <h2 className="text-lg font-semibold">Активные сессии</h2>
        </div>
        <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
          {loading ? <Spinner /> : sessions.length === 0 ? (
            <p className="text-center text-[var(--color-text-secondary)]">Нет активных сессий</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="glass-sm p-3 rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm font-medium">{session.deviceName}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{session.os}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{session.ip}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">Последний вход: {new Date(session.lastActive).toLocaleString('ru-RU')}</div>
                </div>
                <button onClick={() => revokeSession(session.id)} className="px-3 py-1 rounded bg-[var(--color-error)] text-white text-xs">Завершить</button>
              </div>
            ))
          )}
          {sessions.length > 0 && <button onClick={revokeAll} className="w-full py-2 rounded-lg bg-[var(--color-error)] text-white mt-4">Завершить все</button>}
        </div>
      </div>
    </div>
  );
}

// Storage Section
function StorageSection({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-[var(--color-bg)] rounded-t-3xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[var(--color-divider)]">
          <button onClick={onBack}><BackArrowIcon /></button>
          <h2 className="text-lg font-semibold">Данные и память</h2>
        </div>
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Автозагрузка фото</span>
              <Toggle value={true} onChange={() => {}} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Автозагрузка видео</span>
              <Toggle value={true} onChange={() => {}} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Автозагрузка документов</span>
              <Toggle value={false} onChange={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Languages Section
function LanguagesSection({ onBack }: { onBack: () => void }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ru');

  const languages = [
    { code: 'ru', name: 'Русский' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
  ];

  const handleLangChange = (code: string) => {
    setLang(code);
    localStorage.setItem('lang', code);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-[var(--color-bg)] rounded-t-3xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[var(--color-divider)]">
          <button onClick={onBack}><BackArrowIcon /></button>
          <h2 className="text-lg font-semibold">Язык</h2>
        </div>
        <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
          {languages.map((l) => (
            <label key={l.code} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-surface)] cursor-pointer">
              <input type="radio" name="lang" value={l.code} checked={lang === l.code} onChange={() => handleLangChange(l.code)} />
              <span className="text-sm">{l.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Settings Panel
export default function SettingsPanel({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const { user, updateUser, logout } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatarUrl: response.data.data.avatarUrl });
    } catch (err) {
      console.error('Error uploading avatar:', err);
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) return <div>Загрузка...</div>;

  const name = `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`;

  // Sections list
  const sections = [
    { id: 'account', label: 'Аккаунт', icon: '👤', color: '#0098EA' },
    { id: 'chats', label: 'Настройки чатов', icon: '💬', color: '#F7931A' },
    { id: 'privacy', label: 'Конфиденциальность', icon: '🔒', color: '#4FAB83' },
    { id: 'notifications', label: 'Уведомления', icon: '🔔', color: '#FF3B30' },
    { id: 'storage', label: 'Данные и память', icon: '💾', color: '#2AABEE' },
    { id: 'devices', label: 'Устройства', icon: '💻', color: '#17B890' },
    { id: 'language', label: 'Язык', icon: '🌐', color: '#7B68EE' },
  ];

  if (activeSection) {
    const onBack = () => setActiveSection(null);
    if (activeSection === 'account') return <AccountSection onBack={onBack} user={user} />;
    if (activeSection === 'chats') return <ChatSettingsSection onBack={onBack} />;
    if (activeSection === 'privacy') return <PrivacySection onBack={onBack} user={user} />;
    if (activeSection === 'storage') return <StorageSection onBack={onBack} />;
    if (activeSection === 'devices') return <SessionsSection onBack={onBack} />;
    if (activeSection === 'language') return <LanguagesSection onBack={onBack} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-24 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Настройки</h1>
        <button><SearchIcon /></button>
      </div>

      {/* Profile Card */}
      <div className="glass-sm p-6 rounded-3xl mb-6 text-center">
        <div className="relative inline-block mb-4">
          <Avatar url={user.avatarUrl} name={user.firstName} color={user.avatarColor} size={90} />
          {uploadLoading && <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50"><Spinner size={20} /></div>}
          <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 rounded-full bg-[var(--color-primary)] text-white">
            <CameraIcon />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
        </div>
        <h2 className="text-xl font-bold mb-1">{name}</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">📱 {user.phone} • @{user.username}</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => setActiveSection(section.id)}
              className="w-full glass-sm p-4 rounded-2xl flex items-center gap-3 hover:opacity-80 transition"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: section.color }}>{section.icon}</div>
              <div className="flex-1 text-left">
                <div className="font-medium">{section.label}</div>
              </div>
              <ChevronIcon />
            </button>
          </div>
        ))}
      </div>

      {/* Premium & Other */}
      <div className="space-y-2 mt-6">
        <button className="w-full glass-sm p-4 rounded-2xl flex items-center gap-3 hover:opacity-80 transition">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-purple-500">⭐</div>
          <div className="flex-1 text-left font-medium">DRomGram Premium</div>
          <ChevronIcon />
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-[var(--color-divider)] text-center">
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">DRomGram для Web v2.0.0</p>
        <button onClick={() => logout()} className="w-full py-3 rounded-lg text-[var(--color-error)] font-medium hover:opacity-80">
          🚪 Выход
        </button>
      </div>
    </div>
  );
}
