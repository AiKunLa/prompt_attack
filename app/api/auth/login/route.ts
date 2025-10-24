/**
 * 用户登录 API
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createServerClient } from '@/lib/supabase';

// 登录验证 schema
const loginSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  password: z.string().min(1, '密码不能为空'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证输入
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '验证失败',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const supabase = await createServerClient();

    // 登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('登录失败:', error);
      return NextResponse.json(
        {
          error: error.message || '登录失败',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: '登录成功',
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name,
        },
        session: {
          access_token: data.session.access_token,
          expires_at: data.session.expires_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('登录异常:', error);
    return NextResponse.json(
      {
        error: '服务器错误',
      },
      { status: 500 }
    );
  }
}
