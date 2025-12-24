use lumina::{Graph, FetchNode, ParseNode, DelayNode};
use std::sync::Arc;

#[tokio::main]
async fn main() -> lumina::Result<()> {
    let graph = Graph::new()
        .add_node(Arc::new(FetchNode::new()))
        .add_node(Arc::new(DelayNode::new(1000)))
        .add_node(Arc::new(ParseNode::new(vec![
            ("title".to_string(), "h1".to_string()),
        ])));

    println!("Scraping with 1 second delay between operations...\n");

    let result = graph.execute("https://example.com".to_string()).await?;

    println!("URL: {}", result.url);
    println!("Extracted: {:?}", result.extracted);

    Ok(())
}
