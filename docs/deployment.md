# 🚀 部署文档

本文档介绍如何将 Prompt Attack & Defense Demo 部署到生产环境。

## 目录

- [部署前准备](#部署前准备)
- [部署方式](#部署方式)
- [Docker 部署](#docker-部署)
- [传统服务器部署](#传统服务器部署)
- [云平台部署](#云平台部署)
- [环境配置](#环境配置)
- [监控与维护](#监控与维护)
- [安全加固](#安全加固)
- [故障排查](#故障排查)

---

## 部署前准备

### 检查清单

- [ ] 代码已通过所有测试
- [ ] 已配置生产环境变量
- [ ] 已准备 LLM API Key
- [ ] 已设置域名和 SSL 证书
- [ ] 已准备数据库（如需要）
- [ ] 已配置监控和日志系统
- [ ] 已准备备份方案

### 系统要求

#### 最低配置

- **CPU**: 1 核
- **内存**: 1 GB
- **存储**: 10 GB
- **带宽**: 1 Mbps

#### 推荐配置

- **CPU**: 2 核
- **内存**: 4 GB
- **存储**: 20 GB
- **带宽**: 10 Mbps

### 软件要求

- **操作系统**: Linux (Ubuntu 20.04+, CentOS 8+) / macOS / Windows Server
- **Node.js**: >= 18.0.0
- **数据库**: MongoDB 5.0+ 或 PostgreSQL 14+ (可选)
- **反向代理**: Nginx / Apache
- **进程管理**: PM2 / systemd
- **容器**: Docker 20+ (可选)

---

## 部署方式

### 方式对比

| 方式 | 优点 | 缺点 | 适用场景 |
|-----|------|------|---------|
| **Docker** | 环境一致、易于管理 | 需要学习 Docker | 推荐 |
| **传统部署** | 简单直接 | 环境配置复杂 | 小型项目 |
| **云平台** | 自动扩展、高可用 | 成本较高 | 生产环境 |

---

## Docker 部署

### 创建 Dockerfile

#### 后端 Dockerfile

```dockerfile
# backend/Dockerfile

FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "src/server.js"]
```

#### 前端 Dockerfile

```dockerfile
# frontend/Dockerfile

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx 配置

```nginx
# frontend/nginx.conf

server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker Compose 配置

```yaml
# docker-compose.yml

version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: promptattack-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - LLM_PROVIDER=${LLM_PROVIDER}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    networks:
      - app-network
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: promptattack-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app-network

  mongodb:
    image: mongo:6
    container_name: promptattack-mongodb
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongodb-data:/data/db
    restart: unless-stopped
    networks:
      - app-network

  # Redis 缓存（可选）
  redis:
    image: redis:7-alpine
    container_name: promptattack-redis
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongodb-data:
```

### 环境变量配置

```env
# .env.production

# LLM 配置
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-production-key

# 数据库配置
MONGO_USERNAME=admin
MONGO_PASSWORD=your-secure-password
DATABASE_URL=mongodb://admin:your-secure-password@mongodb:27017/promptattack?authSource=admin

# Redis 配置
REDIS_URL=redis://redis:6379

# 安全配置
ENABLE_API_KEY_AUTH=true
API_KEY_SECRET=your-secret-key-change-this

# 日志配置
LOG_LEVEL=warn
```

### 部署命令

```bash
# 1. 构建镜像
docker-compose build

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 查看状态
docker-compose ps

# 5. 停止服务
docker-compose down

# 6. 重启服务
docker-compose restart

# 7. 更新服务
docker-compose pull
docker-compose up -d --build
```

### Docker 优化

#### 多阶段构建

```dockerfile
# 优化的 backend Dockerfile

# 构建依赖缓存层
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 最终镜像
FROM node:18-alpine
WORKDIR /app

# 只复制必要文件
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

# 使用非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
CMD ["node", "src/server.js"]
```

#### .dockerignore

```
# .dockerignore

node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
README.md
docs
tests
*.test.js
.vscode
.DS_Store
```

---

## 传统服务器部署

### 1. 准备服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Git
sudo apt install -y git

# 安装 Nginx
sudo apt install -y nginx

# 安装 PM2
sudo npm install -g pm2
```

### 2. 克隆代码

```bash
# 创建应用目录
sudo mkdir -p /var/www/promptattack
sudo chown $USER:$USER /var/www/promptattack

# 克隆代码
cd /var/www/promptattack
git clone https://github.com/yourusername/promptAttack.git .
```

### 3. 部署后端

```bash
cd /var/www/promptattack/backend

# 安装依赖
npm ci --only=production

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 使用 PM2 启动
pm2 start src/server.js --name promptattack-backend

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs promptattack-backend
```

#### PM2 配置文件

```javascript
// ecosystem.config.js

module.exports = {
  apps: [{
    name: 'promptattack-backend',
    script: 'src/server.js',
    cwd: '/var/www/promptattack/backend',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/promptattack/error.log',
    out_file: '/var/log/promptattack/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};

// 使用配置文件启动
// pm2 start ecosystem.config.js
```

### 4. 部署前端

```bash
cd /var/www/promptattack/frontend

# 安装依赖
npm ci

# 配置环境变量
cp .env.example .env.production
nano .env.production

# 构建
npm run build

# 复制到 Nginx 目录
sudo cp -r dist/* /var/www/html/promptattack/
```

### 5. 配置 Nginx

```nginx
# /etc/nginx/sites-available/promptattack

server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/html/promptattack;
        try_files $uri $uri/ /index.html;
        
        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # API 代理到后端
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss text/javascript;

    # 日志
    access_log /var/log/nginx/promptattack-access.log;
    error_log /var/log/nginx/promptattack-error.log;
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/promptattack /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 6. 配置 SSL (Let's Encrypt)

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

Certbot 会自动更新 Nginx 配置为 HTTPS。

---

## 云平台部署

### Vercel 部署（前端）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 配置 vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-domain.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

#### 3. 部署

```bash
cd frontend
vercel

# 生产部署
vercel --prod
```

### Heroku 部署（后端）

#### 1. 安装 Heroku CLI

```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 2. 创建 Procfile

```
web: node src/server.js
```

#### 3. 部署

```bash
cd backend

# 登录 Heroku
heroku login

# 创建应用
heroku create your-app-name

# 设置环境变量
heroku config:set NODE_ENV=production
heroku config:set OPENAI_API_KEY=your-key

# 部署
git push heroku main

# 查看日志
heroku logs --tail
```

### Railway 部署

#### 1. 连接 GitHub

访问 [Railway](https://railway.app/)，连接你的 GitHub 仓库。

#### 2. 配置环境变量

在 Railway 控制台设置：
- `NODE_ENV=production`
- `OPENAI_API_KEY=your-key`
- 其他必要的环境变量

#### 3. 自动部署

Railway 会自动检测 `package.json` 并部署。

### AWS EC2 部署

#### 1. 启动实例

- 选择 Ubuntu 20.04 LTS
- 实例类型: t2.micro (免费套餐) 或 t2.small
- 配置安全组: 开放 80, 443, 22 端口

#### 2. 连接实例

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 3. 按照传统服务器部署步骤进行

### 使用 GitHub Actions 自动部署

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    # 部署后端
    - name: Deploy Backend
      run: |
        cd backend
        npm ci --only=production
        # 部署到服务器的命令
    
    # 构建前端
    - name: Build Frontend
      run: |
        cd frontend
        npm ci
        npm run build
    
    # 部署前端到 Vercel/Netlify
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID}}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID}}
        vercel-args: '--prod'
        working-directory: ./frontend
```

---

## 环境配置

### 生产环境变量检查表

```env
# 必须配置
NODE_ENV=production
PORT=3000
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxx

# 安全配置
ENABLE_API_KEY_AUTH=true
API_KEY_SECRET=long-random-secret
JWT_SECRET=another-random-secret
CORS_ORIGIN=https://your-domain.com

# 数据库
DATABASE_URL=mongodb://user:pass@host:27017/db

# 速率限制
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=30

# 日志
LOG_LEVEL=warn
LOG_FILE=/var/log/promptattack/app.log

# 监控（可选）
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 配置验证脚本

```javascript
// scripts/validate-config.js

const requiredVars = [
  'NODE_ENV',
  'PORT',
  'LLM_PROVIDER',
  'OPENAI_API_KEY'
];

const missing = requiredVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('Missing required environment variables:');
  missing.forEach(key => console.error(`  - ${key}`));
  process.exit(1);
}

console.log('✅ All required environment variables are set');
```

运行验证：
```bash
node scripts/validate-config.js
```

---

## 监控与维护

### 应用监控

#### PM2 监控

```bash
# 查看实时监控
pm2 monit

# 查看详细信息
pm2 show promptattack-backend

# 查看日志
pm2 logs

# 重启应用
pm2 restart promptattack-backend

# 零停机重启
pm2 reload promptattack-backend
```

#### 使用 PM2 Plus

```bash
# 连接到 PM2 Plus
pm2 link <secret> <public>

# 查看 https://app.pm2.io
```

### 日志管理

#### 配置日志轮转

```bash
# 安装 logrotate
sudo apt install logrotate

# 创建配置
sudo nano /etc/logrotate.d/promptattack
```

```
/var/log/promptattack/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 性能监控

#### 使用 New Relic

```bash
# 安装 New Relic agent
npm install newrelic --save

# 在应用入口添加
// 在最顶部
require('newrelic');
```

#### 自定义健康检查

```javascript
// src/routes/health.js

router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {}
  };
  
  // 检查数据库
  try {
    await db.ping();
    health.services.database = 'up';
  } catch (error) {
    health.services.database = 'down';
    health.status = 'degraded';
  }
  
  // 检查 LLM 服务
  try {
    await llmService.ping();
    health.services.llm = 'up';
  } catch (error) {
    health.services.llm = 'down';
    health.status = 'degraded';
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### 备份策略

#### 数据库备份

```bash
#!/bin/bash
# scripts/backup-db.sh

BACKUP_DIR="/var/backups/promptattack"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.gz"

# 创建备份
mongodump --uri="$DATABASE_URL" --archive="$BACKUP_FILE" --gzip

# 保留最近 30 天的备份
find $BACKUP_DIR -name "backup_*.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

设置定时任务：
```bash
# 每天凌晨 2 点备份
0 2 * * * /var/www/promptattack/scripts/backup-db.sh
```

---

## 安全加固

### 1. 环境隔离

- 不要在代码中硬编码密钥
- 使用环境变量或密钥管理服务
- 定期轮换密钥

### 2. 网络安全

```bash
# 配置防火墙
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### 3. HTTPS 强制

```nginx
# Nginx 配置
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 4. 安全头

```javascript
// 使用 helmet 中间件
const helmet = require('helmet');
app.use(helmet());
```

### 5. 速率限制

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 限制 100 次请求
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/', limiter);
```

### 6. 输入验证

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/test-attack',
  [
    body('input').isString().isLength({ min: 1, max: 2000 }),
    body('defenseLevel').isIn(['none', 'low', 'medium', 'high'])
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // 处理请求
  }
);
```

---

## 故障排查

### 常见问题

#### 1. 应用无法启动

**检查步骤**:
```bash
# 查看日志
pm2 logs --err
docker-compose logs

# 检查端口占用
lsof -i :3000

# 检查环境变量
printenv | grep OPENAI
```

#### 2. 数据库连接失败

```bash
# 检查数据库状态
sudo systemctl status mongodb

# 测试连接
mongo --eval 'db.runCommand({ ping: 1 })'
```

#### 3. Nginx 502 错误

```bash
# 检查后端是否运行
curl http://localhost:3000/api/health

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

#### 4. 内存不足

```bash
# 查看内存使用
free -h

# 重启应用释放内存
pm2 restart all
```

### 监控脚本

```bash
#!/bin/bash
# scripts/monitor.sh

# 检查服务状态
check_service() {
    if ! pm2 list | grep -q "online"; then
        echo "应用已停止，正在重启..."
        pm2 restart all
    fi
}

# 检查磁盘空间
check_disk() {
    USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $USAGE -gt 80 ]; then
        echo "警告：磁盘使用率 ${USAGE}%"
        # 发送告警
    fi
}

# 检查 API 健康
check_api() {
    if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "API 健康检查失败"
        # 发送告警
    fi
}

check_service
check_disk
check_api
```

---

## 更新和回滚

### 更新流程

```bash
#!/bin/bash
# scripts/deploy.sh

echo "开始部署..."

# 1. 备份当前版本
BACKUP_DIR="/var/backups/promptattack/code"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" /var/www/promptattack

# 2. 拉取最新代码
cd /var/www/promptattack
git pull origin main

# 3. 安装依赖
cd backend
npm ci --only=production

cd ../frontend
npm ci
npm run build

# 4. 重启服务
pm2 reload promptattack-backend

# 5. 复制前端文件
sudo cp -r dist/* /var/www/html/promptattack/

# 6. 重载 Nginx
sudo nginx -s reload

echo "部署完成！"
```

### 回滚流程

```bash
#!/bin/bash
# scripts/rollback.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "用法: ./rollback.sh <backup_file>"
    exit 1
fi

echo "开始回滚到: $BACKUP_FILE"

# 停止服务
pm2 stop all

# 恢复备份
tar -xzf "$BACKUP_FILE" -C /

# 重启服务
pm2 restart all

echo "回滚完成！"
```

---

## 总结

### 部署最佳实践

1. ✅ 使用 Docker 实现环境一致性
2. ✅ 配置 HTTPS 和安全头
3. ✅ 实施速率限制和输入验证
4. ✅ 设置监控和告警
5. ✅ 定期备份数据
6. ✅ 使用 CI/CD 自动化部署
7. ✅ 准备回滚方案

### 检查清单

部署前：
- [ ] 测试通过
- [ ] 环境变量配置
- [ ] 备份方案就绪
- [ ] 监控已设置

部署后：
- [ ] 健康检查通过
- [ ] 日志正常
- [ ] 性能测试
- [ ] 安全扫描

---

## 支持

如有问题，请查看：
- [GitHub Issues](https://github.com/yourusername/promptAttack/issues)
- [文档](../docs/)
- [社区讨论](https://github.com/yourusername/promptAttack/discussions)

祝部署顺利！🚀

