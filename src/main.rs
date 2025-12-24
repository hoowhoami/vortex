use lumina::{Graph, FetchNode, ParseNode, LLMNode};
use std::sync::Arc;

#[tokio::main]
async fn main() -> lumina::Result<()> {
    let graph = Graph::new()
        .add_node(Arc::new(FetchNode::new()))
        .add_node(Arc::new(ParseNode::new(vec![
            ("title".to_string(), "h1".to_string()),
            ("paragraphs".to_string(), "p".to_string()),
        ])))
        .add_node(Arc::new(LLMNode::new(
            "Extract key information from the content".to_string()
        )));

    let result = graph.execute("https://example.com".to_string()).await?;

    println!("Scraped URL: {}", result.url);
    println!("Status: {}", result.metadata.get("status_code").unwrap_or(&"N/A".to_string()));
    println!("\nExtracted data:");
    match serde_json::to_string_pretty(&result.extracted) {
        Ok(json) => println!("{}", json),
        Err(e) => eprintln!("Failed to serialize: {}", e),
    }

    Ok(())
}
