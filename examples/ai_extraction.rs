use lumina::{Graph, FetchNode, ParseNode, LLMNode};
use std::sync::Arc;

#[tokio::main]
async fn main() -> lumina::Result<()> {
    let graph = Graph::new()
        .add_node(Arc::new(FetchNode::new()))
        .add_node(Arc::new(ParseNode::new(vec![
            ("title".to_string(), "h1".to_string()),
            ("content".to_string(), "p".to_string()),
        ])))
        .add_node(Arc::new(
            LLMNode::new("Extract and summarize the key information from this page in 2-3 sentences.".to_string())
        ));

    let result = graph.execute("https://example.com".to_string()).await?;

    println!("URL: {}", result.url);
    println!("\nParsed data:");
    for (key, value) in &result.extracted {
        if key != "llm_extraction" {
            println!("  {}: {:?}", key, value);
        }
    }

    if let Some(llm_result) = result.extracted.get("llm_extraction") {
        println!("\nAI Summary:");
        println!("{}", llm_result);
    }

    println!("\nLLM Status: {}", result.metadata.get("llm_status").unwrap_or(&"N/A".to_string()));

    Ok(())
}
