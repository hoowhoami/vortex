use lumina::{Graph, FetchNode, ParseNode, AttributeNode, RegexNode, DelayNode};
use std::sync::Arc;

#[tokio::main]
async fn main() -> lumina::Result<()> {
    println!("=== Lumina Comprehensive Demo ===\n");

    let graph = Graph::new()
        .add_node(Arc::new(FetchNode::with_timeout(10)))
        .add_node(Arc::new(ParseNode::new(vec![
            ("title".to_string(), "h1".to_string()),
            ("paragraphs".to_string(), "p".to_string()),
        ])))
        .add_node(Arc::new(
            AttributeNode::new(vec![])
                .with_attribute("links".to_string(), "a".to_string(), "href".to_string())
        ))
        .add_node(Arc::new(
            RegexNode::new(vec![])
                .with_pattern("domains".to_string(), r"https?://[^\s/$.?#].[^\s]*".to_string())
        ))
        .add_node(Arc::new(DelayNode::new(500)));

    let result = graph.execute("https://example.com".to_string()).await?;

    println!("✓ Scraped: {}", result.url);
    println!("✓ Status: {}\n", result.metadata.get("status_code").unwrap_or(&"N/A".to_string()));

    println!("Extracted Data:");
    println!("{}\n", serde_json::to_string_pretty(&result.extracted).unwrap_or_default());

    println!("=== Parallel Scraping Demo ===\n");

    let urls = vec![
        "https://example.com".to_string(),
        "https://example.org".to_string(),
    ];

    let results = graph.execute_parallel(urls).await;

    for (i, result) in results.iter().enumerate() {
        match result {
            Ok(data) => println!("✓ URL {}: {} (Status: {})",
                i + 1,
                data.url,
                data.metadata.get("status_code").unwrap_or(&"N/A".to_string())
            ),
            Err(e) => println!("✗ URL {}: Error - {}", i + 1, e),
        }
    }

    Ok(())
}
