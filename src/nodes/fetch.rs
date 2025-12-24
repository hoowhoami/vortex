use async_trait::async_trait;
use reqwest::Client;
use crate::error::{LuminaError, Result};
use crate::nodes::Node;
use crate::types::ScrapedData;

pub struct FetchNode {
    client: Client,
}

impl FetchNode {
    pub fn new() -> Self {
        Self {
            client: Client::builder()
                .user_agent("Lumina/0.1.0")
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

        if !status.is_success() {
            return Err(LuminaError::HttpError(
                reqwest::Error::from(response.error_for_status().unwrap_err())
            ));
        }

        data.html = response.text().await?;
        Ok(data)
    }

    fn name(&self) -> &str {
        "FetchNode"
    }
}
