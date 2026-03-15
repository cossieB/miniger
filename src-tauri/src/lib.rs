pub mod commands;
mod error;
mod extensions;
pub mod setup;
pub mod events;
pub mod window;
mod logger;
pub use error::AppError;
pub use extensions::EXTENSIONS;