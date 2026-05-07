# 🚀 GitHub Pages 部署指南

## 方案对比

| 方案 | 免费额度 | 定时任务 | 自定义域名 | 备注 |
|------|---------|---------|-----------|------|
| **GitHub Pages** | ✅ 无限 | ❌ 需要外部 | ✅ 支持 | 静态托管，需配合 Vercel/Railway |
| **Vercel** | ✅ 有限 | ⚠️ 需要付费 | ✅ 支持 | 定时任务需付费版 |
| **Railway** | ✅ 有限 | ✅ 支持 | ✅ 支持 | 可用信用卡扩展 |

---

## 推荐方案：GitHub Pages + Railway 定时任务

### 第一步：部署前端到 GitHub Pages

#### 1. 创建 GitHub 仓库
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/clien.git
git push -u origin main
```

#### 2. 配置 GitHub Pages
1. 进入仓库 → Settings → Pages
2. Source 选择 "Deploy from a branch"
3. Branch 选择 `gh-pages` / `(root)`
4. 保存

#### 3. 添加 Secrets (仓库 → Settings → Secrets)
- `GITHUB_API_TOKEN` - GitHub Personal Access Token
- `STOCK_API_KEY` - Alpha Vantage API Key

#### 4. 添加 Variables (仓库 → Settings → Variables)
- `API_BASE_URL` - 你的 GitHub Pages URL (如 `https://username.github.io/clien`)

---

### 第二步：部署定时任务到 Railway

#### 1. 创建 Railway 项目
1. 访问 https://railway.app
2. 连接 GitHub 仓库
3. 选择 `scripts/scheduler.js` 作为启动命令

#### 2. 配置环境变量
在 Railway 项目的 Variables 中添加：
```
GITHUB_API_TOKEN=xxx
STOCK_API_KEY=xxx
BINANCE_API_KEY=xxx
BINANCE_API_SECRET=xxx
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=xxx@gmail.com
EMAIL_PASSWORD=xxx
EMAIL_RECIPIENTS=xxx@example.com
API_BASE_URL=https://你的用户名.github.io/clien
```

#### 3. 设置定时触发
在 Railway 中创建一个 cron 定时任务，每天 23:00 执行。

---

## 替代方案：全部使用 Vercel (需付费)

Vercel Hobby 计划不支持 cron jobs，需要升级到 Pro 计划 ($20/月)。

如需完整自动化，建议使用 Railway 部署定时任务 + GitHub Pages 部署前端。

---

## 快速开始命令

```bash
# 1. 安装 gh-pages 构建依赖 (可选)
npm install --save-dev gh-pages

# 2. 切换到 GitHub Pages 配置
mv next.config.js next.config.js.bak
mv next.config.gh-pages.js next.config.js

# 3. 构建静态文件
npm run build

# 4. 预览本地
npx serve out
```

---

## 注意事项

1. **API 路由限制**：GitHub Pages 静态托管不支持 Serverless Functions，需使用外部服务
2. **跨域问题**：如果 API 部署在不同域名，需要配置 CORS
3. **环境变量**：前端只能使用 `NEXT_PUBLIC_` 前缀的变量

如需完全免费方案，建议先本地测试功能后再决定部署方式。