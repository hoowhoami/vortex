use serde::{Deserialize, Serialize};
use tauri::State;
use crate::db::state::AppState;
use crate::redis_client::RedisKey;

#[derive(Debug, Serialize, Deserialize)]
pub struct RedisValue {
    pub r#type: String,
    pub value: serde_json::Value,
    pub ttl: Option<i64>,
}

#[tauri::command]
pub async fn connect_redis(state: State<'_, AppState>, connection_id: String) -> Result<(), String> {
    // Get connection details from database
    let db_guard = state.db.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
    let conn = db.get_connection(&connection_id)
        .map_err(|e| e.to_string())?
        .ok_or("Connection not found")?;
    drop(db_guard);

    // Connect to Redis
    let redis_manager = state.redis_manager.lock().unwrap();
    redis_manager.connect(
        connection_id.clone(),
        &conn.host,
        conn.port,
        conn.password.as_deref(),
        conn.database,
    )?;

    Ok(())
}

#[tauri::command]
pub async fn disconnect_redis(state: State<'_, AppState>, connection_id: String) -> Result<(), String> {
    let redis_manager = state.redis_manager.lock().unwrap();
    redis_manager.disconnect(&connection_id)?;
    Ok(())
}

#[tauri::command]
pub async fn select_database(state: State<'_, AppState>, connection_id: String, database: u32) -> Result<(), String> {
    let redis_manager = state.redis_manager.lock().unwrap();
    redis_manager.select_database(&connection_id, database as u8)?;
    Ok(())
}

#[tauri::command]
pub async fn get_keys(state: State<'_, AppState>, connection_id: String, pattern: String, scan_count: Option<u32>, keys_limit: Option<u32>, key_type: Option<String>) -> Result<Vec<RedisKey>, String> {
    let redis_manager = state.redis_manager.lock().unwrap();
    redis_manager.get_keys_with_type(&connection_id, &pattern, scan_count, keys_limit.map(|v| v as usize), key_type.as_deref())
}

#[tauri::command]
pub async fn get_value(state: State<'_, AppState>, connection_id: String, key: String) -> Result<RedisValue, String> {
    let redis_manager = state.redis_manager.lock().unwrap();
    let value = redis_manager.get_value(&connection_id, &key)?;

    Ok(RedisValue {
        r#type: value.r#type,
        value: value.value,
        ttl: value.ttl,
    })
}

#[tauri::command]
pub async fn set_value(
    state: State<'_, AppState>,
    connection_id: String,
    key: String,
    value_type: String,
    value: serde_json::Value,
) -> Result<(), String> {
    let redis_manager = state.redis_manager.lock().unwrap();
    redis_manager.set_value(&connection_id, &key, &value_type, value)?;
    Ok(())
}

#[tauri::command]
pub async fn delete_key(state: State<'_, AppState>, connection_id: String, key: String) -> Result<(), String> {
    let redis_manager = state.redis_manager.lock().unwrap();
    redis_manager.delete_key(&connection_id, &key)?;
    Ok(())
}

#[tauri::command]
pub async fn delete_multiple_keys(state: State<'_, AppState>, connection_id: String, keys: Vec<String>) -> Result<(), String> {
    let redis_manager = state.redis_manager.lock().unwrap();
    for key in keys {
        redis_manager.delete_key(&connection_id, &key)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn execute_command(state: State<'_, AppState>, connection_id: String, command: String) -> Result<String, String> {
    let redis_manager = state.redis_manager.lock().unwrap();
    redis_manager.execute_command(&connection_id, &command)
}
