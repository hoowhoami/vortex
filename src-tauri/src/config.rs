use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub theme: String,
    pub locale: String,
    #[serde(rename = "downloadDir")]
    pub download_dir: String,
    #[serde(rename = "maxConcurrentDownloads")]
    pub max_concurrent_downloads: u32,
    #[serde(rename = "maxConnectionPerServer")]
    pub max_connection_per_server: u32,
    pub split: u32,
    #[serde(rename = "minSplitSize")]
    pub min_split_size: String,
    #[serde(rename = "maxDownloadSpeed")]
    pub max_download_speed: String,
    #[serde(rename = "maxUploadSpeed")]
    pub max_upload_speed: String,
    #[serde(rename = "autoCheckUpdate")]
    pub auto_check_update: bool,
    #[serde(rename = "hideAppOnClose")]
    pub hide_app_on_close: bool,
    #[serde(rename = "enableProxy")]
    pub enable_proxy: bool,
    #[serde(rename = "proxyType")]
    pub proxy_type: String,
    #[serde(rename = "proxyHost")]
    pub proxy_host: String,
    #[serde(rename = "proxyPort")]
    pub proxy_port: u16,
    #[serde(rename = "enableUPnP")]
    pub enable_upnp: bool,
    #[serde(rename = "seedRatio")]
    pub seed_ratio: f32,
    #[serde(rename = "seedTime")]
    pub seed_time: u32,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            theme: "auto".to_string(),
            locale: "en".to_string(),
            download_dir: String::new(),
            max_concurrent_downloads: 5,
            max_connection_per_server: 16,
            split: 16,
            min_split_size: "1M".to_string(),
            max_download_speed: "0".to_string(),
            max_upload_speed: "0".to_string(),
            auto_check_update: true,
            hide_app_on_close: false,
            enable_proxy: false,
            proxy_type: "http".to_string(),
            proxy_host: String::new(),
            proxy_port: 0,
            enable_upnp: false,
            seed_ratio: 1.0,
            seed_time: 60,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Aria2Config {
    pub dir: String,
    #[serde(rename = "max-concurrent-downloads")]
    pub max_concurrent_downloads: u32,
    #[serde(rename = "max-connection-per-server")]
    pub max_connection_per_server: u32,
    pub split: u32,
    #[serde(rename = "min-split-size")]
    pub min_split_size: String,
    #[serde(rename = "max-overall-download-limit")]
    pub max_overall_download_limit: String,
    #[serde(rename = "max-overall-upload-limit")]
    pub max_overall_upload_limit: String,
    #[serde(rename = "enable-rpc")]
    pub enable_rpc: bool,
    #[serde(rename = "rpc-listen-port")]
    pub rpc_listen_port: u16,
    #[serde(rename = "rpc-secret")]
    pub rpc_secret: String,
    #[serde(rename = "continue")]
    pub continue_download: bool,
    #[serde(rename = "file-allocation")]
    pub file_allocation: String,
    #[serde(rename = "enable-dht")]
    pub enable_dht: bool,
    #[serde(rename = "bt-enable-lpd")]
    pub bt_enable_lpd: bool,
    #[serde(rename = "enable-peer-exchange")]
    pub enable_peer_exchange: bool,
    #[serde(rename = "seed-ratio")]
    pub seed_ratio: f32,
    #[serde(rename = "seed-time")]
    pub seed_time: u32,
}

impl Default for Aria2Config {
    fn default() -> Self {
        Self {
            dir: dirs::download_dir()
                .unwrap_or_else(|| PathBuf::from("~/Downloads"))
                .to_str()
                .unwrap_or("~/Downloads")
                .to_string(),
            max_concurrent_downloads: 5,
            max_connection_per_server: 16,
            split: 16,
            min_split_size: "1M".to_string(),
            max_overall_download_limit: "0".to_string(),
            max_overall_upload_limit: "0".to_string(),
            enable_rpc: true,
            rpc_listen_port: 6800,
            rpc_secret: "vortex".to_string(),
            continue_download: true,
            file_allocation: "none".to_string(),
            enable_dht: true,
            bt_enable_lpd: true,
            enable_peer_exchange: true,
            seed_ratio: 1.0,
            seed_time: 60,
        }
    }
}
