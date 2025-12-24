use lumina::{Graph, FetchNode, AttributeNode, RegexNode};
use std::sync::Arc;

#[tokio::main]
async fn main() -> lumina::Result<()> {
    let graph = Graph::new()
        .add_node(Arc::new(FetchNode::new()))
        .add_node(Arc::new(
            AttributeNode::new(vec![])
                .with_attribute("links".to_string(), "a".to_string(), "href".to_string())
        ))
        .add_node(Arc::new(
            RegexNode::new(vec![])
                .with_pattern("emails".to_string(), r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b".to_string())
        ));

    let result = graph.execute("https://example.com".to_string()).await?;

    println!("URL: {}", result.url);
    println!("\nExtracted:");
    match serde_json::to_string_pretty(&result.extracted) {
        Ok(json) => println!("{}", json),
        Err(e) => eprintln!("Error: {}", e),
    }

    Ok(())
}
