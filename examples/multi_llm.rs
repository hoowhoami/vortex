use lumina::{Graph, FetchNode, ParseNode, LLMNode};
use std::sync::Arc;

#[tokio::main]
async fn main() -> lumina::Result<()> {
    println!("=== Multi-Provider LLM Demo ===\n");

    // Example 1: Anthropic Claude
    println!("1. Using Anthropic Claude:");
    let graph_anthropic = Graph::new()
        .add_node(Arc::new(FetchNode::new()))
        .add_node(Arc::new(ParseNode::new(vec![
            ("content".to_string(), "p".to_string()),
        ])))
        .add_node(Arc::new(
            LLMNode::new("Summarize this content in one sentence.".to_string())
                .with_provider("anthropic".to_string())
                .with_model("claude-sonnet-4-5-20250929".to_string())
        ));

    match graph_anthropic.execute("https://example.com".to_string()).await {
        Ok(result) => {
            println!("   Provider: {}", result.metadata.get("llm_provider").unwrap_or(&"N/A".to_string()));
            println!("   Model: {}", result.metadata.get("llm_model").unwrap_or(&"N/A".to_string()));
            println!("   Status: {}\n", result.metadata.get("llm_status").unwrap_or(&"N/A".to_string()));
        }
        Err(e) => println!("   Error: {}\n", e),
    }

    // Example 2: OpenAI-compatible (OpenAI, DeepSeek, etc.)
    println!("2. Using OpenAI-compatible API:");
    let graph_openai = Graph::new()
        .add_node(Arc::new(FetchNode::new()))
        .add_node(Arc::new(
            LLMNode::new("Extract key information.".to_string())
                .with_provider("openai".to_string())
                .with_model("gpt-4o".to_string())
        ));

    match graph_openai.execute("https://example.com".to_string()).await {
        Ok(result) => {
            println!("   Provider: {}", result.metadata.get("llm_provider").unwrap_or(&"N/A".to_string()));
            println!("   Status: {}\n", result.metadata.get("llm_status").unwrap_or(&"N/A".to_string()));
        }
        Err(e) => println!("   Error: {}\n", e),
    }

    // Example 3: Custom URL (e.g., DeepSeek)
    println!("3. Using custom OpenAI-compatible URL:");
    let graph_custom = Graph::new()
        .add_node(Arc::new(FetchNode::new()))
        .add_node(Arc::new(
            LLMNode::new("Analyze this page.".to_string())
                .with_provider("openai".to_string())
                .with_api_url("https://api.deepseek.com".to_string())
                .with_model("deepseek-chat".to_string())
        ));

    match graph_custom.execute("https://example.com".to_string()).await {
        Ok(result) => {
            println!("   Provider: {}", result.metadata.get("llm_provider").unwrap_or(&"N/A".to_string()));
            println!("   API URL: {}", result.metadata.get("llm_api_url").unwrap_or(&"N/A".to_string()));
            println!("   Status: {}\n", result.metadata.get("llm_status").unwrap_or(&"N/A".to_string()));
        }
        Err(e) => println!("   Error: {}\n", e),
    }

    println!("\n=== Demo Complete ===");
    Ok(())
}
