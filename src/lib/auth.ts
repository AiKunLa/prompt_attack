/**
 * Supabase 认证辅助函数
 */

import { createServerClient } from './supabase';
import type { User } from '@/types/supabase';

/**
 * 获取当前登录用户（服务端）
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user as User;
}

/**
 * 检查用户是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * 获取用户 Session
 */
export async function getSession() {
  const supabase = await createServerClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('获取 session 失败:', error);
    return null;
  }

  return session;
}

/**
 * 要求认证（用于保护路由）
 * 如果未登录则抛出错误
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('未授权访问');
  }

  return user;
}

/**
 * 获取用户设置
 */
export async function getUserSettings(userId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('获取用户设置失败:', error);
    return null;
  }

  return data;
}
