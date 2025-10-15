# 🏗️ 系统架构文档

本文档详细介绍 Prompt Attack & Defense Demo 的系统架构、技术选型和设计决策。

## 目录

- [整体架构](#整体架构)
- [前端架构](#前端架构)
- [后端架构](#后端架构)
- [数据流](#数据流)
- [核心模块详解](#核心模块详解)
- [技术选型](#技术选型)
- [扩展性设计](#扩展性设计)

---

## 整体架构

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户界面 (Browser)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │             React Frontend (Port 5173)                   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │ │
│  │  │ Attack   │  │ Defense  │  │ Result   │  │ Example │ │ │
│  │  │ Demo     │  │ Panel    │  │ Display  │  │ Selector│ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                    Backend Server (Port 3000)                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                      API Layer                           │ │
│  │    ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │ │
│  │    │ Routes   │  │ Auth     │  │ Rate Limiter     │    │ │
│  │    └──────────┘  └──────────┘  └──────────────────┘    │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Defense System                         │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌───────────┐ │ │
│  │  │ Input          │→ │ Prompt         │→ │ Output    │ │ │
│  │  │ Validator      │  │ Armor          │  │ Filter    │ │ │
│  │  └────────────────┘  └────────────────┘  └───────────┘ │ │
│  │         ↓                    ↓                   ↑      │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │         Context Isolation & Session Tracker     │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                      AI Service Layer                    │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐  │ │
│  │  │ OpenAI  │  │ Claude  │  │ Ollama  │  │ Custom   │  │ │
│  │  │ Provider│  │ Provider│  │ Provider│  │ Provider │  │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └──────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                      Data Layer                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │ │
│  │  │ Attack      │  │ Defense     │  │ Test Results   │  │ │
│  │  │ Examples    │  │ Configs     │  │ History        │  │ │
│  │  └─────────────┘  └─────────────┘  └────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ API Calls
┌─────────────────────────────────────────────────────────────┐
│                   External LLM Services                       │
│        OpenAI API / Anthropic API / Local Models             │
└─────────────────────────────────────────────────────────────┘
```

### 架构特点

1. **前后端分离**：解耦前端展示和后端逻辑
2. **模块化设计**：每个模块职责单一，易于维护和扩展
3. **多层防御**：防御系统分为4个独立层次
4. **可插拔 AI 服务**：支持多种 LLM 提供商
5. **数据持久化**：保存测试历史和配置

---

## 前端架构

### 技术栈

- **框架**: React 18+
- **构建工具**: Vite
- **样式**: TailwindCSS
- **状态管理**: React Hooks (useState, useContext)
- **HTTP 客户端**: Fetch API / Axios

### 目录结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── AttackDemo.jsx           # 主攻击演示组件
│   │   ├── DefensePanel.jsx         # 防御配置面板
│   │   ├── ResultDisplay.jsx        # 结果展示组件
│   │   ├── ExampleSelector.jsx      # 示例选择器
│   │   ├── ThreatScoreMeter.jsx     # 威胁评分仪表盘
│   │   └── ComparisonView.jsx       # 对比视图
│   ├── hooks/
│   │   ├── useAttackTest.js         # 攻击测试钩子
│   │   └── useDefenseConfig.js      # 防御配置钩子
│   ├── services/
│   │   └── api.js                   # API 调用服务
│   ├── utils/
│   │   ├── formatters.js            # 格式化工具
│   │   └── validators.js            # 验证工具
│   ├── styles/
│   │   └── global.css               # 全局样式
│   ├── App.jsx                      # 应用根组件
│   └── main.jsx                     # 入口文件
├── public/
├── index.html
├── vite.config.js
└── package.json
```

### 核心组件设计

#### 1. AttackDemo 组件

```jsx
/**
 * 主攻击演示组件
 * 
 * 职责：
 * - 接收用户输入
 * - 选择攻击类型和防御等级
 * - 触发测试并展示结果
 */
function AttackDemo() {
  const [input, setInput] = useState('');
  const [defenseLevel, setDefenseLevel] = useState('none');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { testAttack } = useAttackTest();
  
  const handleSubmit = async () => {
    setLoading(true);
    const result = await testAttack(input, defenseLevel);
    setResult(result);
    setLoading(false);
  };
  
  return (
    <div className="attack-demo">
      {/* 输入区域 */}
      {/* 配置区域 */}
      {/* 结果展示 */}
    </div>
  );
}
```

#### 2. ResultDisplay 组件

```jsx
/**
 * 结果展示组件
 * 
 * 展示：
 * - 输入验证结果
 * - AI 响应
 * - 输出分析
 * - 威胁评分
 */
function ResultDisplay({ result }) {
  return (
    <div className="result-display">
      <ThreatScoreMeter score={result.threatScore} />
      <InputAnalysis data={result.inputAnalysis} />
      <AIResponse response={result.aiResponse} />
      <OutputAnalysis data={result.outputAnalysis} />
    </div>
  );
}
```

### 状态管理

使用 React Context 管理全局状态：

```jsx
// contexts/AppContext.jsx
const AppContext = createContext();

export function AppProvider({ children }) {
  const [globalConfig, setGlobalConfig] = useState({
    defenseLevel: 'medium',
    llmProvider: 'openai',
    showDetails: true
  });
  
  return (
    <AppContext.Provider value={{ globalConfig, setGlobalConfig }}>
      {children}
    </AppContext.Provider>
  );
}
```

---

## 后端架构

### 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **语言**: JavaScript (可选 TypeScript)
- **HTTP 客户端**: Axios
- **数据存储**: JSON 文件 / MongoDB (可选)

### 目录结构

```
backend/
├── src/
│   ├── routes/
│   │   ├── attack.routes.js         # 攻击测试路由
│   │   ├── config.routes.js         # 配置管理路由
│   │   └── analytics.routes.js      # 分析统计路由
│   ├── controllers/
│   │   ├── attackController.js      # 攻击测试控制器
│   │   └── configController.js      # 配置控制器
│   ├── services/
│   │   ├── defenseService.js        # 防御服务
│   │   └── analyticsService.js      # 分析服务
│   ├── attacks/
│   │   ├── promptInjection.js       # 提示词注入
│   │   ├── jailbreak.js             # 越狱攻击
│   │   ├── contextOverflow.js       # 上下文溢出
│   │   ├── roleManipulation.js      # 角色操纵
│   │   ├── delimiterAttack.js       # 分隔符攻击
│   │   └── index.js                 # 攻击模块导出
│   ├── defenses/
│   │   ├── inputValidator.js        # 输入验证器
│   │   ├── promptArmor.js           # 提示词加固
│   │   ├── outputFilter.js          # 输出过滤器
│   │   ├── contextIsolation.js      # 上下文隔离
│   │   └── defenseSystem.js         # 防御系统集成
│   ├── ai/
│   │   ├── llmService.js            # LLM 服务抽象
│   │   └── providers/
│   │       ├── openai.provider.js   # OpenAI 提供商
│   │       ├── claude.provider.js   # Claude 提供商
│   │       └── ollama.provider.js   # Ollama 提供商
│   ├── middleware/
│   │   ├── errorHandler.js          # 错误处理
│   │   ├── rateLimiter.js           # 速率限制
│   │   └── logger.js                # 日志记录
│   ├── utils/
│   │   ├── validator.js             # 验证工具
│   │   └── logger.js                # 日志工具
│   ├── models/                      # 数据模型（如果使用数据库）
│   ├── config.js                    # 配置文件
│   └── server.js                    # 服务器入口
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
└── README.md
```

### 核心模块设计

#### 1. Attack Controller

```javascript
/**
 * 攻击测试控制器
 * 
 * 职责：
 * - 接收前端请求
 * - 调用防御系统
 * - 返回测试结果
 */
class AttackController {
  async testAttack(req, res) {
    try {
      const { input, defenseLevel, sessionId } = req.body;
      
      // 初始化防御系统
      const defenseSystem = new DefenseSystem(defenseLevel);
      
      // 处理请求
      const result = await defenseSystem.process(input, sessionId);
      
      // 记录日志
      logger.logAttackAttempt(sessionId, result);
      
      // 返回结果
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
```

#### 2. Defense System

```javascript
/**
 * 防御系统集成
 * 
 * 职责：
 * - 协调各防御层
 * - 执行完整的防御流程
 * - 返回综合结果
 */
class DefenseSystem {
  constructor(level = 'medium') {
    this.level = level;
    this.config = DEFENSE_LEVELS[level];
    this.setupComponents();
  }
  
  setupComponents() {
    // 初始化各防御层
    if (this.config.inputValidation) {
      this.inputValidator = new InputValidator(this.config.inputConfig);
    }
    
    if (this.config.promptArmor) {
      this.promptArmor = new PromptArmor(this.config.promptLevel);
    }
    
    if (this.config.outputFilter) {
      this.outputFilter = new OutputFilter(this.config.outputConfig);
    }
    
    if (this.config.contextIsolation) {
      this.contextIsolator = new ContextIsolation();
      this.sessionTracker = new SessionTracker();
    }
    
    // 初始化 LLM 服务
    this.llmService = new LLMService();
  }
  
  async process(userInput, sessionId) {
    const result = {
      level: this.level,
      stages: {},
      timestamp: Date.now()
    };
    
    // 执行防御流程
    // ... (见防御策略文档)
    
    return result;
  }
}
```

#### 3. LLM Service

```javascript
/**
 * LLM 服务抽象层
 * 
 * 职责：
 * - 提供统一的 LLM 调用接口
 * - 支持多个 LLM 提供商
 * - 处理错误和重试
 */
class LLMService {
  constructor() {
    this.providers = {
      openai: new OpenAIProvider(),
      claude: new ClaudeProvider(),
      ollama: new OllamaProvider()
    };
    
    this.currentProvider = process.env.LLM_PROVIDER || 'openai';
  }
  
  async call(prompt, options = {}) {
    const provider = this.providers[this.currentProvider];
    
    if (!provider) {
      throw new Error(`Provider ${this.currentProvider} not found`);
    }
    
    try {
      const response = await provider.complete(prompt, options);
      return response;
    } catch (error) {
      console.error('LLM call failed:', error);
      throw error;
    }
  }
  
  switchProvider(providerName) {
    if (this.providers[providerName]) {
      this.currentProvider = providerName;
    }
  }
}
```

---

## 数据流

### 完整请求流程

```
1. 用户输入
   ↓
2. 前端验证（基础）
   ↓
3. 发送 HTTP 请求到后端
   ↓
4. API 路由接收请求
   ↓
5. 中间件处理（认证、速率限制）
   ↓
6. Controller 接收请求
   ↓
7. Defense System 处理
   │
   ├─→ 第一层：Input Validator
   │   ├─ 关键词检测
   │   ├─ 长度验证
   │   ├─ 字符分析
   │   └─ 清理输入
   │
   ├─→ 第二层：Prompt Armor
   │   └─ 构建加固的提示词
   │
   ├─→ 第三层：Context Isolation
   │   ├─ 检查会话状态
   │   └─ 隔离上下文
   │
   ├─→ 调用 LLM Service
   │   ├─ 选择提供商
   │   ├─ 发送请求
   │   └─ 接收响应
   │
   └─→ 第四层：Output Filter
       ├─ 角色一致性检查
       ├─ 信息泄露检测
       └─ 内容安全检查
   ↓
8. 记录日志和统计
   ↓
9. 返回结果给前端
   ↓
10. 前端展示结果
```

### 数据结构

#### 请求格式

```typescript
interface AttackTestRequest {
  input: string;              // 用户输入
  defenseLevel: string;       // 防御等级
  sessionId?: string;         // 会话 ID
  llmProvider?: string;       // LLM 提供商
  options?: {
    systemPrompt?: string;    // 自定义系统提示
    temperature?: number;     // 温度参数
    maxTokens?: number;       // 最大 token 数
  };
}
```

#### 响应格式

```typescript
interface AttackTestResponse {
  success: boolean;
  data: {
    blocked: boolean;
    blockReason?: string;
    blockStage?: string;
    
    stages: {
      inputValidation?: {
        passed: boolean;
        score: number;
        threats: Threat[];
        sanitized?: string;
      };
      
      promptArmor?: {
        applied: boolean;
        level: string;
      };
      
      contextIsolation?: {
        sessionBlocked: boolean;
        attackAttempts: number;
      };
      
      outputFilter?: {
        safe: boolean;
        issues: Issue[];
        filteredOutput?: string;
      };
    };
    
    llmResponse?: string;
    finalResponse: string;
    
    metrics: {
      totalTime: number;
      llmTime: number;
      defenseTime: number;
    };
  };
}
```

---

## 核心模块详解

### 1. Input Validator（输入验证器）

**输入**: 用户原始输入
**输出**: 验证结果 + 清理后的输入

**核心算法**:
1. 模式匹配检测危险关键词
2. 统计分析（长度、字符密度）
3. 特征提取（编码、重复）
4. 评分系统综合判断

### 2. Prompt Armor（提示词加固）

**输入**: 系统提示 + 用户输入
**输出**: 加固后的完整提示

**加固策略**:
1. 添加明确分隔符
2. 重复关键指令
3. 强化角色定义
4. 添加防御性提示
5. 使用元认知指令

### 3. Output Filter（输出过滤器）

**输入**: LLM 原始输出
**输出**: 过滤分析结果 + 安全输出

**检测项目**:
1. 角色一致性
2. 信息泄露
3. 内容安全
4. 行为异常

### 4. Context Isolation（上下文隔离）

**输入**: 系统提示 + 用户输入 + 会话信息
**输出**: 隔离的上下文 + 会话状态

**隔离机制**:
1. 标记化分隔
2. 会话追踪
3. 沙箱执行
4. 状态管理

---

## 技术选型

### 前端

| 需求 | 选择 | 理由 |
|-----|------|------|
| UI 框架 | React | 组件化、生态成熟 |
| 构建工具 | Vite | 快速、现代化 |
| 样式方案 | TailwindCSS | 快速开发、一致性好 |
| 状态管理 | React Hooks | 轻量、够用 |

### 后端

| 需求 | 选择 | 理由 |
|-----|------|------|
| 运行时 | Node.js | JavaScript 全栈、异步 I/O |
| 框架 | Express | 简单、灵活、中间件丰富 |
| LLM SDK | 官方 SDK | 稳定、文档完善 |
| 数据存储 | JSON 文件 | 简单、适合 demo |

### 可选升级

| 组件 | 生产级选择 | 理由 |
|-----|-----------|------|
| 数据库 | MongoDB / PostgreSQL | 持久化、查询能力 |
| 缓存 | Redis | 提升性能 |
| 队列 | Bull / RabbitMQ | 异步处理 |
| 监控 | Prometheus + Grafana | 可观测性 |
| 日志 | ELK Stack | 集中式日志 |

---

## 扩展性设计

### 1. 新增攻击类型

```javascript
// src/attacks/newAttack.js
class NewAttackType {
  constructor() {
    this.name = 'New Attack';
    this.description = 'Description';
  }
  
  generateExamples() {
    return [
      'Example 1',
      'Example 2'
    ];
  }
}

// 在 src/attacks/index.js 中注册
export const attackTypes = {
  // ... existing
  newAttack: new NewAttackType()
};
```

### 2. 新增防御策略

```javascript
// src/defenses/newDefense.js
class NewDefenseStrategy {
  check(input) {
    // 实现检测逻辑
    return {
      passed: true,
      score: 0
    };
  }
}

// 在 DefenseSystem 中集成
if (this.config.newDefense) {
  this.newDefense = new NewDefenseStrategy();
}
```

### 3. 新增 LLM 提供商

```javascript
// src/ai/providers/newProvider.js
class NewLLMProvider {
  async complete(prompt, options) {
    // 实现调用逻辑
    const response = await this.api.call(prompt, options);
    return response.text;
  }
}

// 在 LLMService 中注册
this.providers.newProvider = new NewLLMProvider();
```

### 4. 插件系统（未来）

```javascript
class PluginSystem {
  constructor() {
    this.plugins = new Map();
  }
  
  register(name, plugin) {
    this.plugins.set(name, plugin);
  }
  
  async execute(hook, context) {
    for (const [name, plugin] of this.plugins) {
      if (plugin[hook]) {
        await plugin[hook](context);
      }
    }
  }
}
```

---

## 安全考虑

### 1. API 安全

- Rate Limiting: 防止滥用
- Authentication: API 密钥验证
- CORS: 跨域配置
- Input Sanitization: 输入清理

### 2. 数据安全

- 不记录敏感信息
- 加密存储 API 密钥
- 定期清理测试数据

### 3. LLM 调用安全

- 超时控制
- Token 限制
- 成本监控
- 错误处理

---

## 性能优化

### 1. 缓存策略

```javascript
// 缓存攻击示例
const exampleCache = new Map();

function getExamples(type) {
  if (!exampleCache.has(type)) {
    const examples = loadExamplesFromFile(type);
    exampleCache.set(type, examples);
  }
  return exampleCache.get(type);
}
```

### 2. 并发控制

```javascript
// 限制并发 LLM 调用
const pLimit = require('p-limit');
const limit = pLimit(5); // 最多5个并发

const promises = inputs.map(input =>
  limit(() => llmService.call(input))
);
```

### 3. 响应压缩

```javascript
// 使用 compression 中间件
const compression = require('compression');
app.use(compression());
```

---

## 监控与日志

### 1. 关键指标

- 请求量（总数、成功、失败）
- 响应时间（平均、P95、P99）
- 攻击检测率
- 防御成功率
- LLM 调用成本

### 2. 日志结构

```javascript
{
  timestamp: '2025-01-15T10:30:00Z',
  level: 'info',
  type: 'attack_test',
  sessionId: 'xxx',
  input: 'xxx',
  defenseLevel: 'high',
  result: {
    blocked: false,
    threatScore: 25
  },
  duration: 150
}
```

---

## 总结

本架构设计具有以下特点：

✅ **模块化**: 各模块职责单一，易于维护
✅ **可扩展**: 支持新增攻击类型和防御策略
✅ **灵活性**: 支持多种 LLM 提供商
✅ **安全性**: 多层防御，全程监控
✅ **性能**: 优化的缓存和并发控制

适合用于教育、研究和安全测试场景。

