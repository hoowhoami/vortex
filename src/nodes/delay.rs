use async_trait::async_trait;
use std::time::Duration;
use tokio::time::sleep;
use crate::error::Result;
use crate::nodes::Node;
use crate::types::ScrapedData;

pub struct DelayNode {
    delay_ms: u64,
}

impl DelayNode {
    pub fn new(delay_ms: u64) -> Self {
        Self { delay_ms }
    }
}

#[async_trait]
impl Node for DelayNode {
    async fn execute(&self, data: ScrapedData) -> Result<ScrapedData> {
        sleep(Duration::from_millis(self.delay_ms)).await;
        Ok(data)
    }

    fn name(&self) -> &str {
        "DelayNode"
    }
}
