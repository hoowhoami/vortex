use lumina::{Graph, FetchNode, ParseNode, Task, TaskExecutor, TaskStatus};
use std::sync::Arc;

#[tokio::main]
async fn main() -> lumina::Result<()> {
    println!("=== Task-Driven Scraping Demo ===\n");

    // Create executor with SQLite storage (in-memory for demo)
    let mut executor = TaskExecutor::new("sqlite::memory:").await?;

    // Create scraping graph
    let graph = Arc::new(
        Graph::new()
            .add_node(Arc::new(FetchNode::new()))
            .add_node(Arc::new(ParseNode::new(vec![
                ("title".to_string(), "h1".to_string()),
                ("paragraphs".to_string(), "p".to_string()),
            ])))
    );

    // Submit tasks
    println!("Submitting tasks...");
    let urls = vec![
        "https://example.com",
        "https://example.org",
        "https://example.net",
    ];

    let mut task_ids = Vec::new();
    for url in urls {
        let task = Task::new(url.to_string(), graph.clone())
            .with_max_retries(2);
        let task_id = executor.submit(task).await?;
        println!("  ✓ Submitted task: {}", task_id);
        task_ids.push(task_id);
    }

    // Execute tasks
    println!("\nExecuting tasks...");
    for task_id in &task_ids {
        executor.execute(task_id).await?;

        if let Some(task) = executor.get_task(task_id).await? {
            match task.status {
                TaskStatus::Success => {
                    println!("  ✓ Task {} completed: {}", task_id, task.url);
                    if let Some(result) = task.result {
                        println!("    Result: {}", result);
                    }
                }
                TaskStatus::Failed => {
                    println!("  ✗ Task {} failed: {}", task_id, task.url);
                    if let Some(error) = task.error {
                        println!("    Error: {}", error);
                    }
                }
                _ => {}
            }
        }
    }

    // List all successful tasks
    println!("\nSuccessful tasks:");
    let successful = executor.list_tasks(TaskStatus::Success).await?;
    for task in successful {
        println!("  - {} ({})", task.url, task.id);
    }

    println!("\n=== Demo Complete ===");
    Ok(())
}
