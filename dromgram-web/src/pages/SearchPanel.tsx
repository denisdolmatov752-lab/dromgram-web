import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

interface SearchUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface SearchChat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
}

interface SearchMessage {
  id: string;
  text: string;
  chatId: string;
  chatName: string;
  senderAvatar: string;
  timestamp: string;
}

interface SearchChannel {
  id: string;
  name: string;
  avatar: string;
  subscribers: number;
}

interface SearchResults {
  users: SearchUser[];
  chats: SearchChat[];
  messages: SearchMessage[];
  channels: SearchChannel[];
}

export default function SearchPanel() {
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    users: [],
    chats: [],
    messages: [],
    channels: [],
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'users' | 'messages' | 'channels'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Auto-focus search input
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length === 0) {
      setResults({ users: [], chats: [], messages: [], channels: [] });
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await api.get('/search', {
        params: { q: searchQuery },
      });

      const data: SearchResults = response.data;
      setResults(data);

      // Save to recent searches
      if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
        const updated = [searchQuery, ...recentSearches].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Search error:', err);
      setResults({ users: [], chats: [], messages: [], channels: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleRecentSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const filteredResults = {
    users: filter === 'all' || filter === 'users' ? results.users : [],
    chats: filter === 'all' ? results.chats : [],
    messages: filter === 'all' || filter === 'messages' ? results.messages : [],
    channels: filter === 'all' || filter === 'channels' ? results.channels : [],
  };

  const hasResults =
    filteredResults.users.length > 0 ||
    filteredResults.chats.length > 0 ||
    filteredResults.messages.length > 0 ||
    filteredResults.channels.length > 0;

  return (
    <div className="panel-container bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col h-full">
      {/* Header with Search Input */}
      <div className="glass-header sticky top-0 z-40 p-4 space-y-3">
        <h1 className="text-xl font-bold text-white">Поиск</h1>
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск людей, сообщений, каналов..."
          className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 ring-blue-500 transition-all text-sm"
        />
      </div>

      {/* Filter Buttons */}
      {query.trim().length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'Всё' },
            { id: 'users', label: 'Люди' },
            { id: 'messages', label: 'Сообщения' },
            { id: 'channels', label: 'Каналы' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f.id
                  ? 'btn-primary'
                  : 'glass glass-sm hover:bg-white/10 text-white/70'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Loading State */}
        {loading && (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass glass-sm p-3 rounded-lg animate-pulse flex gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-white/10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-24"></div>
                  <div className="h-2 bg-white/10 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Searches */}
        {!query.trim() && recentSearches.length > 0 && !loading && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white/70 font-semibold text-sm">Недавние поиски</h2>
              <button
                onClick={handleClearRecent}
                className="text-white/50 hover:text-white/70 transition-colors text-xs"
              >
                Очистить
              </button>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentSearch(search)}
                  className="w-full glass glass-sm p-3 rounded-lg text-left text-white hover:bg-white/10 transition-colors flex items-center justify-between group"
                >
                  <span className="text-sm">🕐 {search}</span>
                  <span className="text-white/40 group-hover:text-white/60 transition-colors">
                    ↗️
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {query.trim() && !loading && (
          <div className="p-4 space-y-4">
            {!hasResults ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-white/50 text-sm">
                  Ничего не найдено по запросу "{query}"
                </p>
              </div>
            ) : (
              <>
                {/* Users Section */}
                {filteredResults.users.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-white/70 font-semibold text-xs uppercase">
                      Люди ({filteredResults.users.length})
                    </h3>
                    <div className="space-y-2">
                      {filteredResults.users.map((user) => (
                        <SearchResultItem
                          key={user.id}
                          icon={<img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />}
                          title={user.name}
                          subtitle={`@${user.username}`}
                          onClick={() => {
                            // Navigate to user profile
                            window.location.href = `/profile/${user.id}`;
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Chats Section */}
                {filteredResults.chats.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-white/70 font-semibold text-xs uppercase">
                      Чаты ({filteredResults.chats.length})
                    </h3>
                    <div className="space-y-2">
                      {filteredResults.chats.map((chat) => (
                        <SearchResultItem
                          key={chat.id}
                          icon={<img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full" />}
                          title={chat.name}
                          subtitle={chat.lastMessage}
                          onClick={() => {
                            // Navigate to chat
                            window.location.href = `/chat/${chat.id}`;
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages Section */}
                {filteredResults.messages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-white/70 font-semibold text-xs uppercase">
                      Сообщения ({filteredResults.messages.length})
                    </h3>
                    <div className="space-y-2">
                      {filteredResults.messages.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => {
                            window.location.href = `/chat/${msg.chatId}`;
                          }}
                          className="glass glass-sm p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={msg.senderAvatar}
                              alt={msg.chatName}
                              className="w-10 h-10 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold">
                                {msg.chatName}
                              </p>
                              <p className="text-white/60 text-xs truncate">
                                {highlightQuery(msg.text, query)}
                              </p>
                              <p className="text-white/40 text-xs mt-1">
                                {getTimeAgo(msg.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Channels Section */}
                {filteredResults.channels.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-white/70 font-semibold text-xs uppercase">
                      Каналы ({filteredResults.channels.length})
                    </h3>
                    <div className="space-y-2">
                      {filteredResults.channels.map((channel) => (
                        <SearchResultItem
                          key={channel.id}
                          icon={<img src={channel.avatar} alt={channel.name} className="w-10 h-10 rounded-full" />}
                          title={channel.name}
                          subtitle={`${channel.subscribers} подписчиков`}
                          onClick={() => {
                            // Navigate to channel
                            window.location.href = `/channel/${channel.id}`;
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface SearchResultItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

function SearchResultItem({ icon, title, subtitle, onClick }: SearchResultItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full glass glass-sm p-3 rounded-lg hover:bg-white/10 transition-colors text-left flex items-center gap-3"
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{title}</p>
        <p className="text-white/60 text-xs truncate">{subtitle}</p>
      </div>
      <span className="text-white/30">→</span>
    </button>
  );
}

function highlightQuery(text: string, query: string): string {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, (match) => `***${match}***`);
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins}м назад`;
  if (diffHours < 24) return `${diffHours}ч назад`;
  if (diffDays < 7) return `${diffDays}д назад`;
  return date.toLocaleDateString('ru-RU');
}
