# 🗄️ Supabase 配置指南

使用 Supabase 作为项目数据库的完整配置指南。

## 📋 什么是 Supabase？

**Supabase** 是一个开源的 Firebase 替代品，提供：

- ✅ 托管的 PostgreSQL 数据库
- ✅ 自动 API 生成
- ✅ 实时订阅
- ✅ 认证服务
- ✅ 存储服务
- ✅ Edge Functions

本项目使用 Supabase 作为 PostgreSQL 数据库托管服务。

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com)
2. 注册/登录账户
3. 点击 **"New Project"**
4. 填写项目信息：
   - **Name**: `prompt-attack`
   - **Database Password**: 设置一个强密码（保存好！）
   - **Region**: 选择离你最近的区域（如 `Northeast Asia (Tokyo)`）
   - **Pricing Plan**: 选择 `Free`（每月免费额度足够开发使用）
5. 点击 **"Create new project"**
6. 等待项目初始化（约 2 分钟）

### 2. 获取数据库连接信息

项目创建完成后：

1. 进入项目 Dashboard
2. 点击左侧菜单 **"Settings"** ⚙️
3. 选择 **"Database"**
4. 找到 **"Connection string"** 部分

你会看到两种连接字符串：

#### Connection Pooling（推荐用于生产环境）

```
postgres://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Direct Connection（用于迁移和管理）

```
postgres://postgres.[project-ref]:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# Supabase Database
# 从 Supabase Dashboard -> Settings -> Database 获取
DATABASE_URL="postgres://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgres://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# OpenAI (可选)
OPENAI_API_KEY=""
```

**重要说明**：

- `DATABASE_URL`: 使用 **Connection Pooling**（6543 端口），用于应用查询
- `DIRECT_URL`: 使用 **Direct Connection**（5432 端口），用于 Prisma 迁移
- 将 `[YOUR-PASSWORD]` 替换为你创建项目时设置的密码
- 将 `[project-ref]` 和 `[region]` 替换为你的实际值

### 4. 初始化数据库

运行 Prisma 迁移创建表结构：

```bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 到数据库
npx prisma db push

# 或者使用迁移（生产环境推荐）
npx prisma migrate dev --name init
```

### 5. 验证连接

打开 Prisma Studio 查看数据库：

```bash
npx prisma studio
```

访问 `http://localhost:5555`，你应该能看到所有表结构。

## 🔑 环境变量详解

### DATABASE_URL（Connection Pooling）

```env
DATABASE_URL="postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**用途**: 应用运行时的数据库连接

**特点**:

- 使用 PgBouncer 连接池
- 端口 `6543`
- 支持高并发连接
- 适合 Serverless 环境（Vercel）
- `connection_limit=1` 限制每个连接的并发数

### DIRECT_URL（Direct Connection）

```env
DIRECT_URL="postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

**用途**: Prisma 迁移和数据库管理

**特点**:

- 直连数据库
- 端口 `5432`（标准 PostgreSQL 端口）
- 用于 `prisma migrate`、`prisma db push` 等命令
- 不经过连接池

## 📊 在 Supabase Dashboard 中管理数据

### Table Editor

1. 打开 Supabase Dashboard
2. 选择 **"Table Editor"**
3. 可以可视化查看和编辑数据

### SQL Editor

1. 选择 **"SQL Editor"**
2. 可以运行自定义 SQL 查询

示例查询：

```sql
-- 查看所有用户
SELECT * FROM "User";

-- 查看攻击测试记录
SELECT * FROM "AttackTest" ORDER BY "createdAt" DESC LIMIT 10;

-- 统计数据
SELECT
  "attackType",
  COUNT(*) as count,
  AVG("threatScore") as avg_score
FROM "AttackTest"
GROUP BY "attackType";
```

## 🔒 安全配置

### 1. 启用行级安全 (RLS)

Supabase 默认启用 RLS，但你可以在 Dashboard 中配置：

1. 打开 **"Authentication"** -> **"Policies"**
2. 为每个表创建安全策略

示例策略（用户只能查看自己的数据）：

```sql
-- 用户只能读取自己的攻击测试
CREATE POLICY "Users can view own tests"
ON "AttackTest"
FOR SELECT
USING (auth.uid()::text = "userId");

-- 用户只能插入自己的数据
CREATE POLICY "Users can insert own tests"
ON "AttackTest"
FOR INSERT
WITH CHECK (auth.uid()::text = "userId");
```

