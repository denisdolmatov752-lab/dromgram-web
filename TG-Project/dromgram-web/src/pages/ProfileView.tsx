import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { useChatsStore } from '../store/chatsStore';

interface ProfileViewProps {
  userId: string;
  onClose: () => void;
  isSelf?: boolean;
  onOpenChat?: (chatId: string) => void;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  avatarColor?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: string;
  isPremium?: boolean;
  phone?: string;
}

interface Gift {
  id: string;
  name: string;
  sentAt: string;
  sentBy: { firstName: string; lastName?: string };
}

function Avatar({ url, name, color = '#2AABEE', size = 80, online = false, premium = false }: {
  url?: string; name: string; color?: string; size?: number; online?: boolean; premium?: boolean;
}) {
  const initials = (name || '?').split(' ').filter(Boolean).map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {premium && (
        <div style={{
          position: 'absolute', inset: -3, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ffd700, #ffb800, #ffd700)',
          zIndex: 0,
        }} />
      )}
      {url ? (
        <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', position: 'relative', zIndex: 1 }}
          onError={(e: any) => { e.target.style.display = 'none'; }} />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%', background: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: Math.max(10, size * 0.35),
          position: 'relative', zIndex: 1,
        }}>{initials}</div>
      )}
      {online && (
        <div style={{
          position: 'absolute', bottom: 2, right: 2, width: size * 0.25, height: size * 0.25,
          background: '#22c55e', borderRadius: '50%', border: '2px solid var(--color-bg)', zIndex: 2,
        }} />
      )}
    </div>
  );
}

