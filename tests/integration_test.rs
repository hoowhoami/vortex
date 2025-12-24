#[cfg(test)]
mod tests {
    use lumina::{Graph, FetchNode, ParseNode, ScrapedData};
    use std::sync::Arc;

    #[tokio::test]
    async fn test_basic_scraping() {
        let graph = Graph::new()
            .add_node(Arc::new(FetchNode::new()))
            .add_node(Arc::new(ParseNode::new(vec![
                ("title".to_string(), "h1".to_string()),
            ])));

        let result = graph.execute("https://example.com".to_string()).await;
        assert!(result.is_ok());

        let data = result.unwrap();
        assert_eq!(data.url, "https://example.com");
        assert!(data.extracted.contains_key("title"));
    }

    #[tokio::test]
    async fn test_parallel_scraping() {
        let graph = Graph::new()
            .add_node(Arc::new(FetchNode::new()))
            .add_node(Arc::new(ParseNode::new(vec![
                ("title".to_string(), "h1".to_string()),
            ])));

        let urls = vec![
            "https://example.com".to_string(),
            "https://example.org".to_string(),
        ];

        let results = graph.execute_parallel(urls).await;
        assert_eq!(results.len(), 2);
        assert!(results[0].is_ok());
        assert!(results[1].is_ok());
    }

    #[test]
    fn test_scraped_data_creation() {
        let data = ScrapedData::new("https://test.com".to_string(), "<html></html>".to_string());
        assert_eq!(data.url, "https://test.com");
        assert_eq!(data.html, "<html></html>");
        assert!(data.metadata.is_empty());
        assert!(data.extracted.is_empty());
    }
}
