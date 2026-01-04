use crate::config::{AppConfig, Aria2Config};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub struct ConfigManager {
    app_handle: AppHandle,
}

impl ConfigManager {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    fn get_config_dir(&self) -> Result<PathBuf, String> {
        self.app_handle
            .path()
            .app_config_dir()
            .map_err(|e| format!("Failed to get config dir: {}", e))
    }

    fn ensure_config_dir(&self) -> Result<PathBuf, String> {
        let config_dir = self.get_config_dir()?;
        fs::create_dir_all(&config_dir)
            .map_err(|e| format!("Failed to create config dir: {}", e))?;
        Ok(config_dir)
    }

    pub fn load_user_config(&self) -> Result<AppConfig, String> {
        let config_dir = self.get_config_dir()?;
        let config_path = config_dir.join("user.json");

        if !config_path.exists() {
            return Ok(AppConfig::default());
        }

        let content = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read user config: {}", e))?;

        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse user config: {}", e))
    }

    pub fn save_user_config(&self, config: &AppConfig) -> Result<(), String> {
        let config_dir = self.ensure_config_dir()?;
        let config_path = config_dir.join("user.json");

        let content = serde_json::to_string_pretty(config)
            .map_err(|e| format!("Failed to serialize user config: {}", e))?;

        fs::write(&config_path, content)
            .map_err(|e| format!("Failed to write user config: {}", e))
    }

    pub fn load_system_config(&self) -> Result<Aria2Config, String> {
        let config_dir = self.get_config_dir()?;
        let config_path = config_dir.join("aria2.conf");

        if !config_path.exists() {
            return Ok(Aria2Config::default());
        }

        let content = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read system config: {}", e))?;

        // Parse aria2 config format (key=value)
        self.parse_aria2_config(&content)
    }

    pub fn save_system_config(&self, config: &Aria2Config) -> Result<(), String> {
        let config_dir = self.ensure_config_dir()?;
        let config_path = config_dir.join("aria2.conf");

        let content = self.serialize_aria2_config(config)?;

        fs::write(&config_path, content)
            .map_err(|e| format!("Failed to write system config: {}", e))
    }

    pub fn get_aria2_config_path(&self) -> Result<String, String> {
        let config_dir = self.ensure_config_dir()?;
        let config_path = config_dir.join("aria2.conf");

        // Ensure config file exists
        if !config_path.exists() {
            let default_config = Aria2Config::default();
            self.save_system_config(&default_config)?;
        }

        config_path
            .to_str()
            .ok_or_else(|| "Invalid config path".to_string())
            .map(|s| s.to_string())
    }

    fn parse_aria2_config(&self, content: &str) -> Result<Aria2Config, String> {
        let mut config = Aria2Config::default();

        for line in content.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }

            if let Some((key, value)) = line.split_once('=') {
                let key = key.trim();
                let value = value.trim();

                match key {
                    "dir" => config.dir = if value.is_empty() { config.dir } else { value.to_string() },
                    "max-concurrent-downloads" => {
                        config.max_concurrent_downloads = value.parse().unwrap_or(5)
                    }
                    "max-connection-per-server" => {
                        config.max_connection_per_server = value.parse().unwrap_or(16)
                    }
                    "split" => config.split = value.parse().unwrap_or(16),
                    "min-split-size" => config.min_split_size = if value.is_empty() { config.min_split_size } else { value.to_string() },
                    "max-overall-download-limit" => {
                        config.max_overall_download_limit = if value.is_empty() { config.max_overall_download_limit } else { value.to_string() }
                    }
                    "max-overall-upload-limit" => {
                        config.max_overall_upload_limit = if value.is_empty() { config.max_overall_upload_limit } else { value.to_string() }
                    }
                    "rpc-listen-port" => config.rpc_listen_port = value.parse().unwrap_or(6800),
                    "rpc-secret" => {
                        // Only update if not empty, otherwise keep default
                        if !value.is_empty() {
                            config.rpc_secret = value.to_string();
                        }
                    }
                    "seed-ratio" => config.seed_ratio = value.parse().unwrap_or(1.0),
                    "seed-time" => config.seed_time = value.parse().unwrap_or(60),
                    _ => {}
                }
            }
        }

        Ok(config)
    }

    fn serialize_aria2_config(&self, config: &Aria2Config) -> Result<String, String> {
        let mut lines = vec![
            "# Vortex Aria2 Configuration".to_string(),
            "".to_string(),
            format!("dir={}", config.dir),
            format!("max-concurrent-downloads={}", config.max_concurrent_downloads),
            format!("max-connection-per-server={}", config.max_connection_per_server),
            format!("split={}", config.split),
            format!("min-split-size={}", config.min_split_size),
            format!("max-overall-download-limit={}", config.max_overall_download_limit),
            format!("max-overall-upload-limit={}", config.max_overall_upload_limit),
            "".to_string(),
            "# RPC Settings".to_string(),
            "enable-rpc=true".to_string(),
            format!("rpc-listen-port={}", config.rpc_listen_port),
            "rpc-allow-origin-all=true".to_string(),
            "rpc-listen-all=true".to_string(),
        ];

        // Only add rpc-secret if it's not empty
        if !config.rpc_secret.is_empty() {
            lines.push(format!("rpc-secret={}", config.rpc_secret));
        }

        lines.extend(vec![
            "".to_string(),
            "# Advanced Settings".to_string(),
            "continue=true".to_string(),
            "all-proxy=".to_string(),  // Disable proxy to avoid env variable issues
            "https-proxy=".to_string(),
            "http-proxy=".to_string(),
            format!("file-allocation={}", config.file_allocation),
            format!("enable-dht={}", config.enable_dht),
            format!("bt-enable-lpd={}", config.bt_enable_lpd),
            format!("enable-peer-exchange={}", config.enable_peer_exchange),
            format!("seed-ratio={}", config.seed_ratio),
            format!("seed-time={}", config.seed_time),
        ]);

        Ok(lines.join("\n"))
    }
}
