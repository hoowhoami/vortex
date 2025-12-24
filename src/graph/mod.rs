use crate::error::{LuminaError, Result};
use crate::nodes::Node;
use crate::types::ScrapedData;
use std::sync::Arc;

pub struct Graph {
    nodes: Vec<Arc<dyn Node>>,
}

impl std::fmt::Debug for Graph {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Graph")
            .field("nodes", &format!("{} nodes", self.nodes.len()))
            .finish()
    }
}

impl Graph {
    pub fn new() -> Self {
        Self { nodes: Vec::new() }
    }

    pub fn add_node(mut self, node: Arc<dyn Node>) -> Self {
        self.nodes.push(node);
        self
    }

    pub async fn execute(&self, url: String) -> Result<ScrapedData> {
        let mut data = ScrapedData::new(url, String::new());

        for node in &self.nodes {
            data = node.execute(data).await.map_err(|e| {
                LuminaError::GraphError(format!("Node '{}' failed: {}", node.name(), e))
            })?;
        }

        Ok(data)
    }

    pub async fn execute_batch(&self, urls: Vec<String>) -> Vec<Result<ScrapedData>> {
        let mut results = Vec::new();
        for url in urls {
            results.push(self.execute(url).await);
        }
        results
    }

    pub async fn execute_parallel(&self, urls: Vec<String>) -> Vec<Result<ScrapedData>> {
        let futures: Vec<_> = urls.into_iter()
            .map(|url| self.execute(url))
            .collect();

        futures::future::join_all(futures).await
    }
}
