use async_trait::async_trait;
use scraper::{Html, Selector};
use crate::error::{LuminaError, Result};
use crate::nodes::Node;
use crate::types::ScrapedData;
use serde_json::json;

pub struct AttributeNode {
    selectors: Vec<(String, String, String)>,
}

impl AttributeNode {
    pub fn new(selectors: Vec<(String, String, String)>) -> Self {
        Self { selectors }
    }

    pub fn with_attribute(mut self, key: String, selector: String, attr: String) -> Self {
        self.selectors.push((key, selector, attr));
        self
    }
}

#[async_trait]
impl Node for AttributeNode {
    async fn execute(&self, mut data: ScrapedData) -> Result<ScrapedData> {
        let document = Html::parse_document(&data.html);

        for (key, selector_str, attr) in &self.selectors {
            let selector = Selector::parse(selector_str)
                .map_err(|e| LuminaError::ParseError(format!("Invalid selector: {}", e)))?;

            let attributes: Vec<String> = document
                .select(&selector)
                .filter_map(|el| el.value().attr(attr))
                .map(|s| s.to_string())
                .collect();

            data.extracted.insert(key.clone(), json!(attributes));
        }

        Ok(data)
    }

    fn name(&self) -> &str {
        "AttributeNode"
    }
}
