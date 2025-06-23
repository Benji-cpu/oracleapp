import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { AuthState, User } from '../types';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user as User,
        session: data.session,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, username?: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      set({
        user: data.user as User,
        session: data.session,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      set({
        user: data.session?.user as User,
        session: data.session,
      });
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  },
}));

// Initialize auth state on app start
supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.setState({
    user: session?.user as User,
    session,
  });
});