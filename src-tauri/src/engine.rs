use std::env;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};

/// Get the aria2c binary path based on the current platform
fn get_aria2_binary_path() -> PathBuf {
    let (os, arch) = (
        env::consts::OS,
        env::consts::ARCH,
    );

    let binary_name = match os {
        "windows" => "aria2c.exe",
        _ => "aria2c",
    };

    let platform_dir = match (os, arch) {
        ("macos", "aarch64") => "darwin-aarch64",
        ("macos", "x86_64") => "darwin-x86_64",
        ("linux", "x86_64") => "linux-x86_64",
        ("linux", "aarch64") => "linux-aarch64",
        ("windows", "x86_64") => "windows-x86_64",
        _ => {
            // Fallback: try to use system aria2c
            return PathBuf::from(binary_name);
        }
    };

    // Try to find the binary in the bundled resources first
    if let Ok(resource_dir) = env::var("TAURI_PLATFORM_RESOURCE_PATH") {
        let binary_path = PathBuf::from(resource_dir)
            .join("binaries")
            .join(platform_dir)
            .join(binary_name);

        if binary_path.exists() {
            return binary_path;
        }
    }

    // Fallback to development mode: look in the project root
    let dev_path = PathBuf::from("..")
        .join("binaries")
        .join(platform_dir)
        .join(binary_name);

    if dev_path.exists() {
        return dev_path;
    }

    // Final fallback: use system aria2c
    PathBuf::from(binary_name)
}

pub struct EngineManager {
    process: Arc<Mutex<Option<Child>>>,
    rpc_port: u16,
    rpc_secret: String,
}

impl EngineManager {
    pub fn new(rpc_port: u16, rpc_secret: String) -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
            rpc_port,
            rpc_secret,
        }
    }

    pub fn start(&self, config_path: &str) -> Result<(), String> {
        let mut process_guard = self.process.lock().unwrap();

        // Check if already running
        if process_guard.is_some() {
            return Err("Engine is already running".to_string());
        }

        // Get the correct binary path for this platform
        let binary_path = get_aria2_binary_path();

        println!("[Vortex] Starting aria2c:");
        println!("[Vortex]   Binary: {:?}", binary_path);
        println!("[Vortex]   Config: {}", config_path);
        println!("[Vortex]   Binary exists: {}", binary_path.exists());

        // Start aria2c process with config file only
        // All settings should come from the config file
        let child = Command::new(&binary_path)
            .arg(format!("--conf-path={}", config_path))
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| {
                println!("[Vortex] Failed to spawn aria2c: {}", e);
                format!("Failed to start aria2c: {}", e)
            })?;

        println!("[Vortex] aria2c started successfully, PID: {:?}", child.id());
        *process_guard = Some(child);
        Ok(())
    }

    pub fn stop(&self) -> Result<(), String> {
        let mut process_guard = self.process.lock().unwrap();

        if let Some(mut child) = process_guard.take() {
            child.kill().map_err(|e| format!("Failed to kill process: {}", e))?;
            child.wait().map_err(|e| format!("Failed to wait for process: {}", e))?;
            Ok(())
        } else {
            Err("Engine is not running".to_string())
        }
    }

    pub fn is_running(&self) -> bool {
        let process_guard = self.process.lock().unwrap();
        process_guard.is_some()
    }

    pub fn restart(&self, config_path: &str) -> Result<(), String> {
        if self.is_running() {
            self.stop()?;
        }
        std::thread::sleep(std::time::Duration::from_millis(500));
        self.start(config_path)
    }
}

impl Drop for EngineManager {
    fn drop(&mut self) {
        let _ = self.stop();
    }
}
