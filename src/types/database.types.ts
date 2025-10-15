/**
 * Supabase 数据库类型定义
 * 
 * 💡 提示：这些类型可以通过以下命令自动生成：
 * pnpm supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AttackType =
  | 'PROMPT_INJECTION'
  | 'JAILBREAK'
  | 'CONTEXT_OVERFLOW'
  | 'ROLE_MANIPULATION'
  | 'DELIMITER_ATTACK';

export type DefenseLevel = 'NONE' | 'BASIC' | 'ADVANCED' | 'PARANOID';

export interface Database {
  public: {
    Tables: {
      attack_tests: {
        Row: {
          id: string;
          user_id: string;
          attack_type: AttackType;
          defense_level: DefenseLevel;
          input_text: string;
          output_text: string | null;
          is_blocked: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          attack_type: AttackType;
          defense_level: DefenseLevel;
          input_text: string;
          output_text?: string | null;
          is_blocked?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          attack_type?: AttackType;
          defense_level?: DefenseLevel;
          input_text?: string;
          output_text?: string | null;
          is_blocked?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'attack_tests_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          default_defense_level: DefenseLevel;
          theme: string;
          language: string;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          default_defense_level?: DefenseLevel;
          theme?: string;
          language?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          default_defense_level?: DefenseLevel;
          theme?: string;
          language?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_settings_user_id_fkey';
            columns: ['user_id'];
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
    };
    Views: {
      user_attack_stats: {
        Row: {
          user_id: string | null;
          total_tests: number | null;
          blocked_count: number | null;
          passed_count: number | null;
          prompt_injection_count: number | null;
          jailbreak_count: number | null;
          context_overflow_count: number | null;
          role_manipulation_count: number | null;
          delimiter_attack_count: number | null;
          last_test_at: string | null;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      attack_type: AttackType;
      defense_level: DefenseLevel;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

