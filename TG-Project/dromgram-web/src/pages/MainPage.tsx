import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatsStore } from '../store/chatsStore';
import { socketService } from '../socket/socket';
import api from '../api/axios';
import SettingsPanelFull from './SettingsPanel';
import ProfileView from './ProfileView';
import AIAssistantPanel from './AIAssistantPanel';
import StoriesPanel from './StoriesPanel';
import MarketPanel from './MarketPanel';
import PremiumPanel from './PremiumPanel';
import StarsPanel from './StarsPanel';
import SearchPanel from './SearchPanel';

// ============================================================================
// AVATAR COMPONENT
// ============================================================================
function Avatar({ url, name = '', color = '#2AABEE', size = 48, online = false }: any) {
  const initials = (name || '?').split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {url ? (
        <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
          onError={(e: any) => { e.target.style.display = 'none'; }} />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%', background: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: Math.max(10, size * 0.35), userSelect: 'none',
        }}>{initials}</div>
      )}
      {online && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: Math.max(8, size * 0.28), height: Math.max(8, size * 0.28),
          background: '#22c55e', borderRadius: '50%', border: '2px solid var(--color-bg)',
        }} />
      )}
    </div>
  );
}

// ============================================================================
// MOBILE BOTTOM NAV — LIQUID GLASS PILL
// ============================================================================
function MobileBottomNav({ activeTab, onTabChange, unreadCount = 0, show = true }: any) {
  if (!show) return null;
  const tabs = [
    { id: 'chats', label: 'Чаты', badge: unreadCount > 0 ? unreadCount : null, svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )},
    { id: 'contacts', label: 'Люди', badge: null, svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )},
    { id: 'stories', label: 'Истории', badge: null, svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      </svg>
    )},
    { id: 'calls', label: 'Звонки', badge: null, svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    )},
    { id: 'settings', label: 'Ещё', badge: null, svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
      </svg>
    )},
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--color-nav-bg)',
      backdropFilter: 'blur(24px) saturate(200%)',
      WebkitBackdropFilter: 'blur(24px) saturate(200%)',
      borderTop: '1px solid var(--glass-border)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
      display: 'flex',
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2, padding: '8px 4px 10px',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              transition: 'color 0.2s',
              position: 'relative',
            }}>
            <div style={{
              transform: isActive ? 'scale(1.15)' : 'scale(1)',
              transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}>{tab.svg}</div>
            <div style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{tab.label}</div>
            {tab.badge && (
              <div style={{
                position: 'absolute', top: 6, right: '16%',
                background: '#FF4458', color: '#fff', borderRadius: '50%',
                minWidth: 17, height: 17, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 10, fontWeight: 700,
                border: '1.5px solid var(--color-bg)',
              }}>{tab.badge > 99 ? '99+' : tab.badge}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// DESKTOP SIDEBAR
// ============================================================================
function DesktopSidebar({ chats, activeTab, onTabChange, activeChatId, onChatClick, user }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const navItems = [
    { id: 'chats', label: 'Чаты', emoji: null, svgPath: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { id: 'contacts', label: 'Контакты', emoji: '👥', svgPath: null },
    { id: 'stories', label: 'Истории', emoji: '🌀', svgPath: null },
    { id: 'calls', label: 'Звонки', emoji: '📞', svgPath: null },
    { id: 'channels', label: 'Каналы', emoji: '📢', svgPath: null },
    { id: 'ai', label: 'AI', emoji: '✦', svgPath: null },
    { id: 'market', label: 'Маркет', emoji: '🛍️', svgPath: null },
    { id: 'premium', label: 'Premium', emoji: '⭐', svgPath: null },
    { id: 'stars', label: 'Звёзды', emoji: '✨', svgPath: null },
    { id: 'settings', label: 'Настройки', emoji: '⚙️', svgPath: null },
  ];
  const filteredChats = chats.filter((c: any) =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    ((c.member?.firstName || '') + ' ' + (c.member?.lastName || '')).toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div style={{ width: 300, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-divider)', flexShrink: 0, background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--color-divider)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', letterSpacing: -0.5 }}>DRomGram</span>
          <button onClick={() => onTabChange('search')} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '5px 8px', cursor: 'pointer', color: 'var(--color-primary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>
        {/* Nav pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => onTabChange(item.id)}
              style={{
                padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: activeTab === item.id ? 'var(--color-primary)' : 'var(--glass-bg)',
                color: activeTab === item.id ? '#fff' : 'var(--color-text-secondary)',
                transition: 'all 0.2s',
              }}>{item.emoji || ''} {item.label}</button>
          ))}
        </div>
      </div>
      {/* Search + Chats */}
      {activeTab === 'chats' && (
        <>
          <div style={{ padding: '10px 12px' }}>
            <input type="text" placeholder="Поиск чатов..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 14px', background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', borderRadius: 20, color: 'var(--color-text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredChats.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>Нет чатов
              </div>
            ) : filteredChats.map((chat: any) => {
              const name = chat.member?.firstName || chat.name || 'Чат';
              const isActive = activeChatId === chat.id;
              return (
                <button key={chat.id} onClick={() => onChatClick(chat.id)}
                  style={{
                    width: '100%', padding: '10px 12px', background: isActive ? 'rgba(42,171,238,0.12)' : 'transparent',
                    border: 'none', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center',
                    borderBottom: '1px solid var(--color-divider)', textAlign: 'left', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--glass-bg)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                  <Avatar name={name} url={chat.avatarUrl} color={chat.avatarColor || '#2AABEE'} size={42} online={chat.member?.isOnline} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.lastMessage || 'Нет сообщений'}</div>
                  </div>
                  {(chat.unreadCount || 0) > 0 && (
                    <div style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: '50%', minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
      {/* User footer */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--color-divider)', display: 'flex', gap: 10, alignItems: 'center', background: 'var(--glass-bg)', flexShrink: 0 }}>
        <Avatar name={user?.firstName || '?'} url={user?.avatarUrl} color={user?.avatarColor || '#2AABEE'} size={36} online />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName} {user?.lastName || ''}</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>@{user?.username || 'noname'}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHAT VIEW — полный, с отправкой, реакциями, typing
// ============================================================================
function ChatView({ chatId, onBack, onProfileClick }: any) {
  const { messages, typingUsers, addMessage, setMessages, clearUnread, updateMessage, deleteMessage } = useChatsStore();
  const { user: currentUser } = useAuthStore();
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chat, setChat] = useState<any>(null);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{ msg: any; x: number; y: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get(`/chats/${chatId}`).then(r => { setChat(r.data.data || r.data); clearUnread(chatId); }).catch(() => {});
    setLoading(true);
    api.get(`/messages/${chatId}`).then(r => { setMessages(chatId, r.data.data || r.data || []); }).catch(() => {}).finally(() => setLoading(false));
    socketService.joinChat(chatId);
    return () => { socketService.leaveChat(chatId); };
  }, [chatId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages[chatId]]);

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || sending) return;
    setSending(true);
    setMessageText('');
    setReplyTo(null);
    socketService.stopTyping(chatId);
    try {
      const res = await api.post('/messages', { chatId, type: 'TEXT', text, ...(replyTo ? { replyToId: replyTo.id } : {}) });
      addMessage(res.data.data || res.data);
    } catch { setMessageText(text); }
    finally { setSending(false); inputRef.current?.focus(); }
  };

  const handleTyping = (val: string) => {
    setMessageText(val);
    if (val) socketService.startTyping(chatId);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => socketService.stopTyping(chatId), 3000);
  };

  const handleDeleteMessage = async (msgId: string, forAll = false) => {
    try {
      await api.delete(`/messages/${msgId}`, { data: { forAll } });
      deleteMessage(msgId, chatId);
    } catch { alert('Не удалось удалить сообщение'); }
    setContextMenu(null);
  };

  const handleReact = async (msgId: string, emoji: string) => {
    try {
      await api.post(`/messages/${msgId}/react`, { emoji });
    } catch {}
    setContextMenu(null);
  };

  const chatMessages = messages[chatId] || [];
  const typingList = (typingUsers[chatId] || []).filter((id: string) => id !== currentUser?.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-chat-bg)', overflow: 'hidden', position: 'relative' }}
      onClick={() => contextMenu && setContextMenu(null)}>
      {/* Header */}
      <div className="glass-header" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: '4px 8px 4px 0', fontSize: 20, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        {chat && (
          <div style={{ flex: 1, display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}
            onClick={() => chat.member && onProfileClick(chat.member.id)}>
            <Avatar name={chat.member?.firstName || chat.name || '?'} url={chat.avatarUrl} color={chat.avatarColor || '#2AABEE'} size={38} online={chat.member?.isOnline} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {chat.member?.firstName || chat.name || 'Чат'}
              </div>
              <div style={{ color: typingList.length > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontSize: 12 }}>
                {typingList.length > 0 ? 'печатает...' : chat.member?.isOnline ? 'онлайн' : 'не в сети'}
              </div>
            </div>
          </div>
        )}
        <button onClick={async () => { if (chat?.member) { try { await api.post('/calls', { userId: chat.member.id, type: 'VOICE' }); alert('Звонок...'); } catch { alert('Не удалось позвонить'); } } }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>}
        {!loading && chatMessages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>👋</div>
            <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text)' }}>Начните разговор!</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Напишите первое сообщение</p>
          </div>
        )}
        {chatMessages.map((msg: any) => {
          const isOwn = msg.senderId === currentUser?.id;
          const time = new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: 2 }}
              onContextMenu={e => { e.preventDefault(); setContextMenu({ msg, x: e.clientX, y: e.clientY }); }}>
              {msg.replyTo && (
                <div style={{ position: 'absolute', fontSize: 11, background: 'rgba(42,171,238,0.1)', borderLeft: '2px solid var(--color-primary)', padding: '2px 8px', borderRadius: 4, marginBottom: 2, color: 'var(--color-text-secondary)', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {msg.replyTo.text || 'Сообщение'}
                </div>
              )}
              <div style={{
                maxWidth: '72%', padding: '8px 12px', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isOwn ? 'linear-gradient(135deg, rgba(42,171,238,0.9), rgba(26,138,196,0.85))' : 'var(--glass-bg-strong)',
                color: isOwn ? '#fff' : 'var(--color-text)',
                border: isOwn ? 'none' : '1px solid var(--glass-border)',
                boxShadow: isOwn ? '0 2px 8px rgba(42,171,238,0.3)' : 'var(--glass-shadow-sm)',
                wordBreak: 'break-word', cursor: 'pointer',
              }}>
                {msg.type === 'TEXT' && <div style={{ fontSize: 14, lineHeight: 1.45 }}>{msg.text}</div>}
                {msg.type === 'PHOTO' && msg.mediaUrl && (
                  <img src={msg.mediaUrl} alt="photo" style={{ maxWidth: '100%', borderRadius: 10, cursor: 'pointer' }} onClick={() => window.open(msg.mediaUrl)} />
                )}
                {msg.type === 'VOICE' && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>🎤 <span style={{ fontSize: 13 }}>Голосовое {msg.mediaDuration ? `(${msg.mediaDuration}с)` : ''}</span></div>}
                {msg.type === 'DOCUMENT' && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>📎 <span style={{ fontSize: 13 }}>{msg.fileName || 'Файл'}</span></div>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                  {msg.isEdited && <span style={{ fontSize: 10, opacity: 0.7 }}>ред.</span>}
                  <span style={{ fontSize: 10, opacity: 0.75 }}>{time}</span>
                  {isOwn && <span style={{ fontSize: 10, color: msg.status === 'READ' ? '#60d4ff' : 'rgba(255,255,255,0.6)' }}>{msg.status === 'READ' ? '✓✓' : msg.status === 'DELIVERED' ? '✓✓' : '✓'}</span>}
                </div>
                {msg.reactions?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
                    {Object.entries(msg.reactions.reduce((a: any, r: any) => { a[r.emoji] = (a[r.emoji] || 0) + 1; return a; }, {})).map(([emoji, count]) => (
                      <span key={emoji} style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '1px 6px', cursor: 'pointer' }}
                        onClick={() => handleReact(msg.id, emoji)}>
                        {emoji} {count as number}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {typingList.length > 0 && (
          <div style={{ display: 'flex', gap: 4, padding: '6px 0' }}>
            <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: 'var(--glass-bg-strong)', borderRadius: 16, border: '1px solid var(--glass-border)' }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', animation: 'typing-dot 1.4s infinite', animationDelay: `${i*0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} style={{ height: 4 }} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div style={{ padding: '8px 14px', background: 'var(--color-nav-bg)', borderTop: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 3, height: 32, background: 'var(--color-primary)', borderRadius: 99, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>Ответ</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyTo.text}</div>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 18 }}>✕</button>
        </div>
      )}

      {/* Input */}
      <div className="glass-header" style={{ padding: '10px 14px', paddingBottom: 'max(14px, env(safe-area-inset-bottom))', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </button>
        <div style={{ flex: 1, background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', borderRadius: 22, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input ref={inputRef} type="text" placeholder="Сообщение..." value={messageText}
            onChange={e => handleTyping(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: 14, fontFamily: 'inherit' }} />
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 0 }}>😊</button>
        </div>
        <button onClick={handleSend} disabled={!messageText.trim() || sending}
          style={{
            width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: messageText.trim() ? 'pointer' : 'not-allowed',
            background: messageText.trim() ? 'linear-gradient(135deg, #2AABEE, #1A8AC4)' : 'var(--glass-bg)',
            color: messageText.trim() ? '#fff' : 'var(--color-text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: messageText.trim() ? '0 4px 12px rgba(42,171,238,0.4)' : 'none',
            transition: 'all 0.2s',
          }}>
          {sending ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21L23 12 2 3v7l15 2-15 2v7z" /></svg>}
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div style={{
          position: 'fixed', left: Math.min(contextMenu.x, window.innerWidth - 180), top: Math.min(contextMenu.y, window.innerHeight - 200), zIndex: 500,
          background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)', backdropFilter: 'blur(20px)', minWidth: 160, overflow: 'hidden',
        }}>
          {['👍','❤️','😂','😮','😢','🔥'].map(emoji => (
            <button key={emoji} onClick={() => handleReact(contextMenu.msg.id, emoji)}
              style={{ padding: '4px 6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>{emoji}</button>
          ))}
          <div style={{ height: 1, background: 'var(--color-divider)' }} />
          <button onClick={() => { setReplyTo(contextMenu.msg); setContextMenu(null); inputRef.current?.focus(); }}
            style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontSize: 13, textAlign: 'left', display: 'flex', gap: 8 }}>
            ↩️ Ответить
          </button>
          {contextMenu.msg.senderId === currentUser?.id && (
            <button onClick={() => handleDeleteMessage(contextMenu.msg.id, true)}
              style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#FF3B30', fontSize: 13, textAlign: 'left', display: 'flex', gap: 8 }}>
              🗑️ Удалить
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes typing-dot { 0%,60%,100%{opacity:0.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-4px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ============================================================================
// CONTACTS VIEW
// ============================================================================
function ContactsView({ onProfileClick, onStartChat }: any) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/contacts').then(r => setContacts(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = contacts.filter(c => `${c.firstName} ${c.lastName || ''} ${c.username || ''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="glass-header" style={{ padding: '14px 16px', flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>Контакты</h1>
        <input type="text" placeholder="Поиск контактов..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '9px 14px', background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', borderRadius: 20, color: 'var(--color-text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '60px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>👥</div>
            <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>Нет контактов</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Добавьте контакты через поиск</p>
          </div>
        ) : filtered.map(c => (
          <button key={c.id} onClick={() => onProfileClick(c.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--color-divider)', textAlign: 'left', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Avatar name={c.firstName} url={c.avatarUrl} color={c.avatarColor} size={46} online={c.isOnline} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 14 }}>{c.firstName} {c.lastName || ''}</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{c.isOnline ? '🟢 онлайн' : c.username ? `@${c.username}` : ''}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); onStartChat(c.id); }}
              style={{ background: 'rgba(42,171,238,0.12)', border: 'none', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 12, fontWeight: 600 }}>
              Написать
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CALLS VIEW
// ============================================================================
function CallsView() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/calls').then(r => setCalls(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCall = async (userId: string, type: 'VOICE' | 'VIDEO') => {
    try {
      await api.post('/calls', { userId, type });
      alert(type === 'VOICE' ? 'Голосовой звонок...' : 'Видеозвонок...');
    } catch { alert('Не удалось совершить звонок'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="glass-header" style={{ padding: '14px 16px 14px', flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>Звонки</h1>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
        ) : calls.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📞</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Нет звонков</p>
            <p style={{ fontSize: 13 }}>Здесь появятся ваши звонки</p>
          </div>
        ) : calls.map((call: any) => (
          <div key={call.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--color-divider)' }}>
            <Avatar name={call.caller?.firstName || call.callee?.firstName || '?'} url={call.caller?.avatarUrl || call.callee?.avatarUrl} color={call.caller?.avatarColor} size={46} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 14 }}>
                {call.caller?.firstName || call.callee?.firstName || 'Неизвестный'}
              </div>
              <div style={{ fontSize: 12, color: call.status === 'MISSED' ? '#FF4458' : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {call.status === 'MISSED' ? '↙ Пропущенный' : call.direction === 'INCOMING' ? '↙' : '↗'} {call.type === 'VIDEO' ? 'Видеозвонок' : 'Голосовой'} · {new Date(call.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <button onClick={() => handleCall(call.caller?.id || call.callee?.id, call.type)}
              style={{ background: 'rgba(42,171,238,0.12)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CHANNELS VIEW
// ============================================================================
function ChannelsView() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/channels').then(r => setChannels(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (channelId: string) => {
    try {
      await api.post(`/channels/${channelId}/subscribe`);
      setChannels(prev => prev.map(c => c.id === channelId ? { ...c, isSubscribed: true, subscribersCount: (c.subscribersCount || 0) + 1 } : c));
    } catch { alert('Ошибка подписки'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="glass-header" style={{ padding: '14px 16px', flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>Каналы</h1>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
        ) : channels.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📢</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Каналы</p>
            <p style={{ fontSize: 13 }}>Подпишитесь на интересные каналы</p>
          </div>
        ) : channels.map((ch: any) => (
          <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--color-divider)' }}>
            <Avatar name={ch.name || '?'} url={ch.avatarUrl} color={ch.avatarColor} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.name}</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{(ch.subscribersCount || 0).toLocaleString()} подписчиков</div>
            </div>
            <button onClick={() => !ch.isSubscribed && handleSubscribe(ch.id)}
              style={{
                background: ch.isSubscribed ? 'rgba(34,197,94,0.12)' : 'rgba(42,171,238,0.12)',
                border: 'none', borderRadius: 10, padding: '6px 12px', cursor: ch.isSubscribed ? 'default' : 'pointer',
                color: ch.isSubscribed ? '#22c55e' : 'var(--color-primary)', fontSize: 12, fontWeight: 600, flexShrink: 0,
              }}>
              {ch.isSubscribed ? '✓ Подписан' : 'Подписаться'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CHATS LIST VIEW
// ============================================================================
function ChatsList({ chats, onChatClick }: any) {
  const [search, setSearch] = useState('');
  const filtered = chats.filter((c: any) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    ((c.member?.firstName || '') + ' ' + (c.member?.lastName || '')).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="glass-header" style={{ padding: '14px 16px', flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>Чаты</h1>
        <input type="text" placeholder="Поиск чатов..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '9px 14px', background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', borderRadius: 20, color: 'var(--color-text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Нет чатов</p>
            <p style={{ fontSize: 13 }}>Начните диалог с кем-то</p>
          </div>
        ) : filtered.map((chat: any) => {
          const name = chat.member?.firstName || chat.name || 'Чат';
          return (
            <button key={chat.id} onClick={() => onChatClick(chat.id)}
              style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid var(--color-divider)', transition: 'background 0.15s', textAlign: 'left' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <Avatar name={name} url={chat.avatarUrl} color={chat.avatarColor || '#2AABEE'} size={50} online={chat.member?.isOnline} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
                  <span style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 11, flexShrink: 0 }}>
                    {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.lastMessage || 'Нет сообщений'}</span>
                  {(chat.unreadCount || 0) > 0 && (
                    <span style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 999, minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, padding: '0 5px' }}>
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <button onClick={() => {}}
        style={{
          position: 'fixed', bottom: 80, right: 16, width: 52, height: 52,
          borderRadius: '50%', background: 'linear-gradient(135deg, #2AABEE, #1A8AC4)',
          border: 'none', cursor: 'pointer', color: '#fff', fontSize: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(42,171,238,0.45)', zIndex: 50, transition: 'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
  );
}

// ============================================================================
// MAIN PAGE — DEFAULT EXPORT
// ============================================================================
export default function MainPage() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuthStore();
  const { chats, setChats, addMessage, setMessages, setTyping, clearUnread, updateMessage, deleteMessage } = useChatsStore();

  const [activeTab, setActiveTab] = useState<string>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => { if (!token) navigate('/auth'); }, [token, navigate]);

  // Socket events
  useEffect(() => {
    if (!token) return;
    socketService.connect(token);
    socketService.on('new_message', (data: any) => {
      const msg = data.message || data;
      addMessage(msg);
      // update chat preview
      setChats(chats.map(c => c.id === msg.chatId ? { ...c, lastMessage: msg.text || '📎', lastMessageTime: msg.createdAt, unreadCount: activeChatId === msg.chatId ? 0 : (c.unreadCount || 0) + 1 } : c));
    });
    socketService.on('message_updated', (data: any) => updateMessage(data.message || data));
    socketService.on('message_deleted', (data: any) => deleteMessage(data.messageId, data.chatId));
    socketService.on('typing_start', (data: any) => setTyping(data.chatId, data.userId, true));
    socketService.on('typing_stop', (data: any) => setTyping(data.chatId, data.userId, false));
    return () => {
      socketService.off('new_message'); socketService.off('message_updated');
      socketService.off('message_deleted'); socketService.off('typing_start'); socketService.off('typing_stop');
    };
  }, [token, activeChatId, chats]);

  // Load chats
  useEffect(() => {
    if (token) api.get('/chats').then(r => setChats(r.data.data || r.data || [])).catch(() => {});
  }, [token]);

  const handleLogout = useCallback(() => {
    logout(); socketService.disconnect(); navigate('/auth');
  }, [logout, navigate]);

  const handleOpenProfile = useCallback((uid: string) => {
    setProfileUserId(uid); setShowProfile(true);
  }, []);

  const handleStartChatWithUser = useCallback(async (userId: string) => {
    try {
      const res = await api.post('/chats', { userId });
      const chat = res.data.data || res.data;
      setChats([chat, ...chats.filter(c => c.id !== chat.id)]);
      setActiveChatId(chat.id);
      setActiveTab('chats');
    } catch { alert('Не удалось открыть чат'); }
  }, [chats, setChats]);

  const unreadTotal = chats.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);

  const renderContent = () => {
    if (activeChatId) {
      return (
        <ChatView
          chatId={activeChatId}
          onBack={() => setActiveChatId(null)}
          onProfileClick={handleOpenProfile}
        />
      );
    }
    switch (activeTab) {
      case 'chats': return <ChatsList chats={chats} onChatClick={setActiveChatId} />;
      case 'contacts': return <ContactsView onProfileClick={handleOpenProfile} onStartChat={handleStartChatWithUser} />;
      case 'calls': return <CallsView />;
      case 'channels': return <ChannelsView />;
      case 'stories': return <StoriesPanel />;
      case 'ai': return <AIAssistantPanel />;
      case 'market': return <MarketPanel />;
      case 'premium': return <PremiumPanel />;
      case 'stars': return <StarsPanel />;
      case 'search': return <SearchPanel />;
      case 'settings': return <SettingsPanelFull onLogout={handleLogout} />;
      default: return <ChatsList chats={chats} onChatClick={setActiveChatId} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--color-bg)', overflow: 'hidden', position: 'relative' }}>
      {/* Desktop sidebar */}
      <div style={{ display: 'none' }} className="lg-sidebar">
        <DesktopSidebar chats={chats} activeTab={activeTab} onTabChange={t => { setActiveTab(t); setActiveChatId(null); }}
          activeChatId={activeChatId} onChatClick={setActiveChatId} user={user} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {renderContent()}
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(t: string) => { setActiveTab(t); setActiveChatId(null); }}
        unreadCount={unreadTotal}
        show={!activeChatId}
      />

      {/* Profile Modal */}
      {showProfile && profileUserId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowProfile(false)}>
          <div style={{ width: '100%', maxHeight: '94vh', background: 'var(--color-bg)', borderRadius: '24px 24px 0 0', overflow: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: 'var(--color-divider)', borderRadius: 99, margin: '10px auto 0' }} />
            <ProfileView
              userId={profileUserId}
              onClose={() => setShowProfile(false)}
              isSelf={user?.id === profileUserId}
              onOpenChat={(chatId) => { setActiveChatId(chatId); setShowProfile(false); }}
            />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { display: flex !important; }
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
