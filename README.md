# 科技金融量化分析自动化系统

一个全自动化的科技+金融量化分析系统，每日自动执行 GitHub 趋势分析、股票预测、加密货币分析等任务，并生成 HTML 邮件报告和响应式网页展示。

## 🚀 核心功能

### 1️⃣ GitHub 趋势项目抓取 (✅ 已实现)
- 调用 GitHub API 获取"昨日全球热门项目 Top10"
- 输出字段：项目名、Star增长数、技术标签、GitHub链接
- 自动分类标签：AI、Web3、Infra等

### 2️⃣ 技术术语解释 (✅ 已实现)
- 对每个项目提取 2-3 个核心技术关键词
- 通俗解释（面向非技术用户）
- 应用场景说明（商业价值）

### 3️⃣ 行业上下游分析 (✅ 已实现)
- 上游：算力 / 数据 / 芯片 / 基础设施
- 中游：模型 / 框架 / 技术服务
- 下游：商业应用 / 行业落地
- 明确说明资金流向和产业受益方向

### 4️⃣ 股票影响追踪 (✅ 已实现)
- 建立技术 → 公司映射关系
- 调用 Alpha Vantage API 获取股票数据
- 输出：受影响公司（至少2家）、涨跌幅、影响逻辑

### 5️⃣ 次日股价预测 (✅ 已实现)
- 基于技术热度变化、股票短期涨跌幅、市场情绪
- 明确方向：上涨 / 下跌 / 震荡
- 禁止使用"可能"、"大概率"等模糊词

### 6️⃣ T+1 验证机制 (🔄 计划中)
- 再次调用 API 获取实际数据
- 对比预测结果：列出预测是否正确
- 输出分析：正确 / 错误原因

### 7️⃣ 加密货币分析 (✅ 已实现)
- BTC / ETH 实时数据
- 上涨/下跌核心驱动（资金 / 政策 / 链上数据）
- 市场情绪（贪婪/恐慌/中性）
- 明确短期判断

### 8️⃣ 黄金价格分析 (✅ 已实现)
- 美元指数、利率变化、地缘政治风险
- 当前驱动因素排序
- 短期趋势判断

### 9️⃣ HTML 邮件输出 (✅ 已实现)
- 彩色表格（区分涨跌）
- 分区清晰（标题 + 分割线）
- 使用 emoji 增强可读性
- 数据结构化展示

### 🔟 邮件发送与验证 (✅ 已实现)
- 发送状态反馈（成功 / 失败）
- 自动重试机制（3次）
- 最终状态输出（是否送达 + 错误原因）

## 🛠️ 技术栈

- **Framework**: Next.js 14+ (TypeScript)
- **Frontend**: React, Tailwind CSS, Responsive Design
- **Backend**: Node.js API Routes
- **Scheduling**: node-cron (定时任务)
- **APIs**:
  - GitHub API (项目趋势)
  - Alpha Vantage (股票数据)
  - Binance API (加密货币)
  - Metals.Live API (黄金价格)
- **Email**: nodemailer
- **Package Manager**: npm

## 📦 项目结构

```
├── public/                   # 静态资源
├── src/
│   ├── app/
│   │   ├── api/             # API路由
│   │   │   ├── execute-task/  # 执行主任务
│   │   │   ├── github/        # GitHub API
│   │   │   ├── stock/         # 股票API
│   │   │   └── crypto/        # 加密货币/黄金API
│   │   ├── dashboard/       # 仪表板页面
│   │   ├── layout.tsx       # 应用布局
│   │   ├── page.tsx         # 首页
│   │   └── globals.css      # 全局样式
│   ├── components/          # React组件
│   ├── lib/
│   │   ├── api-clients/     # 外部API客户端
│   │   │   ├── github.ts
│   │   │   ├── stock.ts
│   │   │   └── crypto.ts
│   │   ├── analysis/        # 分析引擎
│   │   │   └── engine.ts
│   │   ├── schedulers/      # 定时任务
│   │   │   └── index.ts
│   │   └── email/          # 邮件发送
│   │       └── service.ts
│   └── types/              # TypeScript类型定义
├── .env.example            # 环境变量模板
├── .gitignore             # Git忽略规则
├── next.config.js         # Next.js配置
├── tsconfig.json          # TypeScript配置
├── tailwind.config.ts     # Tailwind CSS配置
├── package.json
└── README.md
```

