/**
 * 攻击测试 API
 * POST /api/attack-test
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { AttackType, DefenseLevel } from '@/types/supabase';

// 验证 schema
const attackTestSchema = z.object({
  attack_type: z.enum([
    'PROMPT_INJECTION',
    'JAILBREAK',
    'CONTEXT_OVERFLOW',
    'ROLE_MANIPULATION',
    'DELIMITER_ATTACK',
  ]),
  defense_level: z.enum(['NONE', 'BASIC', 'ADVANCED', 'PARANOID']),
  input_text: z.string().min(1, '输入文本不能为空').max(10000, '输入文本过长'),
});

/**
 * 执行攻击测试
 */
async function executeAttackTest(
  inputText: string,
  attackType: AttackType,
  defenseLevel: DefenseLevel
): Promise<{
  output: string;
  isBlocked: boolean;
  metadata: Record<string, unknown>;
}> {
  // TODO: 这里应该调用实际的 AI 模型和防御策略
  // 目前返回模拟数据

  const isBlocked = defenseLevel !== 'NONE' && Math.random() > 0.3;

  return {
    output: isBlocked
      ? '⚠️ 检测到潜在的恶意输入，已被防御系统拦截。'
      : `AI 响应: 收到您的输入"${inputText.substring(0, 50)}..."`,
    isBlocked,
    metadata: {
      attackType,
      defenseLevel,
      detectedPatterns: isBlocked ? ['suspicious_pattern_1'] : [],
      processingTime: Math.random() * 1000,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await requireAuth();

    const body = await request.json();

    // 验证输入
    const validationResult = attackTestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '验证失败',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { attack_type, defense_level, input_text } = validationResult.data;

    // 执行攻击测试
    const { output, isBlocked, metadata } = await executeAttackTest(
      input_text,
      attack_type,
      defense_level
    );

    const supabase = await createServerClient();

    // 保存测试记录到数据库
    type AttackTestInsert =
      Database['public']['Tables']['attack_tests']['Insert'];
    const insertData: AttackTestInsert = {
      user_id: user.id,
      attack_type,
      defense_level,
      input_text,
      output_text: output,
      is_blocked: isBlocked,
      metadata: metadata as any,
    };

    const result = await supabase
      .from('attack_tests')
      .insert(insertData as any)
      .select()
      .single();

    if (result.error || !result.data) {
      console.error('保存测试记录失败:', result.error);
      return NextResponse.json(
        {
          error: '保存测试记录失败',
        },
        { status: 500 }
      );
    }

    type AttackTestRow = Database['public']['Tables']['attack_tests']['Row'];
    // @ts-ignore - Supabase 类型推断问题
    const data = result.data as AttackTestRow;

    return NextResponse.json(
      {
        id: data.id,
        output_text: data.output_text,
        is_blocked: data.is_blocked,
        metadata: data.metadata,
        created_at: data.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('攻击测试异常:', error);

    if (error instanceof Error && error.message === '未授权访问') {
      return NextResponse.json(
        {
          error: '请先登录',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: '服务器错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 获取攻击测试历史记录
 * GET /api/attack-test?page=1&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = (page - 1) * limit;

    const supabase = await createServerClient();

    // 获取总数
    const { count } = await supabase
      .from('attack_tests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // 获取分页数据
    const { data, error } = await supabase
      .from('attack_tests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取测试记录失败:', error);
      return NextResponse.json(
        {
          error: '获取测试记录失败',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('获取测试记录异常:', error);

    if (error instanceof Error && error.message === '未授权访问') {
      return NextResponse.json(
        {
          error: '请先登录',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: '服务器错误',
      },
      { status: 500 }
    );
  }
}
