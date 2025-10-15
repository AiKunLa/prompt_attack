/**
 * OAuth 回调处理
 * GET /api/auth/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 重定向到首页或 dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url));
}

