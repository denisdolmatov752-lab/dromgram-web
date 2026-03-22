import { io, Socket } from 'socket.io-client';
import { useChatsStore } from '../store/chatsStore';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;
    this.socket = io(import.meta.env.VITE_WS_URL || 'https://orproject.ru', {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;
    const store = useChatsStore.getState();

    this.socket.on('connect', () => console.log('Socket connected'));
    this.socket.on('disconnect', () => console.log('Socket disconnected'));

    this.socket.on('new_message', ({ message }: any) => {
      store.addMessage(message);
    });
    this.socket.on('message_updated', ({ message }: any) => {
      store.updateMessage(message);
    });
    this.socket.on('message_deleted', ({ messageId, chatId }: any) => {
      store.deleteMessage(messageId, chatId);
    });
    this.socket.on('typing_start', ({ chatId, userId }: any) => {
      store.setTyping(chatId, userId, true);
    });
    this.socket.on('typing_stop', ({ chatId, userId }: any) => {
      store.setTyping(chatId, userId, false);
    });
    this.socket.on('user_online', ({ userId }: any) => {
      // update user online status in store
    });
    this.socket.on('user_offline', ({ userId }: any) => {
      // update user offline status
    });
  }

  disconnect() { this.socket?.disconnect(); this.socket = null; }
  emit(event: string, data: any) { this.socket?.emit(event, data); }
  joinChat(chatId: string) { this.emit('join_chat', { chatId }); }
  leaveChat(chatId: string) { this.emit('leave_chat', { chatId }); }
  startTyping(chatId: string) { this.emit('typing_start', { chatId }); }
  stopTyping(chatId: string) { this.emit('typing_stop', { chatId }); }
  markRead(messageId: string, chatId: string) { this.emit('message_read', { messageId, chatId }); }
  on(event: string, handler: (...args: any[]) => void) { this.socket?.on(event, handler); }
  off(event: string) { this.socket?.off(event); }
}

export const socketService = new SocketService();
