/**
 * Supabase 客户端 - 浏览器端
 * 用于客户端组件中的数据库和认证操作
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (client) {
    return client;
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}

export const supabase = createClient();

