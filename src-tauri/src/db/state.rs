use crate::db::schema::Database;
use crate::redis_client::RedisConnectionManager;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};
use std::path::PathBuf;

pub struct AppState {
    pub db: Mutex<Option<Database>>,
    pub redis_manager: Mutex<RedisConnectionManager>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            db: Mutex::new(None),
            redis_manager: Mutex::new(RedisConnectionManager::new()),
        }
    }
}

pub fn get_db_path(app: &AppHandle) -> PathBuf {
    let app_data_dir = app.path().app_data_dir().expect("Failed to get app data dir");
    std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data dir");
    app_data_dir.join("vortex.db")
}

pub fn init_database(app: &AppHandle) -> Result<(), String> {
    let db_path = get_db_path(app);
    let db = Database::new(db_path).map_err(|e| e.to_string())?;

    let state: tauri::State<AppState> = app.state();
    *state.db.lock().unwrap() = Some(db);

    Ok(())
}
