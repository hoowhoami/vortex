// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod config_manager;
mod engine;

use config::{AppConfig, Aria2Config};
use config_manager::ConfigManager;
use engine::EngineManager;
use std::sync::Mutex;
use tauri::{Manager, State};

struct AppState {
    engine: Mutex<EngineManager>,
    config_manager: Mutex<ConfigManager>,
}

#[tauri::command]
fn start_engine(state: State<AppState>) -> Result<(), String> {
    let engine = state.engine.lock().unwrap();
    let config_manager = state.config_manager.lock().unwrap();
    let config_path = config_manager.get_aria2_config_path()?;
    engine.start(&config_path)
}

#[tauri::command]
fn stop_engine(state: State<AppState>) -> Result<(), String> {
    let engine = state.engine.lock().unwrap();
    engine.stop()
}

#[tauri::command]
fn restart_engine(state: State<AppState>) -> Result<(), String> {
    let engine = state.engine.lock().unwrap();
    let config_manager = state.config_manager.lock().unwrap();
    let config_path = config_manager.get_aria2_config_path()?;
    engine.restart(&config_path)
}

#[tauri::command]
fn is_engine_running(state: State<AppState>) -> bool {
    let engine = state.engine.lock().unwrap();
    engine.is_running()
}

#[tauri::command]
fn load_user_config(state: State<AppState>) -> Result<AppConfig, String> {
    let config_manager = state.config_manager.lock().unwrap();
    config_manager.load_user_config()
}

#[tauri::command]
fn save_user_config(state: State<AppState>, config: AppConfig) -> Result<(), String> {
    let config_manager = state.config_manager.lock().unwrap();
    config_manager.save_user_config(&config)
}

#[tauri::command]
fn load_system_config(state: State<AppState>) -> Result<Aria2Config, String> {
    let config_manager = state.config_manager.lock().unwrap();
    config_manager.load_system_config()
}

#[tauri::command]
fn save_system_config(state: State<AppState>, config: Aria2Config) -> Result<(), String> {
    let config_manager = state.config_manager.lock().unwrap();
    config_manager.save_system_config(&config)?;

    // Restart engine to apply new config
    let engine = state.engine.lock().unwrap();
    if engine.is_running() {
        drop(engine);
        drop(config_manager);
        restart_engine(state)?;
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            let config_manager = ConfigManager::new(app_handle);
            let engine = EngineManager::new(6800, "vortex".to_string());

            app.manage(AppState {
                engine: Mutex::new(engine),
                config_manager: Mutex::new(config_manager),
            });

            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_engine,
            stop_engine,
            restart_engine,
            is_engine_running,
            load_user_config,
            save_user_config,
            load_system_config,
            save_system_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
