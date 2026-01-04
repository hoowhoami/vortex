# Vortex

A modern download manager built with Tauri2 + React + Antd, inspired by Motrix.

## 🚀 Features

- **Download Engine**: Powered by aria2c for high-performance downloads
- **Modern UI**: Built with React 19 and Ant Design 5
- **Cross-Platform**: Desktop application for macOS, Windows, and Linux
- **Task Management**: Complete download lifecycle management (add, pause, resume, remove)
- **Configuration System**: Dual-store configuration (user preferences + aria2 settings)
- **State Management**: Zustand for efficient state management
- **Multi-Protocol Support**: HTTP, HTTPS, FTP, BitTorrent, Magnet links

## 📦 Tech Stack

### Frontend
- **React 19** - UI framework
- **Ant Design 5** - UI component library
- **Zustand** - State management
- **TypeScript** - Type safety
- **Vite** - Build tool

### Backend
- **Tauri 2** - Desktop framework
- **Rust** - Backend language
- **aria2c** - Download engine

## 🏗️ Project Structure

```
vortex/
├── src/                      # Frontend source
│   ├── api/                  # API layer
│   │   ├── aria2.ts         # Aria2 RPC client
│   │   └── config.ts        # Configuration manager
│   ├── store/               # State management
│   │   ├── appStore.ts      # App state
│   │   └── taskStore.ts     # Task state
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Type definitions
│   ├── components/          # React components (to be implemented)
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── src-tauri/               # Backend source
│   ├── src/
│   │   ├── main.rs          # Main entry point
│   │   ├── engine.rs        # Aria2 process manager
│   │   ├── config.rs        # Config types
│   │   └── config_manager.rs # Config persistence
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
└── package.json             # Node dependencies
```

## 🎯 Implementation Status

### ✅ Completed
1. **Project Initialization**
   - Tauri2 + React + TypeScript setup
   - Vite configuration
   - Dependencies installation

2. **Core Architecture**
   - State management (Zustand stores)
   - API layer (Aria2 RPC client)
   - Configuration system (dual-store)
   - Type definitions

3. **Download Engine Integration**
   - Aria2c process management (start/stop/restart)
   - RPC communication layer
   - Configuration persistence
   - Tauri commands for engine control

### 🚧 To Be Implemented
4. **Task Management System**
   - CRUD operations for downloads
   - Batch operations (pause/resume/remove multiple)
   - Task filtering (active/waiting/stopped)
   - Session persistence

5. **UI Components**
   - TaskList component with drag-select
   - AddTask dialog (URI/Torrent/Metalink)
   - TaskDetail panel (files/peers/trackers)
   - Settings/Preferences page
   - Speedometer widget

6. **Real-time Polling**
   - Dynamic polling interval
   - Global statistics tracking
   - Task list refresh
   - Progress updates

7. **Protocol Handling**
   - Magnet link support
   - Custom URI schemes (vortex://)
   - File drag-drop
   - Torrent file associations

8. **System Integration**
   - System tray integration
   - Native notifications
   - Auto-launch on startup
   - Theme switching (light/dark/auto)

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Rust 1.70+
- aria2c (download engine)

> **图标说明**：项目当前使用系统默认图标用于开发。发布时可替换为自定义图标，详见 [docs/ICON.md](docs/ICON.md)

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
npm run tauri:dev
```

### Build
```bash
npm run tauri:build
```

## 📝 API Reference

### Tauri Commands

#### Engine Management
- `start_engine()` - Start aria2c process
- `stop_engine()` - Stop aria2c process
- `restart_engine()` - Restart aria2c process
- `is_engine_running()` - Check engine status

#### Configuration
- `load_user_config()` - Load user preferences
- `save_user_config(config)` - Save user preferences
- `load_system_config()` - Load aria2 configuration
- `save_system_config(config)` - Save aria2 configuration

### Aria2 RPC Methods

#### Task Management
- `addUri(uris, options)` - Add HTTP/FTP download
- `addTorrent(torrent, options)` - Add torrent download
- `pause(gid)` - Pause download
- `unpause(gid)` - Resume download
- `remove(gid)` - Remove download

#### Status
- `tellStatus(gid)` - Get task status
- `tellActive()` - Get active tasks
- `tellWaiting()` - Get waiting tasks
- `tellStopped()` - Get stopped tasks
- `getGlobalStat()` - Get global statistics

## 🎨 Design Philosophy

Based on Motrix's architecture with modern improvements:

1. **Separation of Concerns**
   - Frontend: React components + Zustand state
   - Backend: Rust + Tauri commands
   - Engine: aria2c process

2. **Configuration Management**
   - User config: UI preferences, directories
   - System config: aria2 engine settings
   - Persistent storage with validation

3. **Real-time Updates**
   - Dynamic polling based on activity
   - Efficient state updates
   - Minimal re-renders

4. **Extensibility**
   - Plugin system (future)
   - Custom protocols
   - Theme system

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- [Motrix](https://github.com/agalwood/Motrix) - Original inspiration
- [aria2](https://aria2.github.io/) - Download engine
- [Tauri](https://tauri.app/) - Desktop framework
- [Ant Design](https://ant.design/) - UI components
