use async_trait::async_trait;
use crate::error::{LuminaError, Result};
use crate::nodes::Node;
use crate::types::ScrapedData;
use serde_json::Value;

pub struct JsonNode {
    path: String,
}

impl JsonNode {
    pub fn new(path: String) -> Self {
        Self { path }
    }
}

#[async_trait]
impl Node for JsonNode {
    async fn execute(&self, mut data: ScrapedData) -> Result<ScrapedData> {
        let json: Value = serde_json::from_str(&data.html)
            .map_err(|e| LuminaError::ParseError(format!("Invalid JSON: {}", e)))?;

        if self.path.is_empty() {
            data.extracted.insert("json".to_string(), json);
        } else {
            let parts: Vec<&str> = self.path.split('.').collect();
            let mut current = &json;

            for part in &parts {
                current = current.get(part)
                    .ok_or_else(|| LuminaError::ParseError(format!("Path not found: {}", self.path)))?;
            }

            data.extracted.insert(self.path.clone(), current.clone());
        }

        Ok(data)
    }

    fn name(&self) -> &str {
        "JsonNode"
    }
}
