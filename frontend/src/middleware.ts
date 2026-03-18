import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://tmskvpczoksgdwvtodwa.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtc2t2cGN6b2tzZ2R3dnRvZHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzQ0MTYsImV4cCI6MjA4OTExMDQxNn0.aakZ8eQeCzrAcc3BLymmY7AtFG-_RBlKJ13-zr_WDqE';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Allow public auth routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  // Supabase stores the access token in a cookie named sb-<ref>-auth-token
  const authCookieName = `sb-tmskvpczoksgdwvtodwa-auth-token`;
  const authCookie = request.cookies.get(authCookieName)?.value;

  // Also check the newer cookie format
  const authTokenBase = request.cookies.get(`sb-tmskvpczoksgdwvtodwa-auth-token.0`)?.value;

  if (!authCookie && !authTokenBase) {
    // No auth token found - redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For onboarding route, allow if authenticated
  if (pathname.startsWith('/onboarding')) {
    return NextResponse.next();
  }

  // For protected routes, we check onboarding status
  // We use a lightweight check via the profile cookie or a server-side query
  // Since middleware can't easily call Supabase with the user's session,
  // we rely on the client-side useAuth hook to redirect non-onboarded users.
  // The middleware primarily handles the unauthenticated -> login redirect.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
