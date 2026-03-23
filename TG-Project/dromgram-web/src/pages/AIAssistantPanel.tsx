import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  error?: boolean;
}

const QUICK_PROMPTS = [
  { icon: '✍️', text: 'Помоги написать сообщение' },
  { icon: '🌐', text: 'Переведи на английский' },
  { icon: '💡', text: 'Придумай идею для чата' },
  { icon: '📝', text: 'Объясни что-то сложное' },
  { icon: '😄', text: 'Расскажи анекдот' },
  { icon: '🔍', text: 'Помоги с поиском информации' },
];

async function sendToAI(history: AIMessage[], userMsg: string): Promise<string> {
  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: userMsg },
  ];
  const res = await api.post('/ai/chat', { messages });
  if (!res.data.success) throw new Error(res.data.error || 'AI error');
  return res.data.data.content;
}

export default function AIAssistantPanel() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendToAI([...messages, userMsg], msg);
      const aiMsg: AIMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: err?.response?.data?.error === 'AI service not configured'
          ? 'AI сервис временно недоступен. Обратитесь к администратору.'
          : 'Ошибка соединения с AI. Проверьте интернет и повторите.',
        timestamp: new Date(),
        error: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => setMessages([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="glass-header" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 18, fontWeight: 700,
          boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
        }}>✦</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 15 }}>DRomGram AI</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Gemini 2.0 Flash</div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory} title="Очистить историю"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 12 }}>
            Очистить
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 8 }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 24, padding: '0 16px' }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, color: '#fff',
              boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
              animation: 'float 3s ease-in-out infinite',
            }}>✦</div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>DRomGram AI</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Ваш умный помощник. Спросите что угодно!</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 340 }}>
              {QUICK_PROMPTS.map(p => (
                <button key={p.text} onClick={() => handleSend(p.text)}
                  className="glass-btn"
                  style={{ padding: '12px', textAlign: 'left', cursor: 'pointer', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--color-text)' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{p.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>{p.text}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginRight: 8, alignSelf: 'flex-end',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12,
                  }}>✦</div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #2AABEE, #1A8AC4)'
                    : msg.error
                    ? 'rgba(255,59,48,0.15)'
                    : 'var(--glass-bg-strong)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                  boxShadow: msg.role === 'user' ? '0 4px 12px rgba(42,171,238,0.3)' : 'var(--glass-shadow-sm)',
                  color: msg.role === 'user' ? '#fff' : msg.error ? '#FF3B30' : 'var(--color-text)',
                }}>
                  <p style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{msg.content}</p>
                  <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7, textAlign: 'right' }}>{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12,
                }}>✦</div>
                <div style={{
                  padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
                  background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)',
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%', background: '#8b5cf6',
                      animation: 'typing-dot 1.4s infinite', animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="glass-header" style={{ padding: '12px 16px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'flex-end', gap: 8,
            background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)',
            borderRadius: 20, padding: '10px 14px',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="Спросите что угодно..."
              rows={1}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--color-text)', fontSize: 14, resize: 'none', lineHeight: 1.5,
                minHeight: 22, maxHeight: 120, overflow: 'auto',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="btn-primary"
            style={{
              width: 42, height: 42, borderRadius: '50%', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              flexShrink: 0, opacity: input.trim() && !loading ? 1 : 0.5,
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M2 21L23 12 2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes typing-dot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
