import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('[Supabase] Thiếu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — tính năng tài khoản & đồng bộ đám mây sẽ bị tắt.');
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'public-anon-key-placeholder'
);
