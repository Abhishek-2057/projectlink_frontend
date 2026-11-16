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
  setActiveConversation: (conv: IConversation) => Promise<void>;
  sendMessage: (text: string, file?: File) => Promise<void>;
  addMessage: (msg: IMessage) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  socket: null,

  initSocket: (userId: string) => {
    if (get().socket) return;
    const s = io('/', {
      query: { userId },
      transports: ['websocket', 'polling'],
    });

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

  setActiveConversation: async (conv: IConversation) => {
    set({ activeConversation: conv, isLoading: true });
    const socket = get().socket;
    if (socket) {
      socket.emit('join_conversation', conv._id);
    }

    try {
      const res = await api.get(`/chat/conversations/${conv._id}/messages`);
      if (res.data.success) {
        set({ messages: res.data.data, isLoading: false });
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

      if (res.data.success) {
        get().addMessage(res.data.data);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  },

  addMessage: (msg: IMessage) => {
    set((state) => ({
      messages: [...state.messages, msg],
    }));
  },
}));