export default function ProfileView({ userId, onClose, isSelf = false, onOpenChat }: ProfileViewProps) {
  const { user: currentUser } = useAuthStore();
  const { setChats, chats } = useChatsStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftItems, setGiftItems] = useState<any[]>([]);
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftSuccess, setGiftSuccess] = useState('');

  useEffect(() => { loadProfile(); }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, giftsRes] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/users/${userId}/gifts`).catch(() => ({ data: { data: [] } })),
      ]);
      const profileData = profileRes.data.data || profileRes.data;
      setProfile(profileData);
      setGifts(giftsRes.data?.data || giftsRes.data || []);
    } catch {
      setError('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handleWriteMessage = async () => {
    if (!profile) return;
    setActionLoading('message');
    try {
      // Create or find existing chat
      const res = await api.post('/chats', { userId: profile.id });
      const chat = res.data.data || res.data;
      // Update chats store
      const existing = chats.find(c => c.id === chat.id);
      if (!existing) {
        setChats([chat, ...chats]);
      }
      onClose();
      if (onOpenChat) onOpenChat(chat.id);
    } catch {
      alert('Не удалось открыть чат');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCall = async () => {
    if (!profile) return;
    setActionLoading('call');
    try {
      await api.post('/calls', { userId: profile.id, type: 'VOICE' });
      alert(`Звоним ${profile.firstName}...`);
    } catch {
      alert('Не удалось начать звонок');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async () => {
    if (!profile) return;
    if (!confirm(blocked ? `Разблокировать ${profile.firstName}?` : `Заблокировать ${profile.firstName}?`)) return;
    setActionLoading('block');
    try {
      if (blocked) {
        await api.delete(`/users/blocked/${profile.id}`);
        setBlocked(false);
      } else {
        await api.post('/users/blocked', { userId: profile.id });
        setBlocked(true);
      }
    } catch {
      alert('Ошибка');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenGiftModal = async () => {
    setShowGiftModal(true);
    setGiftLoading(true);
    try {
      const res = await api.get('/gifts/available');
      setGiftItems(res.data.data || res.data || []);
    } catch {
      setGiftItems([]);
    } finally {
      setGiftLoading(false);
    }
  };

  const handleSendGift = async (giftId: string) => {
    if (!profile) return;
    try {
      await api.post('/gifts/send', { toUserId: profile.id, giftId });
      setGiftSuccess('Подарок отправлен! 🎁');
      setTimeout(() => { setShowGiftModal(false); setGiftSuccess(''); loadProfile(); }, 2000);
    } catch {
      alert('Не удалось отправить подарок');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>😔</div>
        <p>{error || 'Профиль не найден'}</p>
        <button onClick={onClose} style={{ marginTop: 16, padding: '8px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>Закрыть</button>
      </div>
    );
  }

  const displayName = `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`;

  return (
    <div style={{ color: 'var(--color-text)', overflowY: 'auto', maxHeight: '90vh' }}>
      {/* Banner */}
      <div style={{
        height: 100,
        background: `linear-gradient(135deg, ${profile.avatarColor || '#2AABEE'}, ${profile.avatarColor || '#1A8AC4'}88)`,
        position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(0,0,0,0.35)', border: 'none', borderRadius: '50%',
          width: 32, height: 32, color: '#fff', cursor: 'pointer', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>

      {/* Avatar + Name */}
      <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
        <div style={{ marginTop: -50, display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <Avatar url={profile.avatarUrl} name={displayName} color={profile.avatarColor} size={100} online={profile.isOnline} premium={profile.isPremium} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {displayName}
          {profile.isPremium && <span style={{ color: '#ffd700', fontSize: 18 }}>⭐</span>}
        </h2>
        {profile.username && <p style={{ color: 'var(--color-primary)', fontSize: 14, marginBottom: 4 }}>@{profile.username}</p>}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: profile.isOnline ? '#22c55e' : 'var(--color-text-secondary)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: profile.isOnline ? '#22c55e' : '#6b7280' }} />
          {profile.isOnline ? 'онлайн' : profile.lastSeen ? `был(а) ${new Date(profile.lastSeen).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}` : 'недавно'}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div style={{ margin: '0 16px 16px', padding: '12px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 14 }}>
          <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.5 }}>{profile.bio}</p>
        </div>
      )}

      {/* Action Buttons */}
      {!isSelf && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, margin: '0 16px 16px' }}>
          <button onClick={handleWriteMessage} disabled={actionLoading === 'message'}
            style={{
              padding: '10px 8px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #2AABEE, #1A8AC4)', color: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
              opacity: actionLoading === 'message' ? 0.6 : 1,
            }}>
            <span style={{ fontSize: 20 }}>💬</span>
            {actionLoading === 'message' ? '...' : 'Написать'}
          </button>
          <button onClick={handleCall} disabled={actionLoading === 'call'}
            style={{
              padding: '10px 8px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
              opacity: actionLoading === 'call' ? 0.6 : 1,
            }}>
            <span style={{ fontSize: 20 }}>📞</span>
            {actionLoading === 'call' ? '...' : 'Звонок'}
          </button>
          <button onClick={handleOpenGiftModal}
            style={{
              padding: '10px 8px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
            }}>
            <span style={{ fontSize: 20 }}>🎁</span>
            Подарок
          </button>
        </div>
      )}

      {/* Gifts Section */}
      {gifts.length > 0 && (
        <div style={{ margin: '0 16px 16px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            🎁 Подарки <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>({gifts.length})</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {gifts.slice(0, 9).map(gift => (
              <div key={gift.id} title={gift.name} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '1', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                <img
                  src={`https://orproject.ru/nft/${encodeURIComponent(gift.name)}.png`}
                  alt={gift.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.style.display = 'flex';
                    e.target.parentNode.style.alignItems = 'center';
                    e.target.parentNode.style.justifyContent = 'center';
                    e.target.parentNode.innerHTML = `<span style="font-size:32px">🎁</span>`;
                  }}
                />
              </div>
            ))}
          </div>
          {gifts.length > 9 && (
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: 8 }}>
              + ещё {gifts.length - 9} подарков
            </p>
          )}
        </div>
      )}

      {/* Block button */}
      {!isSelf && (
        <div style={{ margin: '0 16px 24px' }}>
          <button onClick={handleBlock} disabled={actionLoading === 'block'}
            style={{
              width: '100%', padding: '12px', borderRadius: 14, border: '1px solid rgba(255,59,48,0.3)',
              background: 'rgba(255,59,48,0.08)', color: '#FF3B30', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              opacity: actionLoading === 'block' ? 0.6 : 1,
            }}>
            {blocked ? '✓ Разблокировать' : '🚫 Заблокировать'}
          </button>
        </div>
      )}

      {/* Gift Modal */}
      {showGiftModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowGiftModal(false)}>
          <div style={{ width: '100%', maxHeight: '80vh', background: 'var(--color-bg)', borderRadius: '24px 24px 0 0', overflow: 'auto', padding: 20 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: 'var(--color-divider)', borderRadius: 99, margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' }}>🎁 Отправить подарок</h3>
            {giftSuccess && (
              <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', borderRadius: 12, marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>
                {giftSuccess}
              </div>
            )}
            {giftLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
            ) : giftItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
                <p>Нет доступных подарков</p>
                <p style={{ fontSize: 12, marginTop: 8 }}>Купите звёзды для отправки подарков</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {giftItems.map((item: any) => (
                  <button key={item.id} onClick={() => handleSendGift(item.id)}
                    style={{
                      borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
                      padding: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}>
                    <img src={`https://orproject.ru/nft/${encodeURIComponent(item.name)}.png`} alt={item.name}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10 }}
                      onError={(e: any) => { e.target.style.display = 'none'; }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text)', textAlign: 'center' }}>{item.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--color-primary)' }}>⭐ {item.starsPrice || item.price || '?'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
