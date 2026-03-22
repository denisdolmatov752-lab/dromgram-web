import { useState, useEffect } from 'react';
import api from '../api/axios';
import { format } from 'date-fns';

interface ProfileViewProps {
  userId: string;
  onClose: () => void;
  isSelf?: boolean;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName?: string;
  username: string;
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

function Avatar({
  url,
  name,
  color = '#2AABEE',
  size = 46,
  online = false,
  premium = false,
}: {
  url?: string;
  name: string;
  color?: string;
  size?: number;
  online?: boolean;
  premium?: boolean;
}) {
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((p: string) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {url ? (
        <img
          src={url}
          alt={name}
          className="rounded-full object-cover w-full h-full"
          onError={(e: any) => {
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center text-white font-semibold select-none"
          style={{
            width: size,
            height: size,
            background: color,
            fontSize: Math.max(10, size * 0.36),
          }}
        >
          {initials}
        </div>
      )}
      {online && (
        <div
          className="absolute bottom-0 right-0 rounded-full border-2"
          style={{
            width: Math.max(8, size * 0.25),
            height: Math.max(8, size * 0.25),
            background: 'var(--color-online, #31a24c)',
            borderColor: 'var(--glass-bg-strong, #0a0a0f)',
          }}
        />
      )}
      {premium && (
        <div
          className="absolute -inset-1 rounded-full border-2 pointer-events-none"
          style={{ borderColor: '#ffd700' }}
        />
      )}
    </div>
  );
}

export default function ProfileView({
  userId,
  onClose,
  isSelf = false,
}: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, giftsRes] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/users/${userId}/gifts`).catch(() => ({ data: [] })),
      ]);
      setProfile(profileRes.data);
      setGifts(giftsRes.data || []);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="glass w-full max-w-md rounded-3xl p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              Не удалось загрузить профиль
            </div>
          )}
        </div>
      </div>
    );
  }

  const displayName = `${profile.firstName} ${profile.lastName || ''}`.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-md rounded-3xl max-h-[90vh] overflow-y-auto animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Header with gradient background */}
          <div className="mb-6">
            <div
              className="h-24 rounded-xl mb-4 bg-gradient-to-r"
              style={{
                backgroundImage: `linear-gradient(135deg, ${profile.avatarColor || '#2AABEE'}, ${profile.avatarColor || '#2AABEE'}33)`,
                backdropFilter: 'blur(10px)',
              }}
            />

            {/* Avatar */}
            <div className="flex flex-col items-center gap-4 -mt-12 mb-6">
              <Avatar
                url={profile.avatarUrl}
                name={displayName}
                size={120}
                online={profile.isOnline}
                premium={profile.isPremium}
              />

              {/* Name and Username */}
              <div className="text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                  {displayName}
                  {profile.isPremium && (
                    <span className="text-2xl text-yellow-400">⭐</span>
                  )}
                </h1>
                <p className="text-blue-400 text-lg">@{profile.username}</p>

                {/* Online Status */}
                <div className="mt-2 flex items-center justify-center gap-2 text-sm">
                  {profile.isOnline ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-green-400">Online</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                      <span className="text-gray-400">
                        Last seen{' '}
                        {profile.lastSeen
                          ? format(new Date(profile.lastSeen), 'HH:mm')
                          : 'Recently'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-filter backdrop-blur-sm">
              <p className="text-sm text-gray-300 leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isSelf && (
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 flex flex-col items-center gap-1">
                <span className="text-lg">💬</span>
                <span className="text-xs">Написать</span>
              </button>
              <button className="p-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 flex flex-col items-center gap-1">
                <span className="text-lg">📞</span>
                <span className="text-xs">Позвонить</span>
              </button>
              <button className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 flex flex-col items-center gap-1">
                <span className="text-lg">🎁</span>
                <span className="text-xs">Подарок</span>
              </button>
            </div>
          )}

          {/* Gifts Section */}
          {gifts.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                <span>🎁</span>
                Полученные подарки ({gifts.length})
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {gifts.slice(0, 9).map((gift) => (
                  <div
                    key={gift.id}
                    className="group cursor-pointer transform transition-transform hover:scale-110"
                    title={gift.name}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center relative">
                      <img
                        src={`https://orproject.ru/nft/${gift.name}.png`}
                        alt={gift.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        onError={(e: any) => {
                          e.target.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3E?%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                        <p className="text-xs text-center text-white font-medium px-1 truncate">
                          {gift.name}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2 truncate">
                      {gift.sentBy.firstName}
                    </p>
                  </div>
                ))}
              </div>
              {gifts.length > 9 && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  + {gifts.length - 9} ещё подарков
                </p>
              )}
            </div>
          )}

          {/* Media Section */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <span>📸</span>
              Медиа
            </h3>
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">
                {isSelf ? 'Ваши медиа появятся здесь' : 'Медиа не найдены'}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          {isSelf && (
            <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors">
              ✏️ Редактировать профиль
            </button>
          )}

          {!isSelf && (
            <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-colors text-red-400">
              🚫 Заблокировать
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
