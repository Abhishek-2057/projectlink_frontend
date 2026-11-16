import { create } from 'zustand';
import { INotification } from '../types';
import { api } from '../lib/api';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notif: INotification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/notifications');
      if (res.data.success) {
        set({
          notifications: res.data.data,
          unreadCount: res.data.unreadCount,
          isLoading: false,
        });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      const notifs = get().notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      );
      const unread = notifs.filter((n) => !n.isRead).length;
      set({ notifications: notifs, unreadCount: unread });
    } catch (err) {
      console.error(err);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      const notifs = get().notifications.map((n) => ({ ...n, isRead: true }));
      set({ notifications: notifs, unreadCount: 0 });
    } catch (err) {
      console.error(err);
    }
  },

  addNotification: (notif: INotification) => {
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
