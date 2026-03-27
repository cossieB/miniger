use serde::{Deserialize, Serialize};

mod metadata;
mod thumbnails;

pub use metadata::*;
pub use thumbnails::*;

#[derive(Serialize, Deserialize)]
pub struct FFprobeStream {
    codec_name: Option<String>,
    codec_type: Option<String>,
    width: Option<i32>,
    height: Option<i32>,
}

#[derive(Serialize, Deserialize)]
pub struct FFprobeFormat {
    duration: Option<String>,
    size: Option<String>,
    bit_rate: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct FfprobeMetadata {
    streams: Vec<FFprobeStream>,
    format: FFprobeFormat,
}

#[derive(Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct F {
    path: String,
    filmId: i32,
}