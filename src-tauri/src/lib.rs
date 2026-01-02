// Tauri application library
pub mod commands;
pub mod db;
pub mod redis_client;

use commands::connection::*;
use commands::redis::*;
use db::state::{AppState, init_database};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState::new())
        .setup(|app| {
            init_database(&app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Connection commands
            create_connection,
            update_connection,
            delete_connection,
            get_connections,
            test_connection,
            create_group,
            get_groups,
            update_group,
            delete_group,
            // Redis commands
            connect_redis,
            disconnect_redis,
            select_database,
            get_keys,
            get_value,
            set_value,
            delete_key,
            execute_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
