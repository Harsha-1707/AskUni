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
      // Try real backend first
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
      // Backend unavailable - try demo mode
      const isDemoMode = localStorage.getItem('demo-mode') === 'true';
      
      if (isDemoMode) {
        console.warn('Backend unavailable, using demo mode responses');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Demo responses based on keywords
        const lowerQuery = query.toLowerCase();
        let demoAnswer = '';
        let demoConfidence = 0.85;
        
        if (lowerQuery.includes('fee') || lowerQuery.includes('cost') || lowerQuery.includes('tuition')) {
          demoAnswer = '📚 The tuition fee for B.Tech Computer Science is ₹1,50,000 per year. This includes library access, lab facilities, and basic hostel amenities. Additional charges may apply for specialized courses and international programs.';
          demoConfidence = 0.92;
        } else if (lowerQuery.includes('hostel') || lowerQuery.includes('accommodation')) {
          demoAnswer = '🏠 Our university offers both boys and girls hostels with modern amenities including Wi-Fi, mess facilities, gym, and 24/7 security. Hostel fees are ₹60,000 per year for sharing rooms and ₹90,000 for single occupancy.';
          demoConfidence = 0.88;
        } else if (lowerQuery.includes('placement') || lowerQuery.includes('job')) {
          demoAnswer = '💼 Our placement record is excellent with 85% students placed in top companies. Average package is ₹6.5 LPA with highest package reaching ₹45 LPA. Top recruiters include Google, Microsoft, Amazon, and TCS.';
          demoConfidence = 0.90;
        } else if (lowerQuery.includes('admission') || lowerQuery.includes('eligibility')) {
          demoAnswer = '📝 Admission to B.Tech requires a minimum of 75% in 12th grade with Physics, Chemistry, and Mathematics. Valid JEE Main score is mandatory. Applications open in May each year.';
          demoConfidence = 0.87;
        } else {
          demoAnswer = `I'd be happy to help! (Demo Mode Active 🎭)\n\nI'm currently running in demo mode since the backend is being deployed. For full AI-powered responses with real university data, please check back in a few minutes once the Railway backend is live.\n\nIn the meantime, try asking about:\n• Tuition fees and costs\n• Hostel and accommodation\n• Placement statistics\n• Admission requirements`;
          demoConfidence = 0.75;
        }
        
        const demoMessage: Message = {
          id: 'demo-' + Date.now(),
          role: 'assistant',
          content: demoAnswer,
          confidence_score: demoConfidence,
          processing_time: 1.5,
          created_at: new Date(),
        };
        
        set((state) => ({ messages: [...state.messages, demoMessage], isLoading: false }));
        return;
      }
      
      // Both backend and demo mode failed
      set({ error: error.response?.data?.detail || 'Failed to send message', isLoading: false });
      throw error;
    }
  },

  clearMessages: () => set({ messages: [] }),
}));
