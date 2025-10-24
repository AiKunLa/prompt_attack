import type { AttackType, DefenseLevel } from './supabase';

/**
 * API Response types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp?: string;
}

/**
 * Attack Test Types
 */
export interface AttackTestInput {
  input: string;
  defenseLevel: DefenseLevel;
  attackType?: AttackType;
  llmProvider?: 'openai' | 'claude';
  options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ValidationResult {
  passed: boolean;
  score: number;
  threats: Threat[];
  sanitized?: string;
}

export interface Threat {
  type: 'keyword' | 'pattern' | 'delimiter' | 'length';
  pattern?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export interface DefenseStages {
  inputValidation?: ValidationResult;
  promptArmor?: {
    applied: boolean;
    level: string;
    tokenOverhead?: number;
  };
  outputFilter?: {
    safe: boolean;
    issues: Array<{
      type: string;
      severity: string;
      message: string;
    }>;
  };
  contextIsolation?: {
    sessionBlocked: boolean;
    attackAttempts: number;
    riskScore: number;
  };
}

export interface AttackTestResult {
  blocked: boolean;
  blockReason?: string;
  blockStage?: string;
  stages: DefenseStages;
  llmResponse?: string;
  finalResponse: string;
  metrics: {
    totalTime: number;
    llmTime: number;
    defenseTime: number;
    tokensUsed?: number;
  };
  metadata?: {
    attackType?: AttackType;
    confidence?: number;
    recommendedAction?: string;
  };
}

/**
 * User Types
 */
export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  createdAt: Date;
}

/**
 * Form Types
 */
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name?: string;
}

/**
 * Utility Types
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFn<T = void> = () => Promise<T>;
