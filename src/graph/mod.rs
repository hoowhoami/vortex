use crate::error::{LuminaError, Result};
use crate::nodes::Node;
use crate::types::ScrapedData;
use std::sync::Arc;

pub struct Graph {
    nodes: Vec<Arc<dyn Node>>,
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
}
