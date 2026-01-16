import { create } from 'zustand';
import api from '../api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    source: string;
    score: number;
    content: string;
  }>;
  confidence_score?: number;
  processing_time?: number;
  created_at: Date;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (query: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (query: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      created_at: new Date(),
    };

    set((state) => ({ messages: [...state.messages, userMessage], isLoading: true, error: null }));

    try {
      const response = await api.post('/chat/', { query, history: [] });

      const assistantMessage: Message = {
        id: response.data.conversation_id,
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources || [],
        confidence_score: response.data.confidence_score,
        processing_time: response.data.processing_time,
        created_at: new Date(),
      };

      set((state) => ({ messages: [...state.messages, assistantMessage], isLoading: false }));
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to send message', isLoading: false });
      throw error;
    }
  },

  clearMessages: () => set({ messages: [] }),
}));
