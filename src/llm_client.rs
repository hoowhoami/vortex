use llm_connector::LlmClient;
use crate::error::{LuminaError, Result};

pub struct LLMClientBuilder {
    provider: String,
    api_key: Option<String>,
    api_url: Option<String>,
}

impl LLMClientBuilder {
    pub fn new(provider: String, api_key: Option<String>, api_url: Option<String>) -> Self {
        Self { provider, api_key, api_url }
    }

    pub fn build(&self) -> Result<LlmClient> {
        match self.provider.to_lowercase().as_str() {
            "anthropic" => {
                let api_key = self.api_key.as_ref()
                    .ok_or_else(|| LuminaError::NodeError("ANTHROPIC_API_KEY not set".to_string()))?;

                if let Some(url) = &self.api_url {
                    LlmClient::anthropic_with_config(api_key, Some(url), None, None)
                } else {
                    LlmClient::anthropic(api_key)
                }
                .map_err(|e| LuminaError::NodeError(format!("Failed to create client: {}", e)))
            }
            "openai" => {
                let api_key = self.api_key.as_ref()
                    .ok_or_else(|| LuminaError::NodeError("OPENAI_API_KEY not set".to_string()))?;

                if let Some(url) = &self.api_url {
                    LlmClient::openai_compatible(api_key, url, "openai")
                } else {
                    LlmClient::openai(api_key)
                }
                .map_err(|e| LuminaError::NodeError(format!("Failed to create client: {}", e)))
            }
            _ => Err(LuminaError::NodeError(format!("Unsupported provider: {}", self.provider))),
        }
    }
}
