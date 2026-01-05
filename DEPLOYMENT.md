# Zeabur 部署指南

## 快速部署

### 1. 准备工作

1. **Fork 本项目到你的 GitHub 账号**

2. **在 Zeabur 创建新项目**
   - 登录 [Zeabur](https://zeabur.com)
   - 点击 "New Project"
   - 选择 GitHub，导入你的仓库

### 2. 环境变量配置

在 Zeabur 项目设置中添加以下环境变量：

#### 必需配置
```bash
# 管理员账号（首次部署必须设置）
ADMIN_USERNAME=your_admin_name
ADMIN_PASSWORD=your_secure_password
```

#### 可选配置
```bash
# 站点信息
NEXT_PUBLIC_SITE_NAME=我的视频站

# 公告
ANNOUNCEMENT=欢迎访问我的视频站

# 搜索配置
NEXT_PUBLIC_SEARCH_MAX_PAGE=5
NEXT_PUBLIC_FLUID_SEARCH=true

# 豆瓣代理
NEXT_PUBLIC_DOUBAN_PROXY_TYPE=direct
NEXT_PUBLIC_DOUBAN_PROXY=
NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE=direct
NEXT_PUBLIC_DOUBAN_IMAGE_PROXY=

# 黄色过滤器
NEXT_PUBLIC_DISABLE_YELLOW_FILTER=false

# 存储类型（多选一）
NEXT_PUBLIC_STORAGE_TYPE=local

# Redis（如果选择 redis 存储）
REDIS_URL=redis://your-redis-url

# Upstash Redis（如果选择 upstash 存储）
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Kvrocks（如果选择 kvrocks 存储）
KVROCKS_URL=redis://your-kvrocks-url
```

### 3. 部署服务

1. **创建 Service**
   - 点击 "Create Service"
   - 选择 "Dockerfile"
   - Zeabur 会自动检测并使用项目根目录的 `Dockerfile`

2. **配置 Service**
   - Service 名称：`vortex-web`
   - 容器规格：根据访问量选择（建议至少 512MB 内存）
   - 环境变量：在环境变量部分添加上面的配置

3. **域名配置（可选）**
   - 在 Service 设置中点击 "Domains"
   - 添加自定义域名或使用 Zeabur 提供的域名

4. **部署**
   - 点击 "Deploy"
   - Zeabur 会自动构建和部署
   - 等待部署完成

### 4. 访问应用

部署完成后，使用配置的管理员账号登录：
- 用户名：你设置的 `ADMIN_USERNAME`
- 密码：你设置的 `ADMIN_PASSWORD`

## 存储方案

### localStorage（默认）
- 无需额外配置
- 数据存储在用户浏览器中
- 适合个人使用或小规模部署

### Redis
```bash
NEXT_PUBLIC_STORAGE_TYPE=redis
REDIS_URL=redis://username:password@host:port
```

### Upstash Redis Serverless
```bash
NEXT_PUBLIC_STORAGE_TYPE=upstash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

### Kvrocks
```bash
NEXT_PUBLIC_STORAGE_TYPE=kvrocks
KVROCKS_URL=redis://host:port
```

## 常见问题

### 1. 部署后无法访问
- 检查环境变量是否正确配置
- 查看 Service 日志排查错误

### 2. 登录失败
- 确认 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 已设置
- 检查环境变量是否正确添加

### 3. 数据未保存
- 检查存储类型配置
- 如果使用 Redis/Upstash/Kvrocks，确认连接地址正确

## 更新部署

推送代码到 GitHub 后，在 Zeabur 中点击 "Redeploy" 即可自动更新。

## 成本估算

| 规格 | 月费用（估算） |
|------|--------------|
| 512MB RAM | 免费额度内 |
| 1GB RAM | $5-10/月 |
| 2GB RAM | $10-20/月 |

实际费用取决于访问量和流量。
