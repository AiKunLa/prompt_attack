/**
 * Supabase 相关类型定义
 */

import type { User as SupabaseUser } from '@supabase/supabase-js';

import type { Database } from './database.types';

// 导出常用类型
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// 业务类型别名
export type AttackTest = Tables<'attack_tests'>;
export type UserSettings = Tables<'user_settings'>;
export type AttackType = Enums<'attack_type'>;
export type DefenseLevel = Enums<'defense_level'>;

// 用户类型（扩展 Supabase User）
export interface User extends SupabaseUser {
  settings?: UserSettings;
}

// 攻击测试创建 DTO
export interface CreateAttackTestDTO {
  attack_type: AttackType;
  defense_level: DefenseLevel;
  input_text: string;
}

// 攻击测试响应 DTO
export interface AttackTestResponse {
  id: string;
  output_text: string | null;
  is_blocked: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// 用户统计类型
export interface UserStats {
  total_tests: number;
  blocked_count: number;
  passed_count: number;
  attack_type_distribution: Record<AttackType, number>;
  last_test_at: string | null;
}

// Session 类型
export interface SessionData {
  user: User | null;
  access_token: string | null;
  expires_at: number | null;
}

