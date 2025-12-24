use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use crate::graph::Graph;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TaskStatus {
    Pending,
    Running,
    Success,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub url: String,
    pub status: TaskStatus,
    pub retry_count: u32,
    pub max_retries: u32,
    pub result: Option<String>,
    pub error: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(skip)]
    pub graph: Option<Arc<Graph>>,
}

impl Task {
    pub fn new(url: String, graph: Arc<Graph>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            url,
            status: TaskStatus::Pending,
            retry_count: 0,
            max_retries: 3,
            result: None,
            error: None,
            created_at: now,
            updated_at: now,
            graph: Some(graph),
        }
    }

    pub fn with_max_retries(mut self, max_retries: u32) -> Self {
        self.max_retries = max_retries;
        self
    }

    pub fn should_retry(&self) -> bool {
        self.status == TaskStatus::Failed && self.retry_count < self.max_retries
    }
}
