# Aria2c Binaries

This directory contains pre-compiled aria2c binaries for different platforms.

## Directory Structure

```
binaries/
├── darwin-aarch64/          # macOS ARM64 (Apple Silicon)
│   ├── aria2c
│   └── aria2.conf
├── darwin-x86_64/           # macOS Intel
│   ├── aria2c
│   └── aria2.conf
├── linux-x86_64/            # Linux x64
│   ├── aria2c
│   └── aria2.conf
└── windows-x86_64/          # Windows x64
    ├── aria2c.exe
    └── aria2.conf
```

## Source

These binaries are copied from [Motrix](https://github.com/agalwood/Motrix), a modern download manager based on aria2.

## Version

- aria2c version: 1.35.0 (from Motrix)
- Last updated: 2026-01-04

## How It Works

### Development Mode
During development (`npm run tauri:dev`), the Rust backend searches for binaries in:
1. `../binaries/` (project root)
2. System PATH (fallback)

### Production Mode
In production builds, Tauri bundles the binaries into the application resources:
- macOS: `Vortex.app/Contents/Resources/binaries/`
- Windows: `C:\Users\<User>\AppData\Local\Vortex\resources\binaries\`
- Linux: `/opt/vortex/resources/binaries/` or similar

## Platform Detection

The Rust code automatically detects the current platform and architecture using:

```rust
let (os, arch) = (env::consts::OS, env::consts::ARCH);
```

And selects the appropriate binary path.

## Adding New Platforms

To add support for a new platform:

1. Create a new directory: `binaries/<platform>-<arch>/`
2. Copy the aria2c binary and configuration file
3. Update the `get_aria2_binary_path()` function in `src-tauri/src/engine.rs`

## Building

To build the application with bundled binaries:

```bash
# Development (uses local binaries)
npm run tauri:dev

# Production (bundles binaries)
npm run tauri:build
```

## License

The aria2c binaries are distributed under the GPLv2 license, same as the aria2 project.
