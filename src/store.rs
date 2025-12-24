use sqlx::{SqlitePool, Row};
use chrono::Utc;
use crate::task::{Task, TaskStatus};
use crate::error::{LuminaError, Result};

pub struct TaskStore {
    pool: SqlitePool,
}

impl TaskStore {
    pub async fn new(database_url: &str) -> Result<Self> {
        let pool = SqlitePool::connect(database_url)
            .await
            .map_err(|e| LuminaError::NodeError(format!("Database connection failed: {}", e)))?;

        let store = Self { pool };
        store.init().await?;
        Ok(store)
    }

    async fn init(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                url TEXT NOT NULL,
                status TEXT NOT NULL,
                retry_count INTEGER NOT NULL DEFAULT 0,
                max_retries INTEGER NOT NULL DEFAULT 3,
                result TEXT,
                error TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| LuminaError::NodeError(format!("Failed to create table: {}", e)))?;

        Ok(())
    }

    pub async fn save(&self, task: &Task) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO tasks (id, url, status, retry_count, max_retries, result, error, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                status = excluded.status,
                retry_count = excluded.retry_count,
                result = excluded.result,
                error = excluded.error,
                updated_at = excluded.updated_at
            "#,
        )
        .bind(&task.id)
        .bind(&task.url)
        .bind(format!("{:?}", task.status))
        .bind(task.retry_count as i64)
        .bind(task.max_retries as i64)
        .bind(&task.result)
        .bind(&task.error)
        .bind(task.created_at.to_rfc3339())
        .bind(task.updated_at.to_rfc3339())
        .execute(&self.pool)
        .await
        .map_err(|e| LuminaError::NodeError(format!("Failed to save task: {}", e)))?;

        Ok(())
    }

    pub async fn get(&self, id: &str) -> Result<Option<Task>> {
        let row = sqlx::query("SELECT * FROM tasks WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| LuminaError::NodeError(format!("Failed to get task: {}", e)))?;

        Ok(row.map(|r| Task {
            id: r.get("id"),
            url: r.get("url"),
            status: match r.get::<String, _>("status").as_str() {
                "Pending" => TaskStatus::Pending,
                "Running" => TaskStatus::Running,
                "Success" => TaskStatus::Success,
                "Failed" => TaskStatus::Failed,
                _ => TaskStatus::Pending,
            },
            retry_count: r.get::<i64, _>("retry_count") as u32,
            max_retries: r.get::<i64, _>("max_retries") as u32,
            result: r.get("result"),
            error: r.get("error"),
            created_at: r.get::<String, _>("created_at").parse().unwrap_or_else(|_| Utc::now()),
            updated_at: r.get::<String, _>("updated_at").parse().unwrap_or_else(|_| Utc::now()),
            graph: None,
        }))
    }

    pub async fn list_by_status(&self, status: TaskStatus) -> Result<Vec<Task>> {
        let rows = sqlx::query("SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC")
            .bind(format!("{:?}", status))
            .fetch_all(&self.pool)
            .await
            .map_err(|e| LuminaError::NodeError(format!("Failed to list tasks: {}", e)))?;

        Ok(rows.into_iter().map(|r| Task {
            id: r.get("id"),
            url: r.get("url"),
            status: match r.get::<String, _>("status").as_str() {
                "Pending" => TaskStatus::Pending,
                "Running" => TaskStatus::Running,
                "Success" => TaskStatus::Success,
                "Failed" => TaskStatus::Failed,
                _ => TaskStatus::Pending,
            },
            retry_count: r.get::<i64, _>("retry_count") as u32,
            max_retries: r.get::<i64, _>("max_retries") as u32,
            result: r.get("result"),
            error: r.get("error"),
            created_at: r.get::<String, _>("created_at").parse().unwrap_or_else(|_| Utc::now()),
            updated_at: r.get::<String, _>("updated_at").parse().unwrap_or_else(|_| Utc::now()),
            graph: None,
        }).collect())
    }
}
