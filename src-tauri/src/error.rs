use std::{fmt, io};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct AppError {
    message: String,
}

impl Into<String> for AppError {
    fn into(self) -> String {
        self.message
    }
}

impl From<fmt::Error> for AppError {
    fn from(value: fmt::Error) -> Self {
        AppError {
            message: value.to_string()
        }
    }
}

impl From<io::Error> for AppError {
    fn from(value: io::Error) -> Self {
        AppError {
            message: value.to_string()
        }
    }
}