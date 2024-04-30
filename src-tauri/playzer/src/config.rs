use crate::format;

#[derive(Debug, PartialEq)]
pub struct Config {
    playlist: String,
    format: format::Format,
    keep_duplicates: bool,
    shuffle: bool,
    output_format: format::Format,
}
impl Config {
    pub fn new(playlist: String, output_format: &str, keep_duplicates: bool, shuffle: bool) -> Result<Config, String> {

        let format = format::Format::get_format(&playlist)?;

        let output_format = format::Format::get_format_from_ext(&output_format).unwrap_or_else(|_| {
            println!("Unrecognized output format (2nd argument). Defaulting to original playlist format");
            format.clone()
        });

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