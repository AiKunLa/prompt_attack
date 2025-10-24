/**
 * 用户登出 API
 * POST /api/auth/logout
 */

import { NextResponse } from 'next/server';

import { createServerClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('登出失败:', error);
      return NextResponse.json(
        {
          error: error.message || '登出失败',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: '登出成功',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('登出异常:', error);
    return NextResponse.json(
      {
        error: '服务器错误',
      },
      { status: 500 }
    );
  }
}
