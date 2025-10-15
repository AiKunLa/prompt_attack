import { NextResponse } from 'next/server';

import { checkDBHealth } from '@/lib/db';

/**
 * GET /api/health
 * Health check endpoint
 */
export async function GET() {
  const dbHealthy = await checkDBHealth();

  const health = {
    status: dbHealthy ? 'healthy' : 'degraded',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: dbHealthy ? 'up' : 'down',
    },
  };

  return NextResponse.json(health, {
    status: dbHealthy ? 200 : 503,
  });
}

