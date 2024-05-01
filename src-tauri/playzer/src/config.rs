use crate::format::{self, Format};

#[derive(Debug, PartialEq)]
pub struct Config {
    playlist: String,
    format: format::Format,
    keep_duplicates: bool,
    shuffle: bool,
    output_format: format::Format,
}
impl Config {
    pub fn new(playlist: String, output_format: Option<Format>, keep_duplicates: bool, shuffle: bool) -> Result<Config, String> {

        let format = format::Format::get_format(&playlist)?;

        let output_format = output_format.unwrap_or(format.clone());

        Ok(Config {
            playlist,
            format,
            keep_duplicates,
            shuffle,
            output_format,
        })
    }
    // Getters
    pub fn playlist(&self) -> &str {
        &self.playlist
    }
    pub fn format(&self) -> &format::Format {
        &self.format
    }
    pub fn keep_duplicates(&self) -> bool {
        self.keep_duplicates
    }
    pub fn shuffle(&self) -> bool {
        self.shuffle
    }
    pub fn output_format(&self) -> &format::Format {
        &self.output_format
    }
}