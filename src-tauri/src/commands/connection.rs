use serde::{Deserialize, Serialize};
use uuid::Uuid;
use tauri::State;
use crate::db::state::AppState;
use crate::db::schema::{Connection as DbConnection, ConnectionGroup as DbConnectionGroup};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Connection {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: u16,
    pub password: Option<String>,
    pub database: u8,
    #[serde(rename = "groupId")]
    pub group_id: Option<String>,
    pub tags: Vec<String>,
    pub ssl: bool,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "updatedAt")]
    pub updated_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConnectionGroup {
    pub id: String,
    pub name: String,
    pub color: String,
    pub order: i32,
}

// Convert between API and DB types
impl From<&Connection> for DbConnection {
    fn from(conn: &Connection) -> Self {
        DbConnection {
            id: conn.id.clone(),
            name: conn.name.clone(),
            host: conn.host.clone(),
            port: conn.port,
            password: conn.password.clone(),
            database: conn.database,
            group_id: conn.group_id.clone(),
            tags: serde_json::to_string(&conn.tags).unwrap_or_else(|_| "[]".to_string()),
            ssl: conn.ssl,
            created_at: conn.created_at,
            updated_at: conn.updated_at,
        }
    }
}

impl From<DbConnection> for Connection {
    fn from(db_conn: DbConnection) -> Self {
        Connection {
            id: db_conn.id,
            name: db_conn.name,
            host: db_conn.host,
            port: db_conn.port,
            password: db_conn.password,
            database: db_conn.database,
            group_id: db_conn.group_id,
            tags: serde_json::from_str(&db_conn.tags).unwrap_or_default(),
            ssl: db_conn.ssl,
            created_at: db_conn.created_at,
            updated_at: db_conn.updated_at,
        }
    }
}

impl From<&ConnectionGroup> for DbConnectionGroup {
    fn from(group: &ConnectionGroup) -> Self {
        DbConnectionGroup {
            id: group.id.clone(),
            name: group.name.clone(),
            color: group.color.clone(),
            order_index: group.order,
        }
    }
}

impl From<DbConnectionGroup> for ConnectionGroup {
    fn from(db_group: DbConnectionGroup) -> Self {
        ConnectionGroup {
            id: db_group.id,
            name: db_group.name,
            color: db_group.color,
            order: db_group.order_index,
        }
    }
}

#[tauri::command]
pub async fn create_connection(
    state: State<'_, AppState>,
    name: String,
    host: String,
    port: u16,
    password: Option<String>,
    database: u8,
    group_id: Option<String>,
    tags: Vec<String>,
    ssl: bool,
) -> Result<Connection, String> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp();

    let connection = Connection {
        id,
        name,
        host,
        port,
        password,
        database,
        group_id,
        tags,
        ssl,
        created_at: now,
        updated_at: now,
    };

    let db_conn: DbConnection = (&connection).into();

    let db_guard = state.db.lock().unwrap();
    if let Some(db) = db_guard.as_ref() {
        db.create_connection(&db_conn).map_err(|e| e.to_string())?;
    } else {
        return Err("Database not initialized".to_string());
    }

    Ok(connection)
}

#[tauri::command]
pub async fn update_connection(
    state: State<'_, AppState>,
    id: String,
    name: String,
    host: String,
    port: u16,
    password: Option<String>,
    database: u8,
    group_id: Option<String>,
    tags: Vec<String>,
    ssl: bool,
) -> Result<(), String> {
    println!("update_connection called with group_id: {:?}", group_id);
    let now = chrono::Utc::now().timestamp();

    let connection = Connection {
        id,
        name,
        host,
        port,
        password,
        database,
        group_id,
        tags,
        ssl,
        created_at: 0, // Will be ignored in update
        updated_at: now,
    };

    let db_conn: DbConnection = (&connection).into();
    println!("db_conn group_id: {:?}", db_conn.group_id);

    let db_guard = state.db.lock().unwrap();
    if let Some(db) = db_guard.as_ref() {
        db.update_connection(&db_conn).map_err(|e| e.to_string())?;
        println!("Connection updated successfully");
    } else {
        return Err("Database not initialized".to_string());
    }

    Ok(())
}

#[tauri::command]
pub async fn delete_connection(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let db_guard = state.db.lock().unwrap();
    if let Some(db) = db_guard.as_ref() {
        db.delete_connection(&id).map_err(|e| e.to_string())?;
    } else {
        return Err("Database not initialized".to_string());
    }

    Ok(())
}

#[tauri::command]
pub async fn get_connections(state: State<'_, AppState>) -> Result<Vec<Connection>, String> {
    let db_guard = state.db.lock().unwrap();
    if let Some(db) = db_guard.as_ref() {
        let db_conns = db.get_connections().map_err(|e| e.to_string())?;
        Ok(db_conns.into_iter().map(|c| c.into()).collect())
    } else {
        Err("Database not initialized".to_string())
    }
}

#[tauri::command]
pub async fn test_connection(
    host: String,
    port: u16,
    password: Option<String>,
) -> Result<bool, String> {
    use crate::redis_client::RedisConnectionManager;
    RedisConnectionManager::test_connection(&host, port, password.as_deref())
}

#[tauri::command]
pub async fn create_group(
    state: State<'_, AppState>,
    name: String,
    color: String,
    order: i32,
) -> Result<ConnectionGroup, String> {
    let id = Uuid::new_v4().to_string();
    let group = ConnectionGroup { id, name, color, order };

    let db_group: DbConnectionGroup = (&group).into();

    let db_guard = state.db.lock().unwrap();
    if let Some(db) = db_guard.as_ref() {
        db.create_group(&db_group).map_err(|e| e.to_string())?;
    } else {
        return Err("Database not initialized".to_string());
    }

    Ok(group)
}

#[tauri::command]
pub async fn get_groups(state: State<'_, AppState>) -> Result<Vec<ConnectionGroup>, String> {
    let db_guard = state.db.lock().unwrap();
    if let Some(db) = db_guard.as_ref() {
        let db_groups = db.get_groups().map_err(|e| e.to_string())?;
        Ok(db_groups.into_iter().map(|g| g.into()).collect())
    } else {
        Err("Database not initialized".to_string())
    }
}

#[tauri::command]
pub async fn update_group(
    state: State<'_, AppState>,
    id: String,
    name: String,
    color: String,
    order: i32,
) -> Result<(), String> {
    let group = ConnectionGroup { id, name, color, order };
    let db_group: DbConnectionGroup = (&group).into();

    let db_guard = state.db.lock().unwrap();
    if let Some(db) = db_guard.as_ref() {
        db.update_group(&db_group).map_err(|e| e.to_string())?;
    } else {
        return Err("Database not initialized".to_string());
    }

    Ok(())
}

#[tauri::command]
pub async fn delete_group(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let db_guard = state.db.lock().unwrap();
    if let Some(db) = db_guard.as_ref() {
        db.delete_group(&id).map_err(|e| e.to_string())?;
    } else {
        return Err("Database not initialized".to_string());
    }

    Ok(())
}
