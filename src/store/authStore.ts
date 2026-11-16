import { create } from 'zustand';
import { IUser, IStudentProfile, ICompanyProfile, UserRole } from '../types';
import { api } from '../lib/api';

interface AuthState {
  user: IUser | null;
  profile: IStudentProfile | ICompanyProfile | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (token: string, user: IUser, profile?: any) => void;
  logout: () => void;
  updateUser: (user: Partial<IUser>) => void;
  updateProfile: (profile: any) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  token: localStorage.getItem('projectlink_token'),
  isLoading: true,
  isInitialized: false,

  login: (token, user, profile) => {
    localStorage.setItem('projectlink_token', token);
    set({ token, user, profile: profile || null, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('projectlink_token');
    set({ token: null, user: null, profile: null, isLoading: false });
  },

  updateUser: (updated) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updated } : null,
    }));
  },

  updateProfile: (updated) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updated } : updated,
    }));
  },

  initialize: async () => {
    const token = localStorage.getItem('projectlink_token');
    if (!token) {
      set({ user: null, profile: null, isLoading: false, isInitialized: true });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        set({
          user: res.data.user,
          profile: res.data.profile,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        localStorage.removeItem('projectlink_token');
        set({ user: null, profile: null, token: null, isLoading: false, isInitialized: true });
      }
    } catch {
      localStorage.removeItem('projectlink_token');
      set({ user: null, profile: null, token: null, isLoading: false, isInitialized: true });
    }
  },
}));
