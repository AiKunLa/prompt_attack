# 📦 Supabase 完全迁移指南

## ✅ 迁移完成

本项目已从 **Prisma + NextAuth.js** 完全迁移到 **Supabase**！

---

## 🎯 迁移内容

### 已移除
- ❌ Prisma ORM
- ❌ NextAuth.js
- ❌ bcryptjs
- ❌ PostgreSQL 直连配置

### 已添加
- ✅ **@supabase/supabase-js** - Supabase 客户端
- ✅ **@supabase/ssr** - Next.js SSR 支持
- ✅ **Supabase Auth** - 认证系统
- ✅ **Row Level Security (RLS)** - 数据库安全策略

---

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 点击 **"New Project"**
3. 填写项目信息：
   - Name: `prompt-attack`
   - Database Password: 设置一个强密码（**请妥善保存**）
   - Region: 选择离你最近的区域

### 2. 获取 API 凭证

在 Supabase Dashboard 中：

1. 进入 **Settings** ⚙️ → **API**
2. 复制以下信息：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJhbGciOi...`

### 3. 配置环境变量

创建 `.env.local` 文件：

```bash
# 在项目根目录
cp env.example .env.local
```

编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. 运行数据库迁移

在 Supabase Dashboard 的 **SQL Editor** 中：

1. 点击 **"New query"**
2. 复制 `supabase/migrations/20241015_initial_schema.sql` 的内容
3. 粘贴并点击 **"Run"**

或者使用 Supabase CLI：

```bash
# 安装 Supabase CLI（如果还没有）
pnpm add -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 运行迁移
supabase db push
```

### 5. 启动开发服务器

```bash
pnpm install
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

---

## 📊 数据库架构

### 表结构

#### `attack_tests`
攻击测试记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `user_id` | UUID | 用户 ID（外键 → auth.users） |
| `attack_type` | ENUM | 攻击类型 |
| `defense_level` | ENUM | 防御级别 |
| `input_text` | TEXT | 输入文本 |
| `output_text` | TEXT | 输出结果 |
| `is_blocked` | BOOLEAN | 是否被拦截 |
| `metadata` | JSONB | 元数据 |
| `created_at` | TIMESTAMP | 创建时间 |
| `updated_at` | TIMESTAMP | 更新时间 |

#### `user_settings`
用户配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `user_id` | UUID | 用户 ID（唯一，外键） |
| `default_defense_level` | ENUM | 默认防御级别 |
| `theme` | VARCHAR(20) | 主题（light/dark/system） |
| `language` | VARCHAR(10) | 语言 |
| `preferences` | JSONB | 偏好设置 |
| `created_at` | TIMESTAMP | 创建时间 |
| `updated_at` | TIMESTAMP | 更新时间 |

### 枚举类型

```sql
-- 攻击类型
CREATE TYPE attack_type AS ENUM (
  'PROMPT_INJECTION',
  'JAILBREAK',
  'CONTEXT_OVERFLOW',
  'ROLE_MANIPULATION',
  'DELIMITER_ATTACK'
);

-- 防御级别
CREATE TYPE defense_level AS ENUM (
  'NONE',
  'BASIC',
  'ADVANCED',
  'PARANOID'
);
```

### Row Level Security (RLS)

所有表都启用了 RLS，确保用户只能访问自己的数据：

```sql
-- 用户只能查看/修改自己的测试记录
CREATE POLICY "Users can view their own attack tests"
  ON attack_tests FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🔐 认证系统

### Supabase Auth 特性

1. **邮箱 + 密码** 登录
2. **OAuth 登录**（GitHub、Google 等）
3. **自动邮箱验证**
4. **密码重置**
5. **会话管理**（自动续期）

### 使用示例

#### 客户端组件

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth();

  const handleLogin = async () => {
    await signIn('user@example.com', 'password123');
  };

  return (
    <div>
      {user ? (
        <button onClick={signOut}>登出</button>
      ) : (
        <button onClick={handleLogin}>登录</button>
      )}
    </div>
  );
}
```

#### 服务端组件

```typescript
import { createServerClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export default async function ServerPage() {
  const user = await getCurrentUser();

  return <div>欢迎, {user?.email}</div>;
}
```

#### API 路由

```typescript
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  const user = await requireAuth(); // 自动验证并获取用户
  const supabase = await createServerClient();

  const { data } = await supabase
    .from('attack_tests')
    .select('*')
    .eq('user_id', user.id);

  return Response.json(data);
}
```

---

## 🔧 开发工具

### Supabase Studio（本地开发）

```bash
# 安装 Supabase CLI
pnpm add -g supabase

# 启动本地 Supabase
supabase start

# 访问本地 Studio
# http://localhost:54323
```

### 在线 Dashboard

- **SQL Editor**: 执行 SQL 查询
- **Table Editor**: 可视化编辑表数据
- **Authentication**: 管理用户和认证提供商
- **Database**: 查看架构、运行迁移
- **Storage**: 文件存储管理
- **Logs**: 查看实时日志

---

## 📝 API 路由

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/auth/signup` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 用户登出 |
| `/api/auth/callback` | GET | OAuth 回调 |
| `/api/attack-test` | POST | 运行攻击测试 |
| `/api/attack-test` | GET | 获取测试历史 |
| `/api/user/stats` | GET | 获取用户统计 |
| `/api/health` | GET | 健康检查 |

---

## 🎨 UI 组件

所有 UI 组件保持不变，只是更新了数据获取方式：

- `app/login/page.tsx` - 登录/注册页面
- `app/dashboard/page.tsx` - 仪表板
- `app/page.tsx` - 首页

---

## 🚨 常见问题

### Q: 如何启用 GitHub OAuth？

**A**: 在 Supabase Dashboard:

1. **Authentication** → **Providers** → **GitHub**
2. 启用 GitHub
3. 填入 GitHub OAuth App 的 Client ID 和 Secret
4. 回调 URL 设置为: `https://your-project.supabase.co/auth/v1/callback`

### Q: 如何重置密码？

**A**: 使用 Supabase Auth:

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});
```

### Q: 如何更新用户信息？

**A**:

```typescript
const { error } = await supabase.auth.updateUser({
  data: { name: 'New Name' }
});
```

### Q: RLS 策略导致查询失败？

**A**: 确保你的查询使用了已认证的 Supabase 客户端：

```typescript
// ✅ 正确 - 使用服务端客户端
const supabase = await createServerClient();

// ❌ 错误 - 使用浏览器客户端在服务端
import { supabase } from '@/lib/supabase/client';
```

---

## 🎉 迁移完成！

现在你可以：

- ✅ 使用 Supabase 的所有特性
- ✅ 实时数据库订阅
- ✅ 文件存储（Storage）
- ✅ Edge Functions
- ✅ 更强大的 RLS 安全策略

享受开发吧！ 🚀

