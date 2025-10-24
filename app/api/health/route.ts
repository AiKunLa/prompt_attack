/**
 * 健康检查 API
 * GET /api/health
 */

import { NextResponse } from 'next/server';

import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createServerClient();

    // 测试数据库连接
    const { error } = await supabase.from('attack_tests').select('id').limit(1);

    const isHealthy = !error;

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        database: isHealthy ? 'connected' : 'disconnected',
        version: process.env.npm_package_version || 'unknown',
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    console.error('健康检查失败:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
      },
      { status: 503 }
    );
  }
}
