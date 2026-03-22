import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  image: string;
  text?: string;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  hasViewed: boolean;
}

interface Viewer {
  userId: string;
  userName: string;
  avatar: string;
  viewedAt: string;
}

export default function StoriesPanel() {
  const { user } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [myStory, setMyStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [showViewersList, setShowViewersList] = useState(false);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stories');
      setStories(response.data.stories || []);
      setMyStory(response.data.myStory || null);
    } catch (err) {
      setError('Ошибка загрузки историй');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    setSelectedStoryIndex(0);
    markStoryViewed(storyId);
    setShowViewerModal(true);
  };

  const markStoryViewed = async (storyId: string) => {
    try {
      await api.post(`/stories/${storyId}/view`);
    } catch (err) {
      console.error('Failed to mark story as viewed:', err);
    }
  };

  const fetchViewers = async (storyId: string) => {
    try {
      const response = await api.get(`/stories/${storyId}/viewers`);
      setViewers(response.data.viewers || []);
      setShowViewersList(true);
    } catch (err) {
      console.error('Failed to fetch viewers:', err);
    }
  };

  if (loading) {
    return (
      <div className="panel-container flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const storyList = selectedStoryId 
    ? [stories.find(s => s.id === selectedStoryId)].filter(Boolean) as Story[]
    : [];
  const currentStory = storyList[selectedStoryIndex];

  return (
    <div className="panel-container bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <div className="glass-header sticky top-0 z-40 flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-white">Истории</h1>
        <button
          onClick={() => setShowAddStoryModal(true)}
          className="glass-btn rounded-full p-2 hover:bg-white/20 transition-colors"
          title="Добавить историю"
        >
          📷
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6 p-4">
        {/* My Story Section */}
        <div>
          <h2 className="text-sm font-semibold text-white/70 mb-3">Моя история</h2>
          <div
            className="glass glass-sm relative w-full h-32 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-blue-500/50 transition-all group"
            onClick={() => !myStory && setShowAddStoryModal(true)}
          >
            {myStory ? (
              <>
                <img
                  src={myStory.image}
                  alt="My story"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-between p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={myStory.userAvatar}
                        alt={myStory.userName}
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                      <span className="text-white text-sm font-semibold">{myStory.userName}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchViewers(myStory.id);
                      }}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      👁️ {myStory.viewCount}
                    </button>
                  </div>
                  <div className="text-white/70 text-xs">
                    {getTimeAgo(myStory.createdAt)}
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-purple-500/30 group-hover:from-blue-500/50 group-hover:to-purple-500/50 transition-all">
                <div className="text-4xl">+</div>
              </div>
            )}
          </div>
        </div>

        {/* Stories Grid */}
        <div>
          <h2 className="text-sm font-semibold text-white/70 mb-3">Истории друзей</h2>
          {stories.length === 0 ? (
            <div className="glass glass-sm p-8 text-center text-white/50 rounded-lg">
              Пока нет историй
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stories.map((story, idx) => (
                <div
                  key={story.id}
                  className="cursor-pointer group"
                  onClick={() => handleAddStory(story.id)}
                >
                  <div
                    className={`relative w-full aspect-square rounded-lg overflow-hidden ring-2 transition-all ${
                      story.hasViewed
                        ? 'ring-slate-500/50'
                        : 'ring-blue-500 group-hover:ring-blue-400'
                    }`}
                  >
                    <img
                      src={story.image}
                      alt={story.userName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute top-2 left-2">
                      <img
                        src={story.userAvatar}
                        alt={story.userName}
                        className={`w-8 h-8 rounded-full border-2 ${
                          story.hasViewed ? 'border-slate-400' : 'border-blue-400'
                        }`}
                      />
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-semibold truncate">
                        {story.userName}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-white/60 text-xs text-center">
                    {getTimeAgo(story.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {showViewerModal && currentStory && (
        <StoryViewerModal
          story={currentStory}
          stories={storyList}
          currentIndex={selectedStoryIndex}
          onClose={() => setShowViewerModal(false)}
          onNext={() => {
            if (selectedStoryIndex < storyList.length - 1) {
              setSelectedStoryIndex(selectedStoryIndex + 1);
              markStoryViewed(storyList[selectedStoryIndex + 1].id);
            } else {
              setShowViewerModal(false);
            }
          }}
          onPrev={() => {
            if (selectedStoryIndex > 0) {
              setSelectedStoryIndex(selectedStoryIndex - 1);
            }
          }}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          onViewers={() => fetchViewers(currentStory.id)}
        />
      )}

      {/* Add Story Modal */}
      {showAddStoryModal && (
        <AddStoryModal
          onClose={() => setShowAddStoryModal(false)}
          onStoryAdded={() => {
            setShowAddStoryModal(false);
            fetchStories();
          }}
        />
      )}

      {/* Viewers List Modal */}
      {showViewersList && (
        <ViewersListModal
          viewers={viewers}
          onClose={() => setShowViewersList(false)}
        />
      )}
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins}м`;
  if (diffHours < 24) return `${diffHours}ч`;
  if (diffDays < 7) return `${diffDays}д`;
  return date.toLocaleDateString('ru-RU');
}

interface StoryViewerModalProps {
  story: Story;
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  onViewers: () => void;
}

function StoryViewerModal({
  story,
  stories,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  isPaused,
  setIsPaused,
  onViewers,
}: StoryViewerModalProps) {
  const [reaction, setReaction] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setTimeout(() => {
      onNext();
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPaused, onNext]);

  const handleReact = async (emoji: string) => {
    try {
      setReaction(emoji);
      await api.post(`/stories/${story.id}/react`, { emoji });
      setTimeout(() => setReaction(null), 1500);
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await api.post(`/stories/${story.id}/reply`, { text: replyText });
      setReplyText('');
      setShowReplyInput(false);
    } catch (err) {
      console.error('Failed to send reply:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress Bar */}
      <div className="flex gap-1 p-2 bg-black/50">
        {stories.map((_, idx) => (
          <div
            key={idx}
            className={`flex-1 h-1 rounded-full transition-all ${
              idx < currentIndex
                ? 'bg-white'
                : idx === currentIndex
                  ? 'bg-white/80'
                  : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <img
          src={story.image}
          alt="Story"
          className="w-full h-full object-cover"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        />

        {/* Text Overlay */}
        {story.text && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white text-2xl font-bold text-center drop-shadow-lg px-4">
              {story.text}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <img
              src={story.userAvatar}
              alt={story.userName}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div className="text-white">
              <p className="font-semibold text-sm">{story.userName}</p>
              <p className="text-xs text-white/60">{getTimeAgo(story.createdAt)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white text-2xl hover:text-white/80 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Reaction */}
        {reaction && (
          <div className="absolute bottom-20 right-4 text-4xl animate-bounce">
            {reaction}
          </div>
        )}

        {/* Navigation & Actions */}
        <div className="absolute inset-y-0 left-0 flex items-center justify-start p-4 pointer-events-none">
          <button
            onClick={onPrev}
            className="pointer-events-auto px-4 py-8 text-white/50 hover:text-white transition-colors"
          >
            ←
          </button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center justify-end p-4 pointer-events-none">
          <button
            onClick={onNext}
            className="pointer-events-auto px-4 py-8 text-white/50 hover:text-white transition-colors"
          >
            →
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
          <button
            onClick={() => handleReact('❤️')}
            className="text-2xl hover:scale-125 transition-transform"
          >
            ❤️
          </button>
          <button
            onClick={() => {}}
            className="text-white/70 hover:text-white transition-colors text-sm"
          >
            👁️ {story.viewCount}
          </button>
        </div>
      </div>

      {/* Reply Input */}
      {showReplyInput && (
        <div className="bg-black/80 backdrop-blur p-4 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Ответить на историю..."
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 ring-blue-500"
            autoFocus
          />
          <button
            onClick={handleReply}
            className="btn-primary px-4 py-2 rounded-full"
          >
            Отправить
          </button>
        </div>
      )}

      {!showReplyInput && (
        <button
          onClick={() => setShowReplyInput(true)}
          className="bg-black/80 backdrop-blur p-4 w-full text-left text-white/50 hover:text-white transition-colors"
        >
          Ответить на историю...
        </button>
      )}
    </div>
  );
}

interface AddStoryModalProps {
  onClose: () => void;
  onStoryAdded: () => void;
}

function AddStoryModal({ onClose, onStoryAdded }: AddStoryModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [audience, setAudience] = useState<'all' | 'contacts'>('all');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!image) return;

    try {
      setUploading(true);
      const formData = new FormData();
      const blob = await fetch(image).then((r) => r.blob());
      formData.append('image', blob);
      formData.append('text', text);
      formData.append('audience', audience);

      await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onStoryAdded();
    } catch (err) {
      console.error('Failed to post story:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="glass glass-strong rounded-lg w-full max-w-md max-h-96 overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white font-semibold">Добавить историю</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1">
          {/* Image Preview */}
          {image ? (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden">
              <img src={image} alt="Story preview" className="w-full h-full object-cover" />
              <button
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="glass glass-sm w-full aspect-square rounded-lg flex items-center justify-center text-4xl hover:bg-white/10 transition-colors"
            >
              📸
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Text Overlay Input */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Добавить текст к истории (опционально)..."
            maxLength={200}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 ring-blue-500 resize-none"
            rows={3}
          />

          {/* Audience Selector */}
          <div className="space-y-2">
            <label className="block text-white/70 text-sm font-semibold">
              Видят историю
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setAudience('all')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  audience === 'all'
                    ? 'btn-primary'
                    : 'glass glass-sm hover:bg-white/10'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setAudience('contacts')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  audience === 'contacts'
                    ? 'btn-primary'
                    : 'glass glass-sm hover:bg-white/10'
                }`}
              >
                Контакты
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-4 flex gap-2">
          <button
            onClick={onClose}
            className="glass glass-sm flex-1 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handlePost}
            disabled={!image || uploading}
            className="btn-primary flex-1 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? '⏳ Загрузка...' : 'Опубликовать'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ViewersListModalProps {
  viewers: Viewer[];
  onClose: () => void;
}

function ViewersListModal({ viewers, onClose }: ViewersListModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-end">
      <div className="glass glass-strong rounded-t-2xl w-full max-h-96 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white font-semibold">
            Просмотры ({viewers.length})
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {viewers.length === 0 ? (
            <div className="p-4 text-center text-white/50">
              Никто ещё не просмотрел
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {viewers.map((viewer) => (
                <div
                  key={viewer.userId}
                  className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                  <img
                    src={viewer.avatar}
                    alt={viewer.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold">{viewer.userName}</p>
                    <p className="text-white/50 text-xs">
                      {getTimeAgo(viewer.viewedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
