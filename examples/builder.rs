use lumina::{Graph, FetchNode, ParseNode};
use std::sync::Arc;

#[tokio::main]
async fn main() -> lumina::Result<()> {
    let graph = Graph::new()
        .add_node(Arc::new(FetchNode::with_timeout(10)))
        .add_node(Arc::new(
            ParseNode::new(vec![])
                .with_selector("title".to_string(), "h1".to_string())
                .with_selector("links".to_string(), "a".to_string())
                .with_selector("headings".to_string(), "h2, h3".to_string())
        ));

    let result = graph.execute("https://example.com".to_string()).await?;

    println!("URL: {}", result.url);
    println!("\nExtracted data:");
    for (key, value) in &result.extracted {
        println!("  {}: {}", key, value);
    }

    Ok(())
}
