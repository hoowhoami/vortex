use rusqlite::{Connection as DbConnection, Result, params};
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Connection {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: u16,
    pub password: Option<String>,
    pub database: u8,
    pub group_id: Option<String>,
    pub tags: String, // JSON string
    pub ssl: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConnectionGroup {
    pub id: String,
    pub name: String,
    pub color: String,
    pub order_index: i32,
}

pub struct Database {
    conn: DbConnection,
}

impl Database {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = DbConnection::open(db_path)?;
        let db = Database { conn };
        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&self) -> Result<()> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS connections (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                host TEXT NOT NULL,
                port INTEGER NOT NULL,
                password TEXT,
                database INTEGER NOT NULL,
                group_id TEXT,
                tags TEXT NOT NULL,
                ssl INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS connection_groups (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT NOT NULL,
                order_index INTEGER NOT NULL
            )",
            [],
        )?;

        Ok(())
    }

    // Connection CRUD operations
    pub fn create_connection(&self, conn: &Connection) -> Result<()> {
        self.conn.execute(
            "INSERT INTO connections (id, name, host, port, password, database, group_id, tags, ssl, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![
                conn.id,
                conn.name,
                conn.host,
                conn.port,
                conn.password,
                conn.database,
                conn.group_id,
                conn.tags,
                conn.ssl as i32,
                conn.created_at,
                conn.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn get_connections(&self) -> Result<Vec<Connection>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, host, port, password, database, group_id, tags, ssl, created_at, updated_at FROM connections ORDER BY created_at DESC"
        )?;

        let connections = stmt.query_map([], |row| {
            Ok(Connection {
                id: row.get(0)?,
                name: row.get(1)?,
                host: row.get(2)?,
                port: row.get(3)?,
                password: row.get(4)?,
                database: row.get(5)?,
                group_id: row.get(6)?,
                tags: row.get(7)?,
                ssl: row.get::<_, i32>(8)? != 0,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;

        Ok(connections)
    }

    pub fn get_connection(&self, id: &str) -> Result<Option<Connection>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, host, port, password, database, group_id, tags, ssl, created_at, updated_at FROM connections WHERE id = ?1"
        )?;

        let mut connections = stmt.query_map([id], |row| {
            Ok(Connection {
                id: row.get(0)?,
                name: row.get(1)?,
                host: row.get(2)?,
                port: row.get(3)?,
                password: row.get(4)?,
                database: row.get(5)?,
                group_id: row.get(6)?,
                tags: row.get(7)?,
                ssl: row.get::<_, i32>(8)? != 0,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })?;

        Ok(connections.next().transpose()?)
    }

    pub fn update_connection(&self, conn: &Connection) -> Result<()> {
        self.conn.execute(
            "UPDATE connections SET name = ?1, host = ?2, port = ?3, password = ?4, database = ?5,
             group_id = ?6, tags = ?7, ssl = ?8, updated_at = ?9 WHERE id = ?10",
            params![
                conn.name,
                conn.host,
                conn.port,
                conn.password,
                conn.database,
                conn.group_id,
                conn.tags,
                conn.ssl as i32,
                conn.updated_at,
                conn.id
            ],
        )?;
        Ok(())
    }

    pub fn delete_connection(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM connections WHERE id = ?1", [id])?;
        Ok(())
    }

    // Connection Group CRUD operations
    pub fn create_group(&self, group: &ConnectionGroup) -> Result<()> {
        self.conn.execute(
            "INSERT INTO connection_groups (id, name, color, order_index) VALUES (?1, ?2, ?3, ?4)",
            params![group.id, group.name, group.color, group.order_index],
        )?;
        Ok(())
    }

    pub fn get_groups(&self) -> Result<Vec<ConnectionGroup>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, color, order_index FROM connection_groups ORDER BY order_index ASC"
        )?;

        let groups = stmt.query_map([], |row| {
            Ok(ConnectionGroup {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                order_index: row.get(3)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;

        Ok(groups)
    }

    pub fn update_group(&self, group: &ConnectionGroup) -> Result<()> {
        self.conn.execute(
            "UPDATE connection_groups SET name = ?1, color = ?2, order_index = ?3 WHERE id = ?4",
            params![group.name, group.color, group.order_index, group.id],
        )?;
        Ok(())
    }

    pub fn delete_group(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM connection_groups WHERE id = ?1", [id])?;
        Ok(())
    }
}
