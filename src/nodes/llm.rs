use async_trait::async_trait;
use llm_connector::{LlmClient, types::{ChatRequest, Message, Role}};
use crate::error::{LuminaError, Result};
use crate::nodes::Node;
use crate::types::ScrapedData;
use serde_json::json;

pub struct LLMNode {
    prompt: String,
    provider: String,
    api_key: Option<String>,
    api_url: Option<String>,
    model: String,
}

impl LLMNode {
    pub fn new(prompt: String) -> Self {
        Self {
            prompt,
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

    async fn extract_with_llm(&self, html: &str) -> Result<String> {
        let client = match self.provider.to_lowercase().as_str() {
            "anthropic" => {
                let api_key = self.api_key.as_ref()
                    .ok_or_else(|| LuminaError::NodeError("ANTHROPIC_API_KEY not set".to_string()))?;

                if let Some(url) = &self.api_url {
                    LlmClient::anthropic_with_config(api_key, Some(url), None, None)
                } else {
                    LlmClient::anthropic(api_key)
                }
                .map_err(|e| LuminaError::NodeError(format!("Failed to create client: {}", e)))?
            }
            "openai" => {
                let api_key = self.api_key.as_ref()
                    .ok_or_else(|| LuminaError::NodeError("OPENAI_API_KEY not set".to_string()))?;

                if let Some(url) = &self.api_url {
                    LlmClient::openai_compatible(api_key, url, "openai")
                } else {
                    LlmClient::openai(api_key)
                }
                .map_err(|e| LuminaError::NodeError(format!("Failed to create client: {}", e)))?
            }
            _ => return Err(LuminaError::NodeError(format!("Unsupported provider: {}", self.provider))),
        };

        let request = ChatRequest {
            model: self.model.clone(),
            messages: vec![Message::text(
                Role::User,
                format!("{}\n\nHTML:\n{}", self.prompt, html)
            )],
            ..Default::default()
        };

        let response = client.chat(&request)
            .await
            .map_err(|e| LuminaError::NodeError(format!("LLM API error: {}", e)))?;

        Ok(response.content)
    }
}

#[async_trait]
impl Node for LLMNode {
    async fn execute(&self, mut data: ScrapedData) -> Result<ScrapedData> {
        data.metadata.insert("llm_prompt".to_string(), self.prompt.clone());
        data.metadata.insert("llm_provider".to_string(), self.provider.clone());
        data.metadata.insert("llm_model".to_string(), self.model.clone());
        if let Some(url) = &self.api_url {
            data.metadata.insert("llm_api_url".to_string(), url.clone());
        }

        match self.extract_with_llm(&data.html).await {
            Ok(result) => {
                data.extracted.insert("llm_extraction".to_string(), json!(result));
                data.metadata.insert("llm_status".to_string(), "success".to_string());
            }
            Err(e) => {
                data.metadata.insert("llm_status".to_string(), format!("error: {}", e));
            }
        }

        Ok(data)
    }

    fn name(&self) -> &str {
        "LLMNode"
    }
}
