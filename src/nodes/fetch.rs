use async_trait::async_trait;
use reqwest::Client;
use std::time::Duration;
use crate::error::Result;
use crate::nodes::Node;
use crate::types::ScrapedData;

pub struct FetchNode {
    client: Client,
}

impl FetchNode {
    pub fn new() -> Self {
        Self::with_timeout(30)
    }

    pub fn with_timeout(timeout_secs: u64) -> Self {
        Self {
            client: Client::builder()
                .user_agent("Lumina/0.1.0")
                .timeout(Duration::from_secs(timeout_secs))
                .build()
                .unwrap(),
        }
    }
}

#[async_trait]
impl Node for FetchNode {
    async fn execute(&self, mut data: ScrapedData) -> Result<ScrapedData> {
        let response = self.client.get(&data.url).send().await?;
        let status = response.status();
        data.metadata.insert("status_code".to_string(), status.as_str().to_string());

        data.html = response.error_for_status()?.text().await?;
        Ok(data)
    }

    fn name(&self) -> &str {
        "FetchNode"
    }
}
