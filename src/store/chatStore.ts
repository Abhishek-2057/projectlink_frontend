import { create } from 'zustand';
import { IConversation, IMessage } from '../types';
import { api } from '../lib/api';
import { io, Socket } from 'socket.io-client';

interface ChatState {
  conversations: IConversation[];
  activeConversation: IConversation | null;
  messages: IMessage[];
  isLoading: boolean;
  socket: Socket | null;
  initSocket: (userId: string) => void;
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conv: IConversation | null) => Promise<void>;
  sendMessage: (text: string, file?: File) => Promise<void>;
  addMessage: (msg: IMessage) => void;
}

function getSocketBaseUrl(): string {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (socketUrl) return socketUrl.trim().replace(/\/+$/, '');

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl.startsWith('http')) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      return apiUrl.replace(/\/api\/?$/, '');
    }
  }

  return '/';
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  socket: null,

  initSocket: (userId: string) => {
    const existing = get().socket;
    if (existing && existing.connected) return;

    if (existing) {
      existing.off('new_message');
      existing.disconnect();
    }

    const socketBase = getSocketBaseUrl();
    const s = io(socketBase, {
      query: { userId },
      transports: ['websocket', 'polling'],
    });

    s.off('new_message');
    s.on('new_message', (msg: IMessage) => {
      const active = get().activeConversation;
      if (active && active._id === msg.conversationId) {
        get().addMessage(msg);
      }
      get().fetchConversations();
    });

    set({ socket: s });
  },

  fetchConversations: async () => {
    try {
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        set({ conversations: res.data.data });
      }
    } catch (err) {
      console.error(err);
    }
  },

  setActiveConversation: async (conv: IConversation | null) => {
    const prevConv = get().activeConversation;
    const socket = get().socket;

    if (!conv) {
      if (socket && prevConv) {
        socket.emit('leave_conversation', prevConv._id);
      }
      set({ activeConversation: null, messages: [], isLoading: false });
      return;
    }

    // Leave previous room if changing conversation
    if (socket && prevConv && prevConv._id !== conv._id) {
      socket.emit('leave_conversation', prevConv._id);
    }

    set({ activeConversation: conv, isLoading: true });
    if (socket) {
      socket.emit('join_conversation', conv._id);
    }

    try {
      const res = await api.get(`/chat/conversations/${conv._id}/messages`);
      if (res.data.success) {
        // Deduplicate messages by _id
        const seen = new Set<string>();
        const uniqueMessages: IMessage[] = [];
        for (const m of res.data.data || []) {
          if (m._id && !seen.has(m._id)) {
            seen.add(m._id);
            uniqueMessages.push(m);
          }
        }
        set({ messages: uniqueMessages, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  sendMessage: async (text: string, file?: File) => {
    const active = get().activeConversation;
    if (!active) return;

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('attachment', file);
        if (text) formData.append('text', text);
        res = await api.post(`/chat/conversations/${active._id}/messages`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post(`/chat/conversations/${active._id}/messages`, { text });
      }

      if (res.data.success && res.data.data) {
        get().addMessage(res.data.data);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  },

  addMessage: (msg: IMessage) => {
    if (!msg || !msg._id) return;
    set((state) => {
      // Prevent duplicates: ignore if message _id is already in state
      const exists = state.messages.some((m) => m._id === msg._id);
      if (exists) return state;

      return {
        messages: [...state.messages, msg],
      };
    });
  },
}));
