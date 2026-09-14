import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export type Role = 'pending' | 'approved' | 'admin';

interface AuthState {
  session: Session | null;
  user: User | null;
  role: Role | null;
  initialized: boolean;
  init: () => void;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

async function fetchRole(userId: string): Promise<Role | null> {
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (error || !data) return null;
  return data.role as Role;
}

let subscribed = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  role: null,
  initialized: false,

  init: () => {
    if (!isSupabaseConfigured || subscribed) return;
    subscribed = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const role = session?.user ? await fetchRole(session.user.id) : null;
      set({ session, user: session?.user ?? null, role, initialized: true });
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const role = session?.user ? await fetchRole(session.user.id) : null;
      set({ session, user: session?.user ?? null, role, initialized: true });
    });
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, role: null });
  },

  refreshRole: async () => {
    const user = get().user;
    if (!user) return;
    const role = await fetchRole(user.id);
    set({ role });
  },
}));
