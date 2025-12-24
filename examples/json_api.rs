use lumina::{Graph, FetchNode, JsonNode};
use std::sync::Arc;

#[tokio::main]
async fn main() -> lumina::Result<()> {
    let graph = Graph::new()
        .add_node(Arc::new(FetchNode::new()))
        .add_node(Arc::new(JsonNode::new("".to_string())));

    let result = graph.execute("https://api.github.com/repos/rust-lang/rust".to_string()).await?;

    println!("Fetched JSON from: {}", result.url);
    println!("\nExtracted data:");
    match serde_json::to_string_pretty(&result.extracted) {
        Ok(json) => println!("{}", json),
        Err(e) => eprintln!("Serialization error: {}", e),
    }

    Ok(())
}
