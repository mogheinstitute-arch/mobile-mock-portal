import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn('⚠️ Supabase not configured. App will run with limited functionality.');
  console.warn('To enable full database features, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
}
