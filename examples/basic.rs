use lumina::{Graph, FetchNode, ParseNode, LLMNode};
use std::sync::Arc;

#[tokio::main]
async fn main() -> lumina::Result<()> {
    let graph = Graph::new()
        .add_node(Arc::new(FetchNode::new()))
        .add_node(Arc::new(ParseNode::new(vec![
            ("title".to_string(), "h1".to_string()),
            ("content".to_string(), "article, .content, main".to_string()),
        ])))
        .add_node(Arc::new(LLMNode::new(
            "Summarize the main points of this article".to_string()
        )));

    let result = graph.execute("https://example.com".to_string()).await?;

    println!("Scraped: {}", result.url);
    println!("\nMetadata:");
    for (key, value) in &result.metadata {
        println!("  {}: {}", key, value);
    }

    println!("\nExtracted:");
    match serde_json::to_string_pretty(&result.extracted) {
        Ok(json) => println!("{}", json),
        Err(e) => eprintln!("Serialization error: {}", e),
    }

    Ok(())
}