## 🔐 安全指南 - API密钥管理

所有敏感信息必须存储在 `.env.local` 文件中，**不提交到版本控制**：

```bash
# GitHub
GITHUB_API_TOKEN=your_github_personal_access_token

# Stock API (Alpha Vantage)
STOCK_API_KEY=your_alpha_vantage_api_key

# Binance (只读权限)
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Recipients (逗号分隔)
EMAIL_RECIPIENTS=recipient1@example.com,recipient2@example.com

# API Protection
API_KEY=your_random_api_key_for_task_execution

# Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Cron Schedule (默认: 每日23:00)
CRON_SCHEDULE=0 23 * * *
```

### 获取API密钥指南

#### GitHub API Token
1. 访问 https://github.com/settings/tokens
2. 创建新的 Personal Access Token
3. 赋予权限：`repo`, `read:user`

#### Alpha Vantage API Key
1. 访问 https://www.alphavantage.co/api/
2. 免费注册获取 API Key
3. 支持每分钟5个请求的免费额度

#### Binance API
1. 登录币安账户
2. 访问 API Management: https://www.binance.com/en/account/api-management
3. 创建新的 API Key（仅读权限）

#### Gmail SMTP
1. 启用2步验证：https://myaccount.google.com/security
2. 生成应用密码：https://myaccount.google.com/apppasswords
3. 在邮件配置中使用应用密码而非账户密码

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local，填入实际的API密钥
```

### 3. 开发模式运行
```bash
npm run dev
```

访问 http://localhost:3000

### 4. 生产构建
```bash
npm run build
npm start
```

## 📊 API端点

### 执行主任务
```
GET /api/execute-task
Headers: { 'x-api-key': 'your_api_key' }
Response: DailyReport (包含所有分析结果)
```

### GitHub趋势
```
GET /api/github
Response: GitHubTrendingRepo[]
```

### 股票数据
```
GET /api/stock?symbol=NVDA
Response: StockData
```

### 加密货币数据
```
GET /api/crypto?symbol=BTC
Response: CryptoData
```

### 黄金价格
```
GET /api/crypto?symbol=GOLD
Response: GoldData
```

## 📧 邮件报告示例

邮件包含以下部分：
- 🚀 GitHub 全球热门项目 Top10
- 💡 技术解释与商业价值
- 📈 股票影响追踪
- 🪙 加密货币分析
- 💛 黄金价格分析
- ✉️ 邮件发送状态

## 📱 响应式网页

系统提供两个主要页面：

### 首页 (/)
- 项目概览
- 工作流程说明
- 快速操作按钮

### 仪表板 (/dashboard)
- 实时数据展示
- 表格和图表视图
- 支持移动端和桌面端

## ⚠️ 容错机制

### API失败处理
- 如果API请求失败，标记为"数据缺失"
- **禁止编造或估算数据**
- 继续处理其他可用的API

### 数据异常处理
- 检测异常数据（如价格异常波动）
- 标记"异常数据"并跳过预测
- 记录异常到日志

### 邮件重试机制
- 失败自动重试3次
- 每次重试间隔5秒 × 重试次数
- 最终返回失败原因

## 📋 输出风格要求

✅ **要求**
- 精简、结构化
- 禁止废话
- 禁止主观情绪
- 所有结论基于数据

❌ **禁止**
- "可能"、"大概率"等模糊词
- 虚构或估算数据
- 长篇幅文字描述

## 🔍 执行优先级

1. **数据准确性** (最高)
2. **结构完整性**
3. **美观性** (最低)

## 🛠️ 开发注意事项

### 添加新的API集成
1. 在 `src/lib/api-clients/` 中创建新的客户端类
2. 实现错误处理和重试机制
3. 在 `src/app/api/` 中创建相应的路由

### 修改邮件模板
- 编辑 `src/lib/email/service.ts` 中的 `generateHTML()` 方法
- 保持结构化和响应式设计

### 调整定时任务
- 修改 `.env.local` 中的 `CRON_SCHEDULE`
- 格式: `minute hour day month weekday` (cron表达式)

## 📝 许可证

MIT License

## 👤 关于

这是一个完全自动化的金融科技分析系统，致力于提供准确、结构化的数据分析。

---

**最后更新**: 2026年5月6日  
**数据准确性优先** ⭐⭐⭐⭐⭐
