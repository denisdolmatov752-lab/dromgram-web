import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatsStore } from '../store/chatsStore';
import { socketService } from '../socket/socket';
import api from '../api/axios';
import SettingsPage from './SettingsPage';
const SettingsPanelFull = SettingsPage;
import ProfileView from './ProfileView';
import AIAssistantPanel from './AIAssistantPanel';
import StoriesPanel from './StoriesPanel';
import MarketPanel from './MarketPanel';
import PremiumPanel from './PremiumPanel';
import StarsPanel from './StarsPanel';
import SearchPanel from './SearchPanel';
import CreateChannelModal from '../components/channels/CreateChannelModal';

// ============================================================================
// VERIFIED BADGE COMPONENT
// ============================================================================
function VerifiedBadge({ size = 14 }: any) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx='12' cy='12' r='10' fill='#2AABEE'/>
      <path d='M8 12l3 3 5-6' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
    </svg>
  );
}

// ============================================================================
// AVATAR COMPONENT
// ============================================================================
function Avatar({ url, name = '', color = '#2AABEE', size = 48, online = false }: any) {
  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(name);

  return (
    <div style={{ position: 'relative' }}>
      {url ? (
        <img
          src={url}
          alt={name}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            background: color,
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: size * 0.35,
          }}
        >
          {initials}
        </div>
      )}
      {online && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size * 0.3,
            height: size * 0.3,
            background: '#31a24c',
            borderRadius: '50%',
            border: '2px solid #17212B',
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// MOBILE BOTTOM NAV COMPONENT
// ============================================================================
function MobileBottomNav({
  activeTab,
  onTabChange,
  unreadCount = 0,
  show = true,
}: any) {
  if (!show) return null;

  const tabs = [
    { id: 'chats', label: 'Чаты', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ), badge: unreadCount > 0 ? unreadCount : null },
    { id: 'contacts', label: 'Контакты', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )},
    { id: 'stories', label: 'Истории', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      </svg>
    )},
    { id: 'calls', label: 'Звонки', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    )},
    { id: 'settings', label: 'Настройки', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )},
  ];

  return (
    <div
      className="mobile-nav-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--color-nav-bg)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        borderTop: '1px solid var(--glass-border)',
        zIndex: 100,
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            padding: '8px 4px 10px',
            color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            transition: 'color 0.2s',
            position: 'relative',
          }}
        >
          <div style={{ 
            fontSize: 22,
            transform: activeTab === tab.id ? 'scale(1.12)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          }}>{tab.icon}</div>
          <div style={{ fontSize: 10, fontWeight: activeTab === tab.id ? 600 : 400 }}>{tab.label}</div>
          {tab.badge && (
            <div
              style={{
                position: 'absolute',
                top: 6,
                right: '18%',
                background: '#FF4458',
                color: '#fff',
                borderRadius: '50%',
                minWidth: 17,
                height: 17,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                border: '1.5px solid var(--color-bg)',
              }}
            >
              {tab.badge > 99 ? '99+' : tab.badge}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// DESKTOP SIDEBAR COMPONENT
// ============================================================================
function DesktopSidebar({
  chats,
  activeTab,
  onTabChange,
  activeChatId,
  onChatClick,
  user,
  onLogout,
  unreadTotal = 0,
}: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'chats', label: 'Чаты', icon: '💬' },
    { id: 'contacts', label: 'Контакты', icon: '👥' },
    { id: 'stories', label: 'Истории', icon: '🌀' },
    { id: 'calls', label: 'Звонки', icon: '📞' },
    { id: 'channels', label: 'Каналы', icon: '📢' },
    { id: 'ai', label: 'AI', icon: '✦' },
    { id: 'market', label: 'Маркет', icon: '🛍️' },
    { id: 'premium', label: 'Premium', icon: '⭐' },
    { id: 'stars', label: 'Звёзды', icon: '🌟' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' },
  ];

  const filteredChats = chats.filter(
    (c: any) =>
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.member && `${c.member.firstName} ${c.member.lastName || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      style={{
        width: 340,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        flexShrink: 0,
        background: '#17212B',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>DRomGram</div>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            color: '#2AABEE',
          }}
        >
          ✏️
        </button>
      </div>

      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          padding: '8px 8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: activeTab === item.id ? 'rgba(42, 171, 238, 0.15)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === item.id ? '#2AABEE' : 'rgba(255, 255, 255, 0.6)',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      {activeTab === 'chats' && (
        <div style={{ padding: '12px 12px' }}>
          <input
            type="text"
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* Chats List */}
      {activeTab === 'chats' && (
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 16 }}>
          {filteredChats.length === 0 ? (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: 13,
              }}
            >
              Нет чатов
            </div>
          ) : (
            filteredChats.map((chat: any) => (
              <button
                key={chat.id}
                onClick={() => onChatClick(chat.id)}
                style={{
                  width: '100%',
                  padding: '12px 12px',
                  background:
                    activeChatId === chat.id ? 'rgba(42, 171, 238, 0.15)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  borderRadius: 8,
                  margin: '0 8px',
                  transition: 'background 0.2s',
                }}
              >
                <Avatar
                  name={chat.member?.firstName || chat.name || '?'}
                  url={chat.avatarUrl}
                  color={chat.avatarColor || '#2AABEE'}
                  size={44}
                  online={chat.member?.isOnline}
                />
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center' }}>
                    {chat.member?.firstName || chat.name || 'Unknown'}
                    {chat.member?.isVerified && <VerifiedBadge size={14} />}
                  </div>
                  <div
                    style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: 12,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {chat.lastMessage || 'Нет сообщений'}
                  </div>
                </div>
                {(chat.unreadCount || 0) > 0 && (
                  <div
                    style={{
                      background: '#2AABEE',
                      color: '#fff',
                      borderRadius: '50%',
                      minWidth: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {chat.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* User footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <Avatar
          name={user?.firstName || '?'}
          url={user?.avatarUrl}
          color={user?.avatarColor || '#2AABEE'}
          size={40}
          online={user?.isOnline}
        />
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
            {user?.firstName} {user?.lastName || ''}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            @{user?.username || 'noname'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHAT VIEW COMPONENT
// ============================================================================
function ChatView({ chatId, onBack, onProfileClick }: any) {
  const { messages, typingUsers, addMessage, setMessages, clearUnread } = useChatsStore();
  const { user: currentUser } = useAuthStore();
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat details
  useEffect(() => {
    api
      .get(`/chats/${chatId}`)
      .then((r) => {
        setChat(r.data.data || r.data);
        clearUnread(chatId);
      })
      .catch(() => {});
  }, [chatId, clearUnread]);

  // Load messages
  useEffect(() => {
    setLoading(true);
    api
      .get(`/messages/chats/${chatId}`)
      .then((r) => {
        const msgs = r.data.data || r.data || [];
        setMessages(chatId, msgs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [chatId, setMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[chatId]]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    api
      .post('/messages', {
        chatId,
        type: 'TEXT',
        text: messageText,
      })
      .then((r) => {
        addMessage(r.data.data || r.data);
        setMessageText('');
      })
      .catch(() => {});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const chatMessages = messages[chatId] || [];
  const typingList = typingUsers[chatId] || [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0a0e27',
        overflow: 'hidden',
      }}
    >
      {/* App Bar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(23, 33, 43, 0.6)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            color: '#2AABEE',
          }}
        >
          ←
        </button>

        {chat && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => chat.member && onProfileClick(chat.member.id)}
          >
            <Avatar
              name={chat.member?.firstName || chat.name || '?'}
              url={chat.avatarUrl}
              color={chat.avatarColor || '#2AABEE'}
              size={40}
              online={chat.member?.isOnline}
            />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                {chat.member?.firstName || chat.name || 'Unknown'}
                {chat.member?.isVerified && <VerifiedBadge size={14} />}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                {chat.member?.isOnline ? 'онлайн' : 'офлайн'}
              </div>
            </div>
          </div>
        )}

        <button
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          📞
        </button>

        <button
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          ⋮
        </button>
      </div>

      {/* Messages List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {loading && (
          <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', padding: 32 }}>
            Загрузка...
          </div>
        )}

        {!loading && chatMessages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', padding: 32 }}>
            Нет сообщений
          </div>
        )}

        {chatMessages.map((msg: any) => {
          const isOwn = msg.senderId === currentUser?.id;
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '8px 12px',
                  borderRadius: 12,
                  background: isOwn ? 'rgba(42, 171, 238, 0.25)' : 'rgba(35, 46, 60, 0.9)',
                  color: '#fff',
                  wordBreak: 'break-word',
                }}
              >
                <div style={{ fontSize: 14 }}>{msg.text}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginTop: 4,
                  }}
                >
                  {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {typingList.length > 0 && (
          <div style={{ display: 'flex', gap: 4, padding: '8px 0' }}>
            <div
              style={{
                display: 'flex',
                gap: 4,
                padding: '8px 12px',
                background: 'rgba(35, 46, 60, 0.6)',
                borderRadius: 12,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#2AABEE',
                    animation: `pulse 1.4s infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px 16px 16px',
          background: 'rgba(23, 33, 43, 0.6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          gap: 8,
        }}
      >
        <input
          type="text"
          placeholder="Сообщение..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 20,
            color: '#fff',
            fontSize: 14,
            outline: 'none',
            resize: 'none',
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            background: '#2AABEE',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            transition: 'background 0.2s',
          }}
        >
          ▶️
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// CHATS LIST COMPONENT
// ============================================================================
function ChatsList({ chats, onChatClick }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(
    (c: any) =>
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.member && `${c.member.firstName} ${c.member.lastName || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--color-bg)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--color-divider)',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
        }}
      >
        <h1 style={{ color: 'var(--color-text)', fontSize: 24, fontWeight: 700, margin: 0, marginBottom: 12 }}>
          Чаты
        </h1>
        <input
          type="text"
          placeholder="🔍 Поиск чатов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'var(--glass-bg-strong)',
            border: '1px solid var(--glass-border)',
            borderRadius: 20,
            color: 'var(--color-text)',
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>

      {/* Chats List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 72 }}>
        {filteredChats.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
            <p style={{ fontSize: 16, margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>Нет чатов</p>
            <p style={{ fontSize: 13, marginTop: 8, color: 'var(--color-text-secondary)' }}>Начните диалог с кем-то</p>
          </div>
        ) : (
          filteredChats.map((chat: any) => (
            <button
              key={chat.id}
              onClick={() => onChatClick(chat.id)}
              style={{
                width: '100%', padding: '10px 16px', background: 'transparent', border: 'none',
                cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
                borderBottom: '1px solid var(--color-divider)', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar name={chat.member?.firstName || chat.name || '?'} url={chat.avatarUrl} color={chat.avatarColor || '#2AABEE'} size={48} online={chat.member?.isOnline} />
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <div style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center' }}>
                  {chat.member?.firstName || chat.name || 'Unknown'}
                  {chat.member?.isVerified && <VerifiedBadge size={14} />}
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {chat.lastMessage || 'Нет сообщений'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>
                  {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
                {(chat.unreadCount || 0) > 0 && (
                  <div style={{ background: 'var(--color-unread)', color: '#fff', borderRadius: '50%', minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* FAB Button */}
      <button
        style={{
          position: 'fixed', bottom: 80, right: 16, width: 52, height: 52,
          borderRadius: '50%', background: 'var(--color-primary)', border: 'none',
          cursor: 'pointer', color: '#fff', fontSize: 20, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(42,171,238,0.4)', transition: 'all 0.2s', zIndex: 50,
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        ✏️
      </button>
    </div>
  );
}

// ============================================================================
// SIMPLE VIEW STUBS
// ============================================================================
function ContactsView({ onProfileClick }: any) {
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/contacts')
      .then((r) => setContacts(r.data.data || []))
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-divider)' }}>
        <h2 style={{ color: 'var(--color-text)', fontSize: 22, fontWeight: 700, margin: 0 }}>Контакты</h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0', paddingBottom: 72 }}>
        {contacts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <p>Нет контактов</p>
          </div>
        ) : (
          contacts.map((c: any) => (
            <button
              key={c.id}
              onClick={() => onProfileClick && onProfileClick(c.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: '1px solid var(--color-divider)', textAlign: 'left',
              }}
            >
              <Avatar name={c.firstName} url={c.avatarUrl} color={c.avatarColor} size={44} online={c.isOnline} />
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                  {c.firstName} {c.lastName || ''}
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                  {c.isOnline ? '🟢 онлайн' : c.username ? `@${c.username}` : ''}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function CallsView() {
  const [calls, setCalls] = useState<any[]>([]);
  useEffect(() => {
    api.get('/calls').then(r => setCalls(r.data.data || [])).catch(() => {});
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-divider)' }}>
        <h2 style={{ color: 'var(--color-text)', fontSize: 22, fontWeight: 700, margin: 0 }}>Звонки</h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 72 }}>
        {calls.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📞</div>
            <p style={{ fontSize: 16, margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>Недавние звонки</p>
            <p style={{ fontSize: 13, marginTop: 8, color: 'var(--color-text-secondary)' }}>Здесь появятся ваши звонки</p>
          </div>
        ) : calls.map((call: any) => (
          <div key={call.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--color-divider)' }}>
            <Avatar name={call.caller?.firstName || '?'} url={call.caller?.avatarUrl} color={call.caller?.avatarColor} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--color-text)', fontWeight: 600 }}>{call.caller?.firstName || 'Неизвестный'}</div>
              <div style={{ color: call.status === 'MISSED' ? '#FF4458' : 'var(--color-text-secondary)', fontSize: 13 }}>
                {call.status === 'MISSED' ? '📵 Пропущенный' : call.type === 'VIDEO' ? '📹 Видеозвонок' : '📞 Голосовой'} · {new Date(call.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <button style={{ background: 'rgba(42,171,238,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#2AABEE', fontSize: 16 }}>📞</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChannelsView() {
  const [channels, setChannels] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await api.get('/channels');
      setChannels(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch channels:', err);
    }
  };

  const handleChannelCreated = (newChannel: any) => {
    setChannels([newChannel, ...channels]);
    setShowCreateModal(false);
  };

  const VerifiedCheckmark = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' style={{ marginLeft: 4 }}>
      <circle cx='12' cy='12' r='10' fill='#2AABEE'/>
      <path d='M8 12l3 3 5-6' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'/>
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--color-text)', fontSize: 22, fontWeight: 700, margin: 0 }}>Каналы</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: 'none',
            background: '#2AABEE',
            color: 'white',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ➕ Создать
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 72 }}>
        {channels.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📢</div>
            <p style={{ fontSize: 16, margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>Каналы</p>
            <p style={{ fontSize: 13, marginTop: 8, color: 'var(--color-text-secondary)' }}>Подпишитесь на интересные каналы</p>
          </div>
        ) : channels.map((ch: any) => (
          <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--color-divider)' }}>
            <Avatar name={ch.name || '?'} url={ch.avatarUrl} color={ch.avatarColor} size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text)', fontWeight: 600 }}>
                {ch.name}
                {ch.isVerified && <VerifiedCheckmark />}
              </div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{ch.subscribersCount || 0} подписчиков</div>
              {ch.lastPostPreview && (
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 12, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ch.lastPostPreview}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {showCreateModal && (
        <CreateChannelModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onChannelCreated={handleChannelCreated}
        />
      )}
    </div>
  );
}

export default function MainPage() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuthStore();
  const {
    chats,
    setChats,
    messages,
    addMessage,
    setMessages,
    typingUsers,
    setTyping,
    clearUnread,
    updateMessage,
    deleteMessage,
  } = useChatsStore();

  const [activeTab, setActiveTab] = useState<string>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/auth');
    }
  }, [token, navigate]);

  // Connect socket
  useEffect(() => {
    if (token) {
      socketService.connect(token);

      socketService.on('new_message', (data: any) => {
        addMessage(data.message || data);
      });

      socketService.on('message_updated', (data: any) => {
        updateMessage(data.message || data);
      });

      socketService.on('message_deleted', (data: any) => {
        deleteMessage(data.messageId, data.chatId);
      });

      socketService.on('typing_start', (data: any) => {
        setTyping(data.chatId, data.userId, true);
      });

      socketService.on('typing_stop', (data: any) => {
        setTyping(data.chatId, data.userId, false);
      });

      return () => {
        socketService.off('new_message');
        socketService.off('message_updated');
        socketService.off('message_deleted');
        socketService.off('typing_start');
        socketService.off('typing_stop');
      };
    }
  }, [token, addMessage, setTyping, updateMessage, deleteMessage]);

  // Load chats
  useEffect(() => {
    if (token) {
      api
        .get('/chats')
        .then((r) => setChats(r.data.data || r.data || []))
        .catch(() => {});
    }
  }, [token, setChats]);

  const handleLogout = () => {
    logout();
    socketService.disconnect();
    navigate('/auth');
  };

  // Render content based on active tab
  const renderContent = () => {
    if (activeChatId) {
      return (
        <ChatView
          chatId={activeChatId}
          onBack={() => setActiveChatId(null)}
          onProfileClick={(uid: string) => {
            setProfileUserId(uid);
            setShowProfile(true);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'chats':
        return <ChatsList chats={chats} onChatClick={setActiveChatId} />;
      case 'contacts':
        return <ContactsView onProfileClick={(uid: string) => { setProfileUserId(uid); setShowProfile(true); }} />;
      case 'calls':
        return <CallsView />;
      case 'channels':
        return <ChannelsView />;
      case 'stories':
        return <StoriesPanel />;
      case 'ai':
        return <AIAssistantPanel />;
      case 'market':
        return <MarketPanel />;
      case 'premium':
        return <PremiumPanel />;
      case 'stars':
        return <StarsPanel />;
      case 'search':
        return <SearchPanel />;
      case 'settings':
        return <SettingsPanelFull onLogout={handleLogout} />;
      default:
        return <ChatsList chats={chats} onChatClick={setActiveChatId} />;
    }
  };

  const unreadTotal = chats.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--color-bg)',
        overflow: 'hidden',
      }}
    >
      {/* Desktop Sidebar */}
      <div
        className="hidden lg:flex"
        style={{
          width: 340,
          flexDirection: 'column',
          borderRight: '1px solid var(--color-divider)',
          flexShrink: 0,
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
        }}
      >
        <DesktopSidebar
          chats={chats}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeChatId={activeChatId}
          onChatClick={setActiveChatId}
          user={user}
          onLogout={handleLogout}
          unreadTotal={unreadTotal}
        />
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {renderContent()}
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(t: string) => {
          setActiveTab(t);
          setActiveChatId(null);
        }}
        unreadCount={unreadTotal}
        show={!activeChatId}
      />

      {/* Profile Modal */}
      {showProfile && profileUserId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setShowProfile(false)}
        >
          <div
            style={{
              width: '100%',
              maxHeight: '92vh',
              background: 'var(--color-bg)',
              borderRadius: '24px 24px 0 0',
              overflow: 'auto',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, background: 'var(--color-divider)', borderRadius: 99, margin: '12px auto 0' }} />
            <ProfileView userId={profileUserId} onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}

      <style>{`
        .mobile-nav-bar { display: flex !important; }
        .hidden { display: none; }
        @media (min-width: 1024px) {
          .mobile-nav-bar { display: none !important; }
          .hidden { display: none !important; }
          .lg\\:flex { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
