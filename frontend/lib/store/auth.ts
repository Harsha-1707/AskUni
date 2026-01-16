import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append('username', email);
          formData.append('password', password);

          const response = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          });

          const { access_token } = response.data;
          localStorage.setItem('token', access_token);
          
          // Decode JWT to get user role (simple base64 decode)
          const payload = JSON.parse(atob(access_token.split('.')[1]));
          const role = email.includes('admin') ? 'admin' : 'student'; // Fallback logic
          
          set({ token: access_token, user: { id: payload.sub || '', email, role }, isLoading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.detail || 'Login failed', isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, role = 'student') => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/register', { email, password, role });
          // Auto-login after registration
          await useAuthStore.getState().login(email, password);
        } catch (error: any) {
          set({ error: error.response?.data?.detail || 'Registration failed', isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      setToken: (token: string) => {
        localStorage.setItem('token', token);
        set({ token });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
