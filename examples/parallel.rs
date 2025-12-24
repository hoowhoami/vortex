use lumina::{Graph, FetchNode, ParseNode};
use std::sync::Arc;

#[tokio::main]
async fn main() -> lumina::Result<()> {
    let urls = vec![
        "https://example.com".to_string(),
        "https://example.org".to_string(),
        "https://example.net".to_string(),
    ];

    let graph = Graph::new()
        .add_node(Arc::new(FetchNode::new()))
        .add_node(Arc::new(ParseNode::new(vec![
            ("title".to_string(), "h1".to_string()),
            ("paragraphs".to_string(), "p".to_string()),
        ])));

    println!("Scraping {} URLs in parallel...\n", urls.len());

    let results = graph.execute_parallel(urls).await;

    for (i, result) in results.iter().enumerate() {
        match result {
            Ok(data) => {
                println!("Result {}:", i + 1);
                println!("  URL: {}", data.url);
                println!("  Status: {}", data.metadata.get("status_code").unwrap_or(&"N/A".to_string()));
                println!("  Extracted: {} fields", data.extracted.len());
            }
            Err(e) => {
                println!("Result {}: Error - {}", i + 1, e);
            }
        }
        println!();
    }

    Ok(())
}
