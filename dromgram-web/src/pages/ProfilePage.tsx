import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

// SVG Icons
const QRIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="4" height="4" />
    <path d="M11 9h2M9 11v2M11 11v2M9 9h2" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
  </svg>
);

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const GiftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="9" x2="12" y2="22" />
    <path d="M7 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2H7z" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const Spinner = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinner">
    <circle cx="12" cy="12" r="10" opacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

function Avatar({ url, name, color, size = 120 }: { url?: string; name?: string; color?: string; size?: number }) {
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

// Color Editor Modal
function ColorProfileEditor({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: any }) {
  const [selectedColor, setSelectedColor] = useState(user?.avatarColor || '#2AABEE');
  const solidColors = ['#2AABEE', '#4FAB83', '#F7931A', '#FF3B30', '#7B68EE', '#17B890', '#FF69B4', '#808080'];
  const gradients = [
    'linear-gradient(135deg, #2AABEE, #4FAB83)',
    'linear-gradient(135deg, #F7931A, #FF3B30)',
    'linear-gradient(135deg, #7B68EE, #2AABEE)',
    'linear-gradient(135deg, #17B890, #4FAB83)',
    'linear-gradient(135deg, #FF69B4, #FF3B30)',
    'linear-gradient(135deg, #2AABEE, #F7931A)',
    'linear-gradient(135deg, #7B68EE, #FF69B4)',
    'linear-gradient(135deg, #808080, #4FAB83)',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-[var(--color-bg)] rounded-t-3xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-divider)]">
          <h2 className="text-lg font-semibold">Изменить цвет профиля</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)]">✕</button>
        </div>

        <div className="p-4 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Preview */}
          <div className="flex justify-center">
            <div style={{ background: selectedColor, width: 120, height: 120 }} className="rounded-full" />
          </div>

          {/* Solid Colors */}
          <div>
            <p className="text-sm font-medium mb-3">Цвета</p>
            <div className="grid grid-cols-8 gap-2">
              {solidColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="w-8 h-8 rounded-full border-2"
                  style={{
                    background: color,
                    borderColor: selectedColor === color ? 'white' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Gradients */}
          <div>
            <p className="text-sm font-medium mb-3">Градиенты</p>
            <div className="grid grid-cols-8 gap-2">
              {gradients.map((gradient, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(gradient)}
                  className="w-8 h-8 rounded-full border-2"
                  style={{
                    background: gradient,
                    borderColor: selectedColor === gradient ? 'white' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Background Emoji */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Фоновый эмодзи</span>
            <span className="text-[var(--color-text-secondary)]">Нет</span>
          </div>

          {/* NFT Backgrounds */}
          <div>
            <p className="text-sm font-medium mb-3">Фоны</p>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
                  NFT {i}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium"
          >
            🔒 Применить стиль
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Profile Modal
function EditProfileModal({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: any }) {
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuthStore();

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put('/users/me', { firstName, lastName, bio });
      updateUser(res.data.data);
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-[var(--color-bg)] rounded-t-3xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-divider)]">
          <h2 className="text-lg font-semibold">Изменить профиль</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)]">✕</button>
        </div>

        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="text-sm font-medium block mb-2">Имя</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-divider)] bg-[var(--color-surface)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Фамилия</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-divider)] bg-[var(--color-surface)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">О себе ({bio.length}/150)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 150))}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-divider)] bg-[var(--color-surface)]"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium"
          >
            {loading ? <Spinner size={16} /> : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Menu Dropdown
function MenuDropdown({ onClose }: { onClose: () => void }) {
  const items = [
    { label: 'Изменить цвет профиля', action: 'color' },
    { label: 'Изменить имя', action: 'edit' },
    { label: 'Копировать ссылку', action: 'copy' },
  ];

  return (
    <div className="absolute top-12 right-4 glass-sm rounded-2xl overflow-hidden z-40">
      {items.map((item) => (
        <button
          key={item.action}
          onClick={() => {
            onClose();
          }}
          className="block w-full text-left px-4 py-3 text-sm hover:opacity-75 transition border-b border-[var(--color-divider)] last:border-b-0"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// Main Profile Page
export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [gifts, setGifts] = useState<any[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [activeTab, setActiveTab] = useState<'gifts' | 'posts' | 'archive'>('gifts');
  const [giftSubTab, setGiftSubTab] = useState<'all' | 'collection'>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorEditorOpen, setColorEditorOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchGifts = async () => {
      setLoadingGifts(true);
      try {
        const res = await api.get('/users/me/gifts');
        setGifts(res.data.data || []);
      } catch (err) {
        console.error('Error fetching gifts:', err);
      } finally {
        setLoadingGifts(false);
      }
    };
    if (user?.id) fetchGifts();
  }, [user?.id]);

  if (!user) {
    return <div className="flex items-center justify-center h-full"><Spinner /></div>;
  }

  const name = `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`;

  return (
    <div className="w-full max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-divider)]">
        <button><QRIcon /></button>
        <h1 className="text-lg font-bold">Мой профиль</h1>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}><MenuIcon /></button>
          {menuOpen && <MenuDropdown onClose={() => setMenuOpen(false)} />}
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center py-8 px-4">
        <Avatar url={user.avatarUrl} name={user.firstName} color={user.avatarColor} size={120} />
        
        {/* Online Badge */}
        <div className="flex items-center gap-2 mt-4 text-sm">
          <div className="w-2 h-2 rounded-full bg-[var(--color-online)]" />
          <span>в сети</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6 w-full justify-center flex-wrap">
          <button className="px-4 py-2 rounded-lg glass-sm text-sm flex items-center gap-2 hover:opacity-80">
            <CameraIcon /> Выбрать фото
          </button>
          <button
            onClick={() => setEditModalOpen(true)}
            className="px-4 py-2 rounded-lg glass-sm text-sm flex items-center gap-2 hover:opacity-80"
          >
            <EditIcon /> Изменить
          </button>
          <button className="px-4 py-2 rounded-lg glass-sm text-sm flex items-center gap-2 hover:opacity-80">
            <SettingsIcon /> Настройки
          </button>
        </div>

        {/* Music Bar */}
        <div className="mt-6 px-4 py-3 glass-sm rounded-lg w-full flex items-center gap-3">
          <span className="text-lg">🎵</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">The Weeknd - Blinding Lights</div>
          </div>
          <ChevronIcon />
        </div>

        {/* Info Card */}
        <div className="mt-6 w-full px-4">
          <div className="glass-sm rounded-lg overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-[var(--color-divider)]">
              <span className="text-sm text-[var(--color-text-secondary)]">Телефон</span>
              <span className="font-medium">{user.phone}</span>
            </div>
            <div className="p-4 flex items-center justify-between border-b border-[var(--color-divider)]">
              <span className="text-sm text-[var(--color-text-secondary)]">Имя пользователя</span>
              <span className="font-medium">@{user.username}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">День рождения</span>
              <span className="font-medium">-</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-4 py-4 border-b border-[var(--color-divider)] overflow-x-auto">
        {[
          { id: 'gifts', label: '🎁 Подарки' },
          { id: 'posts', label: '📝 Публикации' },
          { id: 'archive', label: '📦 Архив публикаций' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`whitespace-nowrap pb-2 text-sm font-medium border-b-2 transition ${
              activeTab === tab.id
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'gifts' && (
        <div className="p-4 space-y-4">
          {/* Gift Sub-tabs */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Все подарки' },
              { id: 'collection', label: '+ Добавить коллекцию' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setGiftSubTab(sub.id as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  giftSubTab === sub.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'glass-sm'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Gifts Grid */}
          {loadingGifts ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : gifts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-secondary)]">У вас нет подарков</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {gifts.map((gift) => (
                <div
                  key={gift.id}
                  className="aspect-square rounded-lg overflow-hidden bg-[var(--color-surface)] flex items-center justify-center"
                >
                  <img
                    src={`https://orproject.ru/nft/${gift.nftName}.png`}
                    alt={gift.nftName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling &&
                        ((e.target as HTMLImageElement).nextElementSibling as HTMLElement).style.display = 'flex';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="hidden absolute flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
                    {gift.nftName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="p-4 text-center py-12">
          <p className="text-[var(--color-text-secondary)]">У вас нет публикаций</p>
        </div>
      )}

      {activeTab === 'archive' && (
        <div className="p-4 text-center py-12">
          <p className="text-[var(--color-text-secondary)]">Архив пуст</p>
        </div>
      )}

      {/* Sticky Send Gifts Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center">
        <button className="px-6 py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium flex items-center gap-2">
          <GiftIcon /> Отправить подарки
        </button>
      </div>

      {/* Modals */}
      <ColorProfileEditor isOpen={colorEditorOpen} onClose={() => setColorEditorOpen(false)} user={user} />
      <EditProfileModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} user={user} />
    </div>
  );
}
