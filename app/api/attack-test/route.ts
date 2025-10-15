import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { attackTestSchema } from '@/utils/validators';
import { handleError, ValidationError } from '@/utils/errors';
import type { ApiResponse, AttackTestResult } from '@/types';
import { getSession } from '@/lib/auth-helpers';

/**
 * POST /api/attack-test
 * Run a prompt attack test
 */
export async function POST(req: NextRequest) {
  try {
    // Get session (optional - can run tests without auth)
    const session = await getSession();

    const body = await req.json();

    // Validate input
    const validation = attackTestSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.errors[0]?.message ?? 'Invalid input'
      );
    }

    const { input, defenseLevel, attackType, llmProvider } = validation.data;

    // TODO: Implement actual defense system
    // For now, return mock data
    const mockResult: AttackTestResult = {
      blocked: defenseLevel !== 'NONE' && input.includes('忽略'),
      blockReason:
        defenseLevel !== 'NONE' && input.includes('忽略')
          ? 'Detected prompt injection attempt'
          : undefined,
      blockStage: input.includes('忽略') ? 'input_validation' : undefined,
      stages: {
        inputValidation: {
          passed: !input.includes('忽略'),
          score: input.includes('忽略') ? 75 : 10,
          threats: input.includes('忽略')
            ? [
                {
                  type: 'keyword',
                  pattern: 'chinese_0',
                  severity: 'high',
                  message: "Detected keyword '忽略'",
                },
              ]
            : [],
        },
      },
      llmResponse: 'Mock LLM response - not implemented yet',
      finalResponse:
        defenseLevel !== 'NONE' && input.includes('忽略')
          ? '⚠️ Input blocked by security filter'
          : 'Mock LLM response - not implemented yet',
      metrics: {
        totalTime: 150,
        llmTime: 100,
        defenseTime: 50,
        tokensUsed: 25,
      },
      metadata: {
        attackType,
        confidence: 0.85,
        recommendedAction: 'continue_monitoring',
      },
    };

    // Save test to database (if authenticated)
    if (session?.user) {
      await prisma.attackTest.create({
        data: {
          input,
          defenseLevel,
          attackType,
          blocked: mockResult.blocked,
          blockReason: mockResult.blockReason,
          blockStage: mockResult.blockStage,
          threatScore: mockResult.stages.inputValidation?.score ?? 0,
          llmResponse: mockResult.llmResponse,
          finalResponse: mockResult.finalResponse,
          llmProvider: llmProvider ?? 'openai',
          tokensUsed: mockResult.metrics.tokensUsed,
          latencyMs: mockResult.metrics.totalTime,
          userId: session.user.id,
        },
      });
    }

    const response: ApiResponse<AttackTestResult> = {
      success: true,
      data: mockResult,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const { message, statusCode, code } = handleError(error);

    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: statusCode });
  }
}

