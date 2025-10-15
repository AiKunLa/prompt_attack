import { z } from 'zod';
import { DefenseLevel, AttackType } from '@prisma/client';

/**
 * Validation schemas using Zod
 */

export const attackTestSchema = z.object({
  input: z
    .string()
    .min(1, 'Input cannot be empty')
    .max(5000, 'Input too long (max 5000 characters)'),
  defenseLevel: z.nativeEnum(DefenseLevel),
  attackType: z.nativeEnum(AttackType).optional(),
  llmProvider: z.enum(['openai', 'claude']).optional(),
  options: z
    .object({
      systemPrompt: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(1).max(4000).optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase, one lowercase, and one number'
    ),
  name: z.string().min(2).max(50).optional(),
});

/**
 * Type inference from schemas
 */
export type AttackTestInput = z.infer<typeof attackTestSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

