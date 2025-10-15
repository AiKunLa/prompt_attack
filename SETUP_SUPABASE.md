# 🔥 Supabase 重构完成！

本项目已完全从 **Prisma + NextAuth.js** 迁移到 **Supabase**！

---

## ✨ 新特性

- ✅ **Supabase Auth** - 统一的认证系统
- ✅ **Row Level Security** - 数据库级别的安全策略
- ✅ **实时订阅** - 可轻松添加实时功能
- ✅ **更简单的部署** - 无需管理数据库连接
- ✅ **更少的依赖** - 移除了 Prisma、NextAuth.js 等

---

## 🚀 快速开始

### 1. 创建 Supabase 项目

访问 [https://app.supabase.com](https://app.supabase.com) 并创建新项目。

### 2. 配置环境变量

创建 `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. 运行数据库迁移

在 Supabase Dashboard 的 **SQL Editor** 中运行 `supabase/migrations/20241015_initial_schema.sql`。

### 4. 启动开发

```bash
pnpm install
pnpm dev
```

---

## 📚 详细文档

请查看 [docs/开发指南/Supabase迁移指南.md](docs/开发指南/Supabase迁移指南.md) 获取完整指南。

或快速开始：[docs/开发指南/快速开始-Supabase.md](docs/开发指南/快速开始-Supabase.md)

---

## 🎯 主要变更

| 旧方案          | 新方案              |
| --------------- | ------------------- |
| Prisma ORM      | Supabase Client     |
| NextAuth.js     | Supabase Auth       |
| PostgreSQL 直连 | Supabase 托管数据库 |
| bcryptjs        | Supabase 内置加密   |
| Session 管理    | Supabase JWT        |

---

## 🔧 开发工具

- **Supabase Dashboard**: 在线管理数据库和用户
- **SQL Editor**: 直接执行 SQL 查询
- **Table Editor**: 可视化编辑数据
- **Authentication**: 管理用户和认证提供商

---

祝开发愉快！🚀
