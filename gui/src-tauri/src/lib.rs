use std::path::PathBuf;
use std::sync::Arc;
use tauri::State;
use tauri::Manager;
use tokio::sync::Mutex;
use uuid::Uuid;
use vortex_core::{DownloadStatus, DownloadTask};
use vortex_db::Database;
use vortex_http::HttpDownloader;

type DbState = Arc<Mutex<Database>>;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // 使用临时目录存储数据库
            let db_dir = std::env::temp_dir().join("vortex");
            std::fs::create_dir_all(&db_dir).expect("Failed to create db dir");

            let db_path = db_dir.join("downloads.db");
            let db_url = format!("sqlite://{}?mode=rwc", db_path.display());

            println!("Database path: {}", db_path.display());

            let db = tauri::async_runtime::block_on(async {
                Database::new(&db_url)
                    .await
                    .expect("Failed to initialize database")
            });

            app.manage(Arc::new(Mutex::new(db)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_download,
            pause_download,
            resume_download,
            remove_download,
            get_downloads,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn create_download(
    url: String,
    save_path: String,
    state: State<'_, DbState>,
) -> Result<String, String> {
    let db = state.lock().await;
    let file_name = url.split('/').last().unwrap_or("download").to_string();
    let save_path = PathBuf::from(&save_path);

    let task = DownloadTask {
        id: Uuid::new_v4().to_string(),
        url,
        file_name,
        save_path,
        total_size: 0,
        downloaded_size: 0,
        status: DownloadStatus::Pending,
        created_at: chrono::Utc::now().timestamp(),
        updated_at: chrono::Utc::now().timestamp(),
    };

    db.insert_task(&task).await.map_err(|e| e.to_string())?;

    Ok(task.id)
}

#[tauri::command]
async fn pause_download(id: String, state: State<'_, DbState>) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
async fn resume_download(id: String, state: State<'_, DbState>) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
async fn remove_download(id: String, state: State<'_, DbState>) -> Result<(), String> {
    let db = state.lock().await;
    db.delete_task(&id).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_downloads(state: State<'_, DbState>) -> Result<Vec<DownloadTask>, String> {
    let db = state.lock().await;
    db.get_all_tasks().await.map_err(|e| e.to_string())
}
