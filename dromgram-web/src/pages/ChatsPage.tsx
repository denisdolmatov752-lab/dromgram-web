import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatsStore } from '../store/chatsStore';
import { socketService } from '../socket/socket';
import api from '../api/axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

function Avatar({ url, name, color = '#2AABEE', size = 46, online = false }: any) {
  const initials = name ? name.split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2) : '?';
  const parseColor = (c: string) => c || '#2AABEE';
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {url ? <img src={url} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }}/>
        : <div className="rounded-full flex items-center justify-center text-white font-semibold" style={{ width: size, height: size, background: parseColor(color), fontSize: size * 0.38 }}>{initials}</div>}
      {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-[#17212B]"/>}
    </div>
  );
}

function MessageBubble({ msg, isMe, dark }: any) {
  const bg = isMe ? (dark ? '#2B5278' : '#EFFFDE') : (dark ? '#1E2C3A' : '#FFFFFF');
  const time = msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : '';
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className="bubble-in max-w-xs lg:max-w-sm px-3 py-2 rounded-2xl shadow-sm" style={{
        background: bg,
        borderBottomRightRadius: isMe ? 4 : undefined,
        borderBottomLeftRadius: isMe ? undefined : 4,
      }}>
        {msg.replyTo && <div className="mb-1 px-2 py-1 rounded-lg border-l-2 border-primary opacity-70 text-xs">{msg.replyTo.text || 'Сообщение'}</div>}
        {msg.type === 'TEXT' && <p className="text-sm leading-relaxed break-words" style={{ color: dark ? '#fff' : '#000' }}>{msg.text}</p>}
        {msg.type === 'PHOTO' && msg.mediaUrl && <img src={msg.mediaUrl} alt="photo" className="rounded-xl max-w-full cursor-pointer" onClick={() => window.open(msg.mediaUrl)}/>}
        {msg.type === 'VOICE' && <div className="flex items-center gap-2"><span>🎤</span><span className="text-sm text-[#8D8D8D]">{msg.mediaDuration ? `${msg.mediaDuration}с` : 'Голосовое'}</span></div>}
        {msg.type === 'DOCUMENT' && <div className="flex items-center gap-2"><span>📎</span><span className="text-sm">{msg.fileName || 'Файл'}</span></div>}
        {msg.type === 'STICKER' && <div className="text-6xl">{msg.text || '😀'}</div>}
        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          {msg.isEdited && <span className="text-xs text-[#8D8D8D]">ред.</span>}
          <span className="text-xs" style={{ color: isMe ? '#4FAB83' : '#8D8D8D' }}>{time}</span>
          {isMe && <span className="text-xs" style={{ color: msg.status === 'READ' ? '#2AABEE' : '#8D8D8D' }}>{msg.status === 'READ' ? '✓✓' : msg.status === 'DELIVERED' ? '✓✓' : '✓'}</span>}
        </div>
        {msg.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(msg.reactions.reduce((a: any, r: any) => { a[r.emoji] = (a[r.emoji] || 0) + 1; return a; }, {})).map(([emoji, count]) => (
              <span key={emoji} className="text-xs bg-[#F0F2F5] dark:bg-[#232E3C] rounded-full px-2 py-0.5">{emoji} {count as number}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="flex gap-1">
        {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-[#8D8D8D] rounded-full typing-dot" style={{ animationDelay: `${i*0.2}s` }}/>)}
      </div>
      <span className="text-xs text-[#8D8D8D]">печатает...</span>
    </div>
  );
}

export default function ChatsPage() {
  const { user, logout } = useAuthStore();
  const { chats, setChats, activeChat, setActiveChat, messages, setMessages, addMessage, typingUsers } = useChatsStore();
  const [inputText, setInputText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyTo, setReplyTo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dark = document.documentElement.classList.contains('dark');

  useEffect(() => { loadChats(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat?.id]);

  const loadChats = async () => {
    try {
      const res = await api.get('/chats');
      setChats(res.data.data || []);
    } catch {} finally { setLoadingChats(false); }
  };

  const openChat = async (chat: any) => {
    setActiveChat(chat);
    setLoadingMsgs(true);
    socketService.joinChat(chat.id);
    try {
      const res = await api.get(`/messages/${chat.id}`);
      setMessages(chat.id, res.data.data || []);
    } catch {} finally { setLoadingMsgs(false); }
    socketService.off('new_message');
    socketService.on('new_message', ({ message }: any) => {
      addMessage(message);
      if (message.senderId !== user?.id) socketService.markRead(message.id, chat.id);
    });
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !activeChat) return;
    setInputText('');
    socketService.stopTyping(activeChat.id);
    try {
      const res = await api.post('/messages', { chatId: activeChat.id, type: 'TEXT', text, ...(replyTo ? { replyToId: replyTo.id } : {}) });
      addMessage(res.data.data);
      setReplyTo(null);
    } catch {}
  };

  const handleTyping = (val: string) => {
    setInputText(val);
    if (!activeChat) return;
    if (val) socketService.startTyping(activeChat.id);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => socketService.stopTyping(activeChat.id), 3000);
  };

  const getChatName = (chat: any) => {
    if (chat.type === 'PRIVATE') {
      const other = chat.members?.find((m: any) => m.userId !== user?.id);
      if (other?.user) return `${other.user.firstName}${other.user.lastName ? ' ' + other.user.lastName : ''}`;
    }
    return chat.name || 'Чат';
  };

  const getLastMessage = (chat: any) => {
    const msgs = chat.messages || [];
    if (!msgs.length) return '';
    const m = msgs[0];
    if (m.type === 'TEXT') return m.text || '';
    if (m.type === 'PHOTO') return '📷 Фото';
    if (m.type === 'VOICE') return '🎤 Голосовое';
    if (m.type === 'DOCUMENT') return `📎 ${m.fileName || 'Файл'}`;
    return '';
  };

  const filteredChats = chats.filter(c => getChatName(c).toLowerCase().includes(searchTerm.toLowerCase()));
  const chatMessages = activeChat ? (messages[activeChat.id] || []) : [];
  const typingInChat = activeChat ? (typingUsers[activeChat.id] || []).filter(id => id !== user?.id) : [];

  return (
    <div className="flex h-screen bg-[var(--color-bg)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-[var(--color-divider)] flex flex-col bg-[var(--color-nav-bg)]">
        <div className="px-4 py-3 border-b border-[var(--color-divider)]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-primary">DRomGram</h1>
            <button onClick={logout} className="text-[#8D8D8D] hover:text-red-500 text-sm">Выйти</button>
          </div>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Поиск..."
            className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#8D8D8D]">
              <span className="text-4xl mb-2">💬</span>
              <p>Нет чатов</p>
            </div>
          ) : filteredChats.map(chat => {
            const name = getChatName(chat);
            const preview = getLastMessage(chat);
            const isActive = activeChat?.id === chat.id;
            const time = chat.messages?.[0]?.createdAt ? format(new Date(chat.messages[0].createdAt), 'HH:mm') : '';
            return (
              <div key={chat.id} onClick={() => openChat(chat)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors ${isActive ? 'bg-[#E8F4FD] dark:bg-[#1E2C3A]' : ''}`}>
                <Avatar url={chat.avatarUrl} name={name} color={chat.avatarColor} size={46}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{name}</span>
                    <span className="text-xs text-[#8D8D8D] flex-shrink-0">{time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8D8D8D] truncate">{preview}</span>
                    {chat.unreadCount > 0 && (
                      <span className="ml-1 min-w-[20px] h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center px-1 flex-shrink-0">{chat.unreadCount > 9999 ? '9999+' : chat.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-divider)] bg-[var(--color-nav-bg)]">
              <Avatar url={activeChat.avatarUrl} name={getChatName(activeChat)} color={activeChat.avatarColor} size={40}/>
              <div className="flex-1">
                <h2 className="font-semibold">{getChatName(activeChat)}</h2>
                {typingInChat.length > 0 ? (
                  <p className="text-xs text-primary">печатает...</p>
                ) : (
                  <p className="text-xs text-[#8D8D8D]">онлайн</p>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] text-[#8D8D8D]">🔍</button>
                <button className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] text-[#8D8D8D]">📞</button>
                <button className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] text-[#8D8D8D]">⋮</button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-2" style={{ background: dark ? '#0F1923' : '#E3EDF7' }}>
              {loadingMsgs ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#8D8D8D]">
                  <span className="text-5xl mb-3">👋</span>
                  <p>Начните разговор!</p>
                </div>
              ) : (
                <>
                  {chatMessages.map(msg => (
                    <MessageBubble key={msg.id} msg={msg} isMe={msg.senderId === user?.id} dark={dark}/>
                  ))}
                  {typingInChat.length > 0 && <TypingIndicator/>}
                  <div ref={messagesEndRef}/>
                </>
              )}
            </div>

            {/* Reply Preview */}
            {replyTo && (
              <div className="flex items-center gap-3 px-4 py-2 border-t border-[var(--color-divider)] bg-[var(--color-nav-bg)]">
                <div className="w-1 h-8 bg-primary rounded"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary">Ответить</p>
                  <p className="text-xs text-[#8D8D8D] truncate">{replyTo.text}</p>
                </div>
                <button onClick={() => setReplyTo(null)} className="text-[#8D8D8D] hover:text-red-500">✕</button>
              </div>
            )}

            {/* Input Bar */}
            <div className="flex items-end gap-2 px-4 py-3 border-t border-[var(--color-divider)] bg-[var(--color-nav-bg)]">
              <button className="p-2 text-[#8D8D8D] hover:text-primary">📎</button>
              <div className="flex-1 flex items-end bg-[var(--color-bg-secondary)] rounded-2xl px-3 py-2 gap-2">
                <button className="text-[#8D8D8D] hover:text-primary mb-0.5">😊</button>
                <textarea value={inputText} onChange={e => handleTyping(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Сообщение..." rows={1}
                  className="flex-1 bg-transparent resize-none focus:outline-none text-sm max-h-32 leading-6"
                  style={{ color: 'var(--color-text)' }}/>
              </div>
              <button onClick={sendMessage} disabled={!inputText.trim()}
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:bg-primary-dark transition-colors flex-shrink-0">
                {inputText.trim() ? '➤' : '🎤'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#8D8D8D]">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-5xl font-black text-primary">D</span>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-2">DRomGram</h2>
            <p className="text-sm">Выберите чат для начала общения</p>
          </div>
        )}
      </div>
    </div>
  );
}
