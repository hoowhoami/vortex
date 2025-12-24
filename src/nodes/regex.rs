use async_trait::async_trait;
use regex::Regex;
use crate::error::{LuminaError, Result};
use crate::nodes::Node;
use crate::types::ScrapedData;
use serde_json::json;

pub struct RegexNode {
    patterns: Vec<(String, String)>,
}

impl RegexNode {
    pub fn new(patterns: Vec<(String, String)>) -> Self {
        Self { patterns }
    }

    pub fn with_pattern(mut self, key: String, pattern: String) -> Self {
        self.patterns.push((key, pattern));
        self
    }
}

#[async_trait]
impl Node for RegexNode {
    async fn execute(&self, mut data: ScrapedData) -> Result<ScrapedData> {
        for (key, pattern_str) in &self.patterns {
            let regex = Regex::new(pattern_str)
                .map_err(|e| LuminaError::ParseError(format!("Invalid regex: {}", e)))?;

            let matches: Vec<String> = regex
                .find_iter(&data.html)
                .map(|m| m.as_str().to_string())
                .collect();

            data.extracted.insert(key.clone(), json!(matches));
        }

        Ok(data)
    }

    fn name(&self) -> &str {
        "RegexNode"
    }
}
