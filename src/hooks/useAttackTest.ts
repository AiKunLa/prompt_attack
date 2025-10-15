import { useCallback } from 'react';
import axios from 'axios';

import { useAttackTestStore } from '@/lib/store';
import type { AttackTestInput, ApiResponse, AttackTestResult } from '@/types';

/**
 * Custom hook for attack testing
 */
export function useAttackTest() {
  const { setLoading, setResult, setError, addToHistory } = useAttackTestStore();

  const runTest = useCallback(
    async (input: AttackTestInput) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post<ApiResponse<AttackTestResult>>(
          '/api/attack-test',
          input
        );

        if (response.data.success && response.data.data) {
          setResult(response.data.data);
          addToHistory(response.data.data);
          return response.data.data;
        } else {
          throw new Error(response.data.error?.message || 'Test failed');
        }
      } catch (error) {
        const message =
          axios.isAxiosError(error) && error.response?.data?.error?.message
            ? error.response.data.error.message
            : 'An error occurred during testing';

        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setResult, setError, addToHistory]
  );

  return { runTest };
}

