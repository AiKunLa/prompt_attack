# ⚡ 快速开始（Supabase 版）

> 本项目已完全迁移到 Supabase！5 分钟即可开始开发。

---

## 📋 前置要求

- ✅ Node.js >= 18.17.0
- ✅ pnpm >= 8.0.0
- ✅ Supabase 账户（[免费注册](https://supabase.com)）
- ✅ Git

---

## 🚀 开始步骤

### 1️⃣ 克隆项目

```bash
git clone <your-repo-url>
cd promptAttack
```

### 2️⃣ 安装依赖

```bash
pnpm install
```

### 3️⃣ 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 点击 **"New Project"**
3. 填写信息：
   - **Name**: `prompt-attack`
   - **Database Password**: 设置强密码
   - **Region**: 选择最近的区域
4. 等待项目初始化（约 2 分钟）

### 4️⃣ 获取 API 密钥

在 Supabase Dashboard:

1. **Settings** ⚙️ → **API**
2. 复制：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGciOi...`

### 5️⃣ 配置环境变量

创建 `.env.local`:

```bash
cp env.example .env.local
```

编辑 `.env.local`，填入你的信息：

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 6️⃣ 运行数据库迁移

**方法 1: 使用 Supabase Dashboard（推荐）**

1. 在 Dashboard 中，进入 **SQL Editor**
2. 点击 **"New query"**
3. 复制 `supabase/migrations/20241015_initial_schema.sql` 的全部内容
4. 粘贴并点击 **"Run"**
5. 看到 "Success. No rows returned" 即成功

**方法 2: 使用 Supabase CLI**

```bash
# 安装 CLI（如果还没有）
pnpm add -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 推送迁移
supabase db push
```

### 7️⃣ 验证数据库

在 Supabase Dashboard:

1. **Table Editor** → 应该看到 `attack_tests` 和 `user_settings` 表
2. **Authentication** → **Policies** → 确认 RLS 策略已创建

### 8️⃣ 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 🎉

---

## ✅ 验证安装

### 健康检查

访问: [http://localhost:3000/api/health](http://localhost:3000/api/health)

应该看到：

```json
{
  "status": "healthy",
  "timestamp": "2024-10-15T...",
  "database": "connected",
  "version": "..."
}
```

### 注册测试账户

1. 访问 [http://localhost:3000/login](http://localhost:3000/login)
2. 点击 **"立即注册"**
3. 填写邮箱和密码（密码需 8+ 字符，包含大小写字母和数字）
4. 查看邮箱验证邮件（如果启用了邮箱验证）

### 运行攻击测试

1. 登录后进入 Dashboard
2. 选择攻击类型和防御级别
3. 输入测试文本
4. 点击 **"运行测试"**
5. 查看结果

---

## 📁 项目结构

```
promptAttack/
├── app/                        # Next.js App Router
│   ├── api/                    # API 路由
│   │   ├── auth/              # 认证相关 API
│   │   │   ├── signup/        # 注册
│   │   │   ├── login/         # 登录
│   │   │   ├── logout/        # 登出
│   │   │   └── callback/      # OAuth 回调
│   │   ├── attack-test/       # 攻击测试 API
│   │   ├── user/stats/        # 用户统计
│   │   └── health/            # 健康检查
│   ├── dashboard/             # Dashboard 页面
│   ├── login/                 # 登录页面
│   ├── layout.tsx             # 根布局
│   ├── page.tsx               # 首页
│   └── providers.tsx          # 客户端 Providers
├── src/
│   ├── components/            # React 组件
│   │   └── ui/               # shadcn/ui 组件
│   ├── hooks/                # 自定义 Hooks
│   │   ├── useAuth.ts        # 认证 Hook
│   │   └── useAttackTest.ts  # 攻击测试 Hook
│   ├── lib/                  # 库和工具
│   │   ├── supabase/         # Supabase 客户端
│   │   │   ├── client.ts     # 浏览器端客户端
│   │   │   ├── server.ts     # 服务端客户端
│   │   │   ├── middleware.ts # 中间件客户端
│   │   │   └── index.ts      # 统一导出
│   │   ├── auth.ts           # 认证辅助函数
│   │   └── store.ts          # Zustand 状态管理
│   ├── types/                # TypeScript 类型
│   │   ├── database.types.ts # Supabase 数据库类型
│   │   └── supabase.ts       # Supabase 相关类型
│   ├── utils/                # 工具函数
│   │   └── cn.ts             # className 合并
│   └── middleware.ts         # Next.js 中间件
├── supabase/
│   └── migrations/           # 数据库迁移文件
│       └── 20241015_initial_schema.sql
├── docs/                     # 项目文档
├── public/                   # 静态资源
├── .env.local               # 环境变量（需手动创建）
├── env.example              # 环境变量示例
├── next.config.js           # Next.js 配置
├── tailwind.config.ts       # Tailwind CSS 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 依赖配置
```

---

## 🎯 下一步

现在你可以：

1. **📖 阅读文档**
   - [Supabase 迁移指南](./Supabase迁移指南.md)
   - [环境配置](./环境配置.md)
   - [项目结构](./项目结构.md)

2. **🔧 开发功能**
   - 在 `app/api/` 中添加新的 API 路由
   - 在 `app/` 中创建新页面
   - 在 `src/components/` 中添加 UI 组件

3. **🎨 自定义样式**
   - 修改 `tailwind.config.ts`
   - 在 `app/globals.css` 中添加全局样式

4. **🚀 部署**
   - [部署到 Vercel](../部署运维/部署指南.md)

---

## 🆘 遇到问题？

### 常见问题

**Q: `NEXT_PUBLIC_SUPABASE_URL is not defined`**

A: 确保你已创建 `.env.local` 并填入了正确的值。重启开发服务器。

**Q: 数据库连接失败**

A:

1. 检查 Supabase 项目是否处于活跃状态（不是 Paused）
2. 确认 API 密钥正确
3. 查看 Supabase Dashboard → Settings → API

**Q: 注册/登录失败**

A:

1. 检查密码强度（至少 8 字符，包含大小写和数字）
2. 查看 Supabase Dashboard → Authentication → Users
3. 确认邮箱验证设置（可在 Authentication → Settings 中禁用）

**Q: RLS 策略导致查询失败**

A:

1. 确认用户已登录
2. 检查 SQL 迁移是否成功运行
3. 在 Dashboard → Authentication → Policies 中查看策略

### 获取帮助

- 📚 查看 [详细文档](../README.md)
- 🐛 提交 [Issue](https://github.com/your-repo/issues)
- 💬 Supabase [社区论坛](https://github.com/supabase/supabase/discussions)

---

## 🎉 开始开发吧！

一切准备就绪，现在可以开始构建你的 Prompt Attack Demo 了！
