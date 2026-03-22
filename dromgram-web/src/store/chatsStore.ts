import { create } from 'zustand';

interface Message {
  id: string; chatId: string; senderId: string; sender?: any;
  type: string; text?: string; mediaUrl?: string; status: string;
  replyTo?: any; reactions: any[]; readByIds: string[];
  isEdited: boolean; createdAt: string;
}

interface Chat {
  id: string; type: string; name?: string; avatarUrl?: string;
  avatarColor?: string; members: any[]; messages: Message[];
  unreadCount: number; isMuted: boolean; isPinned: boolean; member?: any;
}

interface ChatsState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chat: Chat | null) => void;
  addMessage: (msg: Message) => void;
  updateMessage: (msg: Message) => void;
  deleteMessage: (msgId: string, chatId: string) => void;
  setMessages: (chatId: string, msgs: Message[]) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  incrementUnread: (chatId: string) => void;
  clearUnread: (chatId: string) => void;
}

export const useChatsStore = create<ChatsState>((set, get) => ({
  chats: [], activeChat: null, messages: {}, typingUsers: {},
  setChats: (chats) => set({ chats }),
  setActiveChat: (chat) => set({ activeChat: chat }),
  addMessage: (msg) => set((s) => ({
    messages: { ...s.messages, [msg.chatId]: [...(s.messages[msg.chatId] || []), msg] },
    chats: s.chats.map(c => c.id === msg.chatId ? { ...c, messages: [msg], updatedAt: msg.createdAt } : c)
  })),
  updateMessage: (msg) => set((s) => ({
    messages: { ...s.messages, [msg.chatId]: (s.messages[msg.chatId] || []).map(m => m.id === msg.id ? msg : m) }
  })),
  deleteMessage: (msgId, chatId) => set((s) => ({
    messages: { ...s.messages, [chatId]: (s.messages[chatId] || []).filter(m => m.id !== msgId) }
  })),
  setMessages: (chatId, msgs) => set((s) => ({ messages: { ...s.messages, [chatId]: msgs } })),
  setTyping: (chatId, userId, isTyping) => set((s) => {
    const current = s.typingUsers[chatId] || [];
    const updated = isTyping ? [...new Set([...current, userId])] : current.filter(id => id !== userId);
    return { typingUsers: { ...s.typingUsers, [chatId]: updated } };
  }),
  incrementUnread: (chatId) => set((s) => ({ chats: s.chats.map(c => c.id === chatId ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c) })),
  clearUnread: (chatId) => set((s) => ({ chats: s.chats.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c) })),
}));
