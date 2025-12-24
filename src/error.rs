use thiserror::Error;

#[derive(Error, Debug)]
pub enum LuminaError {
    #[error("HTTP request failed: {0}")]
    HttpError(#[from] reqwest::Error),

    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("Node execution failed: {0}")]
    NodeError(String),

    #[error("Graph execution failed: {0}")]
    GraphError(String),
}

pub type Result<T> = std::result::Result<T, LuminaError>;
