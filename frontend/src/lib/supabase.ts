import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://tmskvpczoksgdwvtodwa.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtc2t2cGN6b2tzZ2R3dnRvZHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzQ0MTYsImV4cCI6MjA4OTExMDQxNn0.aakZ8eQeCzrAcc3BLymmY7AtFG-_RBlKJ13-zr_WDqE';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export const supabase = getSupabaseClient();
