# Vortex

现代化的视频流媒体聚合平台，完整复刻 LunaTV 功能，使用 React 19 + Next.js 15 + ShadcnUI 构建。

## ✨ 特性

- 🎬 **多源视频聚合** - 同时搜索多个视频源，实时流式返回结果
- 🎥 **HLS 流媒体播放** - 基于 ArtPlayer 和 HLS.js 的高级视频播放器
- 💾 **数据同步** - 支持播放记录、收藏、搜索历史的多设备同步
- 📺 **直播电视** - M3U 播放列表支持，EPG 节目单
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🌙 **主题切换** - 支持深色/浅色模式
- 🔐 **用户系统** - 基于角色的访问控制

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **UI**: React 19 + ShadcnUI + Radix UI
- **样式**: TailwindCSS
- **视频播放**: ArtPlayer 5.x + HLS.js
- **状态管理**: React Hooks + SWR
- **数据存储**: Redis / Upstash / Kvrocks
- **动画**: Framer Motion
- **类型**: TypeScript 5.x

## 📦 安装

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 🚀 快速开始

1. 克隆项目并安装依赖
2. 配置环境变量（可选）
3. 启动开发服务器：`npm run dev`
4. 访问 http://localhost:3000

## 📁 项目结构

```
vortex/
├── src/
│   ├── app/              # Next.js App Router 页面
│   │   ├── page.tsx      # 首页（重定向）
│   │   ├── home/         # 首页
│   │   ├── search/       # 搜索页
│   │   ├── douban/       # 豆瓣浏览
│   │   ├── live/         # 直播电视
│   │   ├── admin/        # 管理后台
│   │   └── layout.tsx    # 根布局
│   ├── components/       # React 组件
│   │   ├── ui/           # ShadcnUI 组件
│   │   ├── layout/       # 布局组件
│   │   ├── video/        # 视频组件
│   │   └── search/       # 搜索组件
│   ├── lib/              # 核心库
│   │   ├── api/          # API 客户端
│   │   ├── storage/      # 存储层
│   │   ├── utils/        # 工具函数
│   │   └── config.ts     # 配置文件
│   ├── hooks/            # 自定义 Hooks
│   ├── types/            # TypeScript 类型
│   └── styles/           # 全局样式
└── public/               # 静态资源
```

## 🔧 配置

### 环境变量

创建 `.env.local` 文件：

```env
# Redis 配置（可选）
REDIS_URL=redis://localhost:6379

# Upstash Redis（可选）
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# 豆瓣代理（可选）
NEXT_PUBLIC_DOUBAN_PROXY=https://your-proxy.com
```

### 视频源配置

在管理后台或直接修改配置文件添加视频源。

## 📄 许可证

MIT License

## 🙏 致谢

- 基于 [LunaTV](https://github.com/MoonTechLab/LunaTV.git) 项目开发
- 使用 [ShadcnUI](https://ui.shadcn.com/) 组件库
- 视频播放器使用 [ArtPlayer](https://artplayer.org/)
