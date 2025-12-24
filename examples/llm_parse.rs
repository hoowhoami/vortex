use lumina::{Graph, FetchNode, LLMParseNode};
use std::sync::Arc;

#[tokio::main]
async fn main() -> lumina::Result<()> {
    println!("=== LLM Parse Demo ===\n");

    let graph = Graph::new()
        .add_node(Arc::new(FetchNode::new()))
        .add_node(Arc::new(
            LLMParseNode::new("Extract the title, main content paragraphs, and any links".to_string())
        ));

    let result = graph.execute("https://example.com".to_string()).await?;

    println!("URL: {}", result.url);
    println!("\nGenerated Selectors:");
    if let Some(selectors) = result.metadata.get("generated_selectors") {
        println!("{}", selectors);
    }

    println!("\nExtracted Data:");
    match serde_json::to_string_pretty(&result.extracted) {
        Ok(json) => println!("{}", json),
        Err(e) => eprintln!("Serialization error: {}", e),
    }

    Ok(())
}
