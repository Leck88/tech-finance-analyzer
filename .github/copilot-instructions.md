# Tech Finance Quantitative Analysis System

## Project Overview
一个科技+金融量化分析自动化系统，每日23:00自动执行以下任务：
- GitHub趋势项目抓取和分析
- 技术术语解释和商业价值分析
- 行业上下游分析
- 股票影响追踪和预测
- 加密货币（BTC/ETH）分析
- 黄金价格分析
- HTML邮件发送和Web展示

## Technology Stack
- **Framework**: Next.js 14+ (TypeScript)
- **Frontend**: React, Tailwind CSS, Responsive Design
- **Backend**: Node.js API Routes
- **Database**: Optional (可选SQLite/PostgreSQL用于数据持久化)
- **Scheduling**: node-cron (定时任务)
- **APIs**: GitHub API, Stock API, Binance API, Gold Price API
- **Email**: nodemailer
- **Visualization**: Chart.js / ECharts

## Key Features
- [x] 自动化定时执行（每日23:00）
- [x] 多源API数据集成
- [x] 数据预测和分析引擎
- [x] HTML邮件生成和发送
- [x] 响应式Web展示（移动端+桌面端）
- [x] 错误处理和重试机制
- [x] 数据准确性验证（禁止虚构数据）

## Project Structure
```
├── public/               # 静态资源
├── src/
│   ├── app/
│   │   ├── api/         # API路由
│   │   │   ├── github/
│   │   │   ├── stock/
│   │   │   ├── crypto/
│   │   │   └── execute-task/
│   │   ├── dashboard/   # 仪表板页面
│   │   └── layout.tsx
│   ├── components/      # React组件
│   ├── lib/
│   │   ├── api-clients/ # 外部API客户端
│   │   ├── analysis/    # 分析引擎
│   │   ├── schedulers/  # 定时任务
│   │   └── email/       # 邮件发送
│   └── types/          # TypeScript类型定义
├── .env.local          # 环境变量（不提交）
├── package.json
└── README.md
```

## API密钥管理（安全指南）
所有敏感信息必须存储在 `.env.local` 文件中，不提交到版本控制：
- `GITHUB_API_TOKEN`: GitHub Personal Access Token
- `BINANCE_API_KEY`: Binance API密钥
- `BINANCE_API_SECRET`: Binance API密钥
- `STOCK_API_KEY`: Stock API密钥（如Alpha Vantage）
- `EMAIL_USER`: 邮件发送者账号
- `EMAIL_PASSWORD`: 邮件密码
- `EMAIL_RECIPIENTS`: 邮件接收者列表
