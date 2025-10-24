/**
 * 攻击测试相关 Hooks
 */

'use client';

import { useState } from 'react';

import { useStore } from '@/lib/store';
import type { AttackType, DefenseLevel } from '@/types/supabase';

interface AttackTestParams {
  attackType: AttackType;
  defenseLevel: DefenseLevel;
  inputText: string;
}

interface AttackTestResult {
  id: string;
  output_text: string | null;
  is_blocked: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export function useAttackTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addTest, setCurrentTest } = useStore();

  const runTest = async (
    params: AttackTestParams
  ): Promise<AttackTestResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/attack-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 携带 cookies
        body: JSON.stringify({
          attack_type: params.attackType,
          defense_level: params.defenseLevel,
          input_text: params.inputText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '测试失败');
      }

      const result: AttackTestResult = await response.json();

      // 更新 Zustand store
      addTest({
        id: result.id,
        attackType: params.attackType,
        defenseLevel: params.defenseLevel,
        inputText: params.inputText,
        outputText: result.output_text,
        isBlocked: result.is_blocked,
        timestamp: new Date(result.created_at),
      });

      setCurrentTest(result.id);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/attack-test?page=${page}&limit=${limit}`,
        {
          credentials: 'include', // 携带 cookies
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取历史记录失败');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    runTest,
    fetchHistory,
  };
}
