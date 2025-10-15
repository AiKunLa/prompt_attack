/**
 * 用户注册 API
 * POST /api/auth/signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';

// 注册验证 schema
const signupSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  password: z
    .string()
    .min(8, '密码至少需要 8 个字符')
    .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字'),
  name: z.string().min(2, '姓名至少需要 2 个字符').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证输入
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '验证失败',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    const supabase = await createServerClient();

    // 注册用户
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error('注册失败:', error);
      return NextResponse.json(
        {
          error: error.message || '注册失败',
        },
        { status: 400 }
      );
    }

    // 检查是否需要邮箱验证
    const needsEmailVerification = !data.session;

    return NextResponse.json(
      {
        message: needsEmailVerification
          ? '注册成功！请检查您的邮箱以验证账户。'
          : '注册成功！',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name: data.user?.user_metadata?.name,
        },
        needsEmailVerification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('注册异常:', error);
    return NextResponse.json(
      {
        error: '服务器错误',
      },
      { status: 500 }
    );
  }
}

