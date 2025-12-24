pub mod fetch;
pub mod parse;
pub mod llm;
pub mod delay;
pub mod json;
pub mod regex;
pub mod attribute;
pub mod llm_parse;

use async_trait::async_trait;
use crate::error::Result;
use crate::types::ScrapedData;

#[async_trait]
pub trait Node: Send + Sync {
    async fn execute(&self, data: ScrapedData) -> Result<ScrapedData>;
    fn name(&self) -> &str;
}
