use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrapedData {
    pub url: String,
    pub html: String,
    pub metadata: HashMap<String, String>,
    pub extracted: HashMap<String, serde_json::Value>,
}

impl ScrapedData {
    pub fn new(url: String, html: String) -> Self {
        Self {
            url,
            html,
            metadata: HashMap::new(),
            extracted: HashMap::new(),
        }
    }
}
