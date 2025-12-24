use crate::task::{Task, TaskStatus};
use crate::store::TaskStore;
use crate::graph::Graph;
use crate::error::Result;
use chrono::Utc;
use std::sync::Arc;
use std::collections::HashMap;

pub struct TaskExecutor {
    store: TaskStore,
    graphs: HashMap<String, Arc<Graph>>,
}

impl TaskExecutor {
    pub async fn new(database_url: &str) -> Result<Self> {
        let store = TaskStore::new(database_url).await?;
        Ok(Self {
            store,
            graphs: HashMap::new(),
        })
    }

    pub async fn submit(&mut self, mut task: Task) -> Result<String> {
        task.status = TaskStatus::Pending;

        // Store graph separately
        if let Some(graph) = task.graph.take() {
            self.graphs.insert(task.id.clone(), graph);
        }

        self.store.save(&task).await?;
        Ok(task.id.clone())
    }

    pub async fn execute(&self, task_id: &str) -> Result<()> {
        let mut task = self.store.get(task_id).await?
            .ok_or_else(|| crate::error::LuminaError::NodeError("Task not found".to_string()))?;

        let graph = self.graphs.get(task_id)
            .ok_or_else(|| crate::error::LuminaError::NodeError("Task graph not found".to_string()))?;

        task.status = TaskStatus::Running;
        task.updated_at = Utc::now();
        self.store.save(&task).await?;

        match graph.execute(task.url.clone()).await {
            Ok(result) => {
                task.status = TaskStatus::Success;
                task.result = Some(serde_json::to_string(&result.extracted).unwrap_or_default());
                task.error = None;
            }
            Err(e) => {
                task.status = TaskStatus::Failed;
                task.error = Some(e.to_string());
                task.retry_count += 1;
            }
        }

        task.updated_at = Utc::now();
        self.store.save(&task).await?;

        if task.should_retry() {
            Box::pin(self.execute(task_id)).await?;
        }

        Ok(())
    }

    pub async fn get_task(&self, task_id: &str) -> Result<Option<Task>> {
        self.store.get(task_id).await
    }

    pub async fn list_tasks(&self, status: TaskStatus) -> Result<Vec<Task>> {
        self.store.list_by_status(status).await
    }
}