**注意**: 由于我们使用 NextAuth.js 而非 Supabase Auth，RLS 可能需要自定义配置或禁用。

### 2. API 密钥管理

在 **"Settings"** -> **"API"** 中可以看到：

- **anon public** - 客户端使用（如果使用 Supabase 客户端库）
- **service_role secret** - 服务端使用（绝不暴露给客户端）

**本项目不需要这些密钥**，因为我们通过 Prisma 直连数据库。

### 3. 数据库连接限制

Supabase Free Plan 限制：

- 同时连接数：最多 60 个
- 存储空间：500 MB
- 带宽：5 GB/月

使用 Connection Pooling 可以有效管理连接数。

## 📈 监控和性能

### 1. Database 使用情况

在 **"Settings"** -> **"Database"** 中查看：

- 存储使用量
- 连接数
- 数据库大小

### 2. 查询性能

使用 Prisma 的查询日志：

```typescript
// src/lib/db.ts
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});
```

### 3. Slow Query 分析

在 SQL Editor 中运行：

```sql
-- 查看慢查询
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## 🚀 部署到 Vercel

### 1. 在 Vercel 中配置环境变量

在 Vercel Dashboard 中添加：

```env
DATABASE_URL=your_connection_pooling_url
DIRECT_URL=your_direct_connection_url
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_production_secret
```

### 2. 构建命令

确保 `package.json` 中有：

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

这会在构建时自动生成 Prisma Client。

## 🔄 数据迁移

### 从本地 PostgreSQL 迁移到 Supabase

如果你已有本地数据需要迁移：

#### 方法 1: 使用 pg_dump

```bash
# 1. 导出本地数据
pg_dump -h localhost -U postgres -d promptattack -Fc -f backup.dump

# 2. 导入到 Supabase
pg_restore -h aws-0-[region].pooler.supabase.com \
  -U postgres.[project-ref] \
  -d postgres \
  -p 5432 \
  backup.dump
```

#### 方法 2: 使用 Prisma

```bash
# 1. 在本地运行迁移
DATABASE_URL="local_url" npx prisma migrate dev

# 2. 在 Supabase 运行迁移
DATABASE_URL="supabase_url" npx prisma migrate deploy
```

## 🧪 测试连接

创建测试脚本 `scripts/test-db.ts`：

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Supabase connection...');

  // 测试连接
  const result = await prisma.$queryRaw`SELECT version()`;
  console.log('✅ Connected to:', result);

  // 测试创建
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });
  console.log('✅ Created user:', user);

  // 清理测试数据
  await prisma.user.delete({ where: { id: user.id } });
  console.log('✅ Cleanup complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

运行测试：

```bash
npx tsx scripts/test-db.ts
```

## 📚 常见问题

### 问题 1: 连接超时

```
Error: P1001: Can't reach database server
```

**解决方案**:

- 检查数据库密码是否正确
- 确认网络连接
- 检查 Supabase 项目是否处于暂停状态（Free Plan 会在不活动后暂停）

### 问题 2: 连接池耗尽

```
Error: Too many connections
```

**解决方案**:

- 确保使用 `DATABASE_URL` 而非 `DIRECT_URL` 进行查询
- 在 Prisma Client 中正确关闭连接
- 添加 `connection_limit=1` 参数

### 问题 3: 迁移失败

```
Error: Migration failed
```

**解决方案**:

- 使用 `DIRECT_URL` 运行迁移
- 确保没有其他进程占用连接
- 检查 schema 语法

## 🎯 最佳实践

1. **开发环境**: 可以使用本地 PostgreSQL 或 Supabase
2. **生产环境**: 使用 Supabase Connection Pooling
3. **迁移**: 始终使用 `DIRECT_URL`
4. **查询**: 始终使用 `DATABASE_URL`
5. **备份**: 定期在 Supabase Dashboard 中创建备份
6. **监控**: 关注连接数和存储使用量
7. **安全**: 绝不将数据库密码提交到 Git

## 📖 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase + Prisma 指南](https://supabase.com/docs/guides/integrations/prisma)
- [Prisma Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Vercel + Supabase 部署](https://vercel.com/guides/using-supabase-with-vercel)

---

**最后更新**: 2025-01-15
**维护者**: 项目团队
