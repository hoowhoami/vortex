use async_trait::async_trait;
use scraper::{Html, Selector};
use crate::error::{LuminaError, Result};
use crate::nodes::Node;
use crate::types::ScrapedData;
use serde_json::json;

pub struct ParseNode {
    selectors: Vec<(String, String)>,
}

impl ParseNode {
    pub fn new(selectors: Vec<(String, String)>) -> Self {
        Self { selectors }
    }
}

#[async_trait]
impl Node for ParseNode {
    async fn execute(&self, mut data: ScrapedData) -> Result<ScrapedData> {
        let document = Html::parse_document(&data.html);

        for (key, selector_str) in &self.selectors {
            let selector = Selector::parse(selector_str)
                .map_err(|e| LuminaError::ParseError(format!("Invalid selector: {}", e)))?;

            let elements: Vec<String> = document
                .select(&selector)
                .map(|el| el.text().collect::<String>().trim().to_string())
                .filter(|s| !s.is_empty())
                .collect();

            data.extracted.insert(key.clone(), json!(elements));
        }

        Ok(data)
    }

    fn name(&self) -> &str {
        "ParseNode"
    }
}
