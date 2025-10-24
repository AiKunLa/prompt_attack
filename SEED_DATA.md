# 🌱 快速插入测试数据

## 📝 **快速开始**

### **方法一：使用自动化脚本（推荐）** ⚡

1. **注册测试用户**

   ```bash
   # 启动开发服务器
   pnpm dev

   # 访问 http://localhost:3000/login
   # 注册账号，例如: test@example.com / Test1234
   ```

2. **配置 Service Role Key**

   在 `.env.local` 中添加（从 Supabase Dashboard → Settings → API 获取）：

   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **运行种子脚本**

   ```bash
   pnpm seed
   ```

4. **查看结果**

   访问 http://localhost:3000/dashboard 查看插入的 10 条测试数据！

---

### **方法二：使用 SQL 脚本** 💾

1. **获取用户 ID**
   - Supabase Dashboard → Authentication → Users
   - 复制你的用户 ID (UUID)

2. **编辑 SQL 文件**
   - 打开 `supabase/seed.sql`
   - 将所有 `YOUR_USER_ID` 替换为实际的用户 ID

3. **执行 SQL**
   - Supabase Dashboard → SQL Editor
   - 粘贴并执行 `supabase/seed.sql` 的内容

---

## 📊 **插入的数据**

✅ **10 条测试记录**

- 5 条被拦截的攻击
- 5 条正常通过的请求
- 涵盖所有 5 种攻击类型
- 包含不同的防御级别

---

## 🎯 **预期效果**

Dashboard 中会显示：

- **总测试数**: 10
- **已拦截**: 5
- **通过**: 5
- **拦截率**: 50%

还会看到各种攻击类型的测试历史记录！

---

## ❓ **常见问题**

**Q: 报错 "没有找到用户"？**  
A: 先访问 `/login` 注册一个测试用户

**Q: 报错 "缺少 Supabase 配置"？**  
A: 在 `.env.local` 中添加 `SUPABASE_SERVICE_ROLE_KEY`

**Q: 数据插入后看不到？**  
A: 确保登录的用户和种子脚本使用的是同一个用户

---

## 📚 **详细文档**

查看 [docs/开发指南/数据库种子数据.md](docs/开发指南/数据库种子数据.md) 了解更多。

---

**祝你使用愉快！** 🎉
