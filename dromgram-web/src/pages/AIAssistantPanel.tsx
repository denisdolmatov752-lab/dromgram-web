import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const QUICK_PROMPTS = [
  { icon: '✍️', text: 'Помоги написать сообщение' },
  { icon: '🌐', text: 'Переведи на английский' },
  { icon: '💡', text: 'Придумай идею для чата' },
  { icon: '📝', text: 'Объясни что-то сложное' },
  { icon: '😄', text: 'Расскажи анекдот' },
  { icon: '🔍', text: 'Помоги с поиском информации' },
];

interface ImageAttachment {
  dataUrl: string;  // base64 data URL
  mimeType: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  error?: boolean;
  image?: ImageAttachment;
}

// Convert messages to OpenRouter-compatible content format
function buildPayloadMessages(history: AIMessage[]) {
  return history.map(m => {
    if (m.image && m.role === 'user') {
      return {
        role: m.role,
        content: [
          {
            type: 'image_url',
            image_url: { url: m.image.dataUrl },
          },
          { type: 'text', text: m.content || 'Что на этом фото?' },
        ],
      };
    }
    return { role: m.role, content: m.content };
  });
}

async function sendToAI(
  history: AIMessage[],
  userText: string,
  image?: ImageAttachment
): Promise<string> {
  const userEntry: AIMessage = {
    id: 'tmp',
    role: 'user',
    content: userText,
    timestamp: new Date(),
    image,
  };

  const payload = buildPayloadMessages([...history, userEntry]);

  const response = await api.post('/ai/chat', { messages: payload });

  if (!response.data?.success) {
    throw new Error(response.data?.error || 'AI error');
  }
  return response.data.data.content as string;
}

function fileToDataUrl(file: File): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ dataUrl: reader.result as string, mimeType: file.type });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AIAssistantPanel() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<ImageAttachment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && !pendingImage) || loading) return;

    const image = pendingImage ?? undefined;
    const displayText = text || (image ? 'Что на этом фото?' : '');

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: displayText,
      timestamp: new Date(),
      image,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPendingImage(null);
    setLoading(true);

    try {
      const reply = await sendToAI(messages, displayText, image);
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
        content: '❌ Ошибка при обращении к AI. Попробуйте снова.',
        timestamp: new Date(),
        error: true,
      };
      setMessages(prev => [...prev, errorMsg]);
      console.error('AI error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = '';

    // Limit to 4MB for base64 safety
    if (file.size > 4 * 1024 * 1024) {
      alert('Фото слишком большое (макс. 4 МБ)');
      return;
    }

    try {
      const { dataUrl, mimeType } = await fileToDataUrl(file);
      setPendingImage({ dataUrl, mimeType });
      inputRef.current?.focus();
    } catch {
      alert('Не удалось загрузить изображение');
    }
  };

  const clearHistory = () => setMessages([]);

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
            Powered by Gemini 2.0 Flash · анализ фото ✓
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="glass-btn p-2 rounded-xl flex-shrink-0 hover:bg-white/10 transition-colors"
            title="Очистить историю"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                animation: 'float 3s ease-in-out infinite',
              }}
            >
              ✦
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">DRomGram AI</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Ваш умный помощник. Спросите что угодно или отправьте фото!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.text}
                  onClick={() => { setInput(p.text); inputRef.current?.focus(); }}
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
                  {msg.image && (
                    <img
                      src={msg.image.dataUrl}
                      alt="Прикреплённое фото"
                      className="rounded-xl mb-2 max-w-full max-h-60 object-cover"
                      style={{ display: 'block' }}
                    />
                  )}
                  {msg.content && (
                    <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                  )}
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
                    {[0, 0.2, 0.4].map(delay => (
                      <div
                        key={delay}
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Pending image preview */}
      {pendingImage && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <div className="relative inline-block">
            <img
              src={pendingImage.dataUrl}
              alt="Предпросмотр"
              className="h-16 w-16 object-cover rounded-xl border border-white/20"
            />
            <button
              onClick={() => setPendingImage(null)}
              className="absolute -top-1 -right-1 bg-slate-700 hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
              title="Удалить фото"
            >
              ✕
            </button>
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Фото прикреплено. Напишите вопрос или отправьте сразу.
          </span>
        </div>
      )}

      {/* Input Bar */}
      <div className="glass-header px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Photo button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="glass-btn w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition-colors"
            title="Прикрепить фото для анализа"
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />

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
              placeholder={pendingImage ? 'Что хотите узнать о фото?' : 'Спросите что угодно...'}
              className="flex-1 bg-transparent resize-none outline-none text-sm"
              rows={1}
              style={{ maxHeight: 120, overflowY: 'auto' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={(!input.trim() && !pendingImage) || loading}
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
