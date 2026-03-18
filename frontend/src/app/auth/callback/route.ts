import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://tmskvpczoksgdwvtodwa.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtc2t2cGN6b2tzZ2R3dnRvZHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzQ0MTYsImV4cCI6MjA4OTExMDQxNn0.aakZ8eQeCzrAcc3BLymmY7AtFG-_RBlKJ13-zr_WDqE';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.session.user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}/`);
    }
  }

  // If something went wrong, redirect to login
  return NextResponse.redirect(`${origin}/auth/login`);
}
