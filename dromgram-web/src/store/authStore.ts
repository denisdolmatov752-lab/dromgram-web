import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string; phone: string; firstName: string; lastName?: string;
  username?: string; bio?: string; avatarUrl?: string; avatarColor: string;
  isOnline: boolean; isPremium: boolean; isAdmin: boolean;
  stars?: number; premiumUntil?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      updateUser: (data) => set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
