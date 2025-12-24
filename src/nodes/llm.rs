use async_trait::async_trait;
use crate::error::Result;
use crate::nodes::Node;
use crate::types::ScrapedData;

pub struct LLMNode {
    prompt: String,
}

impl LLMNode {
    pub fn new(prompt: String) -> Self {
        Self { prompt }
    }
}

#[async_trait]
impl Node for LLMNode {
    async fn execute(&self, mut data: ScrapedData) -> Result<ScrapedData> {
        data.metadata.insert("llm_prompt".to_string(), self.prompt.clone());
        data.metadata.insert("llm_note".to_string(),
            "LLM integration placeholder - connect to Claude API or other LLM".to_string());
        Ok(data)
    }

    fn name(&self) -> &str {
        "LLMNode"
    }
}
