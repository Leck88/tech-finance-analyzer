# Ubuntu 部署指南

本指南帮助您将科技金融量化分析系统部署到 Ubuntu 云服务器。

## 前置要求

- Ubuntu 20.04+ 系统
- 已安装 Node.js 18+ 和 npm
- 已安装 Git

## 部署步骤

### 1. 连接服务器

```bash
ssh root@你的服务器IP
```

### 2. 安装 Node.js（如果未安装）

```bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node -v  # 确认版本
```

### 3. 安装 SQLite 编译依赖

```bash
sudo apt update
sudo apt install -y build-essential python3
```

### 4. 克隆项目

```bash
cd /opt
git clone https://github.com/Leck88/tech-finance-analyzer.git
cd tech-finance-analyzer
```

### 5. 安装依赖

```bash
npm install
```

### 6. 创建数据目录

```bash
mkdir -p data
```

### 7. 配置环境变量（可选）

创建 `.env` 文件：

```bash
cat > .env << EOF
NODE_ENV=production
PORT=3000
DB_PATH=/opt/tech-finance-analyzer/data/config.db
EOF
```

### 8. 启动服务

```bash
# 开发模式
npm run dev

# 或生产模式
npm run build
npm run start
```

### 9. 配置 Nginx（推荐）

```bash
# 安装 Nginx
sudo apt install -y nginx

# 创建配置文件
sudo cat > /etc/nginx/sites-available/tech-finance << 'EOF'
server {
    listen 80;
    server_name 你的域名或IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 启用配置
sudo ln -s /etc/nginx/sites-available/tech-finance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 10. 配置 HTTPS（推荐）

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d 你的域名
```

### 11. 使用 PM2 管理进程（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start npm --name "tech-finance" -- start

# 设置开机自启
pm2 startup
pm2 save
```

## 管理命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs tech-finance

# 重启服务
pm2 restart tech-finance

# 停止服务
pm2 stop tech-finance
```

## 数据库位置

SQLite 数据库文件：`/opt/tech-finance-analyzer/data/config.db`

## API 配置接口

部署后可通过以下接口管理配置：

- `GET /api/config` - 获取所有配置
- `GET /api/config?key=xxx` - 获取单个配置
- `POST /api/config` - 保存配置
- `DELETE /api/config?key=xxx` - 删除配置

## 更新部署

```bash
cd /opt/tech-finance-analyzer
git pull
npm install
pm2 restart tech-finance