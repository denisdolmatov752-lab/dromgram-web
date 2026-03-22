import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

const OPENROUTER_API_KEY = 'OPENROUTER_API_KEY_PLACEHOLDER';
const AI_MODEL = 'google/gemini-2.0-flash-001';
const SYSTEM_PROMPT = `Ты DRomGram AI — умный помощник встроенный в мессенджер DRomGram. Ты помогаешь пользователям, отвечаешь на вопросы, помогаешь составлять сообщения, переводишь текст и многое другое. Отвечай на русском языке, если пользователь пишет по-русски. Будь дружелюбным и полезным. Ты созданн командой DRomGram.`;

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
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://orproject.ru',
      'X-Title': 'DRomGram AI'
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMsg }
      ],
      max_tokens: 2048,
      temperature: 0.7
    })
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

export default function AIAssistantPanel() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendToAI([...messages, userMsg], input);
      const aiMsg: AIMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: AIMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Ошибка соединения с AI. Проверьте интернет.',
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <div className="glass-header flex items-center gap-3 px-4 py-3">
        <div
          className="rounded-full flex items-center justify-center text-white text-lg flex-shrink-0"
          style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}
        >
          ✦
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">DRomGram AI</div>
          <div className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
            Powered by Gemini 2.0 Flash
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="glass-btn p-2 rounded-xl flex-shrink-0 hover:bg-white/10 transition-colors"
            title="Очистить историю"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3,6 5,6 21,6" />
              <path d="M19,6l-1,14H6L5,6" />
              <path d="M10,11v6M14,11v6" />
              <path d="M9,6V4h6v2" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
            <div
              className="rounded-full flex items-center justify-center text-white text-5xl"
              style={{
                width: 100,
                height: 100,
                background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                animation: 'float 3s ease-in-out infinite'
              }}
            >
              ✦
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">DRomGram AI</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Ваш умный помощник. Спросите что угодно!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.text}
                  onClick={() => setInput(p.text)}
                  className="glass-btn p-3 rounded-2xl text-left hover:bg-white/10 transition-colors"
                >
                  <div className="text-xl mb-1">{p.icon}</div>
                  <div className="text-sm font-medium line-clamp-2">{p.text}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bubble-out bg-blue-600 text-white'
                      : msg.error
                      ? 'ai-bubble bg-red-900/20 text-red-400'
                      : 'ai-bubble bg-slate-800 text-white'
                  }`}
                >
                  <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                  <div className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="ai-bubble bg-slate-800 px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0s' }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Bar */}
      <div className="glass-header px-4 py-3">
        <div className="flex items-end gap-3">
          <div className="input-glass flex-1 flex items-end px-4 py-2 rounded-2xl">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Спросите что угодно..."
              className="flex-1 bg-transparent resize-none outline-none text-sm"
              rows={1}
              style={{ maxHeight: 120, overflowY: 'auto' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-primary w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
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
      `}</style>
    </div>
  );
}
