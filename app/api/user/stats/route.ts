/**
 * 用户统计 API
 * GET /api/user/stats
 */

import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

export async function GET() {
  try {
    const user = await requireAuth();

    const supabase = await createServerClient();

    // 从视图获取统计数据
    // @ts-ignore - Supabase 类型推断问题
    const result = await supabase
      .from('user_attack_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (result.error) {
      console.error('获取统计数据失败:', result.error);
      return NextResponse.json(
        {
          error: '获取统计数据失败',
        },
        { status: 500 }
      );
    }

    // 如果没有数据，返回默认值
    if (!result.data) {
      return NextResponse.json({
        total_tests: 0,
        blocked_count: 0,
        passed_count: 0,
        attack_type_distribution: {
          PROMPT_INJECTION: 0,
          JAILBREAK: 0,
          CONTEXT_OVERFLOW: 0,
          ROLE_MANIPULATION: 0,
          DELIMITER_ATTACK: 0,
        },
        last_test_at: null,
      });
    }

    type UserStatsRow = Database['public']['Views']['user_attack_stats']['Row'];
    const data = result.data as UserStatsRow;

    return NextResponse.json({
      total_tests: data.total_tests || 0,
      blocked_count: data.blocked_count || 0,
      passed_count: data.passed_count || 0,
      attack_type_distribution: {
        PROMPT_INJECTION: data.prompt_injection_count || 0,
        JAILBREAK: data.jailbreak_count || 0,
        CONTEXT_OVERFLOW: data.context_overflow_count || 0,
        ROLE_MANIPULATION: data.role_manipulation_count || 0,
        DELIMITER_ATTACK: data.delimiter_attack_count || 0,
      },
      last_test_at: data.last_test_at,
    });
  } catch (error) {
    console.error('获取统计数据异常:', error);

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
