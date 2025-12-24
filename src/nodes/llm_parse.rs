use async_trait::async_trait;
use llm_connector::{LlmClient, types::{ChatRequest, Message, Role}};
use scraper::{Html, Selector};
use crate::error::{LuminaError, Result};
use crate::nodes::Node;
use crate::types::ScrapedData;
use serde_json::json;

pub struct LLMParseNode {
    extraction_goal: String,
    provider: String,
    api_key: Option<String>,
    api_url: Option<String>,
    model: String,
}

impl LLMParseNode {
    pub fn new(extraction_goal: String) -> Self {
        Self {
            extraction_goal,
            provider: std::env::var("LLM_PROVIDER").unwrap_or_else(|_| "anthropic".to_string()),
            api_key: Self::get_api_key(&std::env::var("LLM_PROVIDER").unwrap_or_else(|_| "anthropic".to_string())),
            api_url: Self::get_api_url(&std::env::var("LLM_PROVIDER").unwrap_or_else(|_| "anthropic".to_string())),
            model: std::env::var("LLM_MODEL").unwrap_or_else(|_| "claude-sonnet-4-5-20250929".to_string()),
        }
    }

    pub fn with_provider(mut self, provider: String) -> Self {
        self.api_key = Self::get_api_key(&provider);
        self.api_url = Self::get_api_url(&provider);
        self.provider = provider;
        self
    }

    pub fn with_api_key(mut self, api_key: String) -> Self {
        self.api_key = Some(api_key);
        self
    }

    pub fn with_api_url(mut self, api_url: String) -> Self {
        self.api_url = Some(api_url);
        self
    }

    pub fn with_model(mut self, model: String) -> Self {
        self.model = model;
        self
    }

    fn get_api_key(provider: &str) -> Option<String> {
        match provider.to_lowercase().as_str() {
            "anthropic" => std::env::var("ANTHROPIC_API_KEY").ok(),
            "openai" => std::env::var("OPENAI_API_KEY").ok(),
            _ => None,
        }
    }

    fn get_api_url(provider: &str) -> Option<String> {
        match provider.to_lowercase().as_str() {
            "anthropic" => std::env::var("ANTHROPIC_API_URL").ok(),
            "openai" => std::env::var("OPENAI_API_URL").ok(),
            _ => None,
        }
    }

    async fn generate_selectors(&self, html: &str) -> Result<Vec<(String, String)>> {
        let client = crate::llm_client::LLMClientBuilder::new(
            self.provider.clone(),
            self.api_key.clone(),
            self.api_url.clone()
        ).build()?;

        let prompt = format!(
            r#"Analyze this HTML and generate CSS selectors to extract: {}

HTML:
{}

Return ONLY a JSON array of objects with "key" and "selector" fields. Example:
[{{"key": "title", "selector": "h1"}}, {{"key": "price", "selector": ".price"}}]"#,
            self.extraction_goal,
            &html[..html.len().min(8000)]
        );

        let request = ChatRequest {
            model: self.model.clone(),
            messages: vec![Message::text(Role::User, prompt)],
            ..Default::default()
        };

        let response = client.chat(&request).await
            .map_err(|e| LuminaError::NodeError(format!("LLM API error: {}", e)))?;

        let selectors: Vec<serde_json::Value> = serde_json::from_str(&response.content)
            .map_err(|e| LuminaError::ParseError(format!("Failed to parse LLM response: {}", e)))?;

        Ok(selectors.into_iter()
            .filter_map(|v| {
                let key = v.get("key")?.as_str()?.to_string();
                let selector = v.get("selector")?.as_str()?.to_string();
                Some((key, selector))
            })
            .collect())
    }
}

#[async_trait]
impl Node for LLMParseNode {
    async fn execute(&self, mut data: ScrapedData) -> Result<ScrapedData> {
        let selectors = self.generate_selectors(&data.html).await?;
        let document = Html::parse_document(&data.html);

        for (key, selector_str) in &selectors {
            let selector = Selector::parse(selector_str)
                .map_err(|e| LuminaError::ParseError(format!("Invalid selector: {}", e)))?;

            let elements: Vec<String> = document
                .select(&selector)
                .map(|el| el.text().collect::<String>().trim().to_string())
                .filter(|s| !s.is_empty())
                .collect();

            data.extracted.insert(key.clone(), json!(elements));
        }

        data.metadata.insert("smart_parse_goal".to_string(), self.extraction_goal.clone());
        data.metadata.insert("smart_parse_provider".to_string(), self.provider.clone());
        data.metadata.insert("generated_selectors".to_string(),
            serde_json::to_string(&selectors).unwrap_or_default());

        Ok(data)
    }

    fn name(&self) -> &str {
        "LLMParseNode"
    }
}
