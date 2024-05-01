use std::path;

#[derive(Debug, PartialEq, Clone)]
pub enum Format {
    M3U,
    PLS,
    ASX,
    MPCPL
}

impl Format {
    pub fn get_format(path: &str) -> Result<Self, &'static str> {
        let path = path::Path::new(path);
        let ext = path.extension();
        
        match ext {
            None => Err("Unknown file format"),
            Some(os_str) => {
                match os_str.to_str() {
                    None => Err("Error reading playlist format"),
                    Some(ext) => Self::get_format_from_ext(ext),
                }
            }
        }
    }
    pub fn get_format_from_ext(ext: &str) -> Result<Self, &'static str> {
        match ext.to_lowercase().as_str() {
            "m3u" | "m3u8" => Ok(Self::M3U),
            "pls" => Ok(Self::PLS),
            "asx" => Ok(Self::ASX),
            "mpcpl" => Ok(Self::MPCPL),
            _ => Err("Playlist format currently not supported")
        }
    }
    pub fn get_extension(format: &Self) -> String {
        match format {
            Format::M3U => "m3u8".to_string(),
            Format::PLS => "pls".to_string(),
            Format::ASX => "asx".to_string(),
            Format::MPCPL => "mpcpl".to_string(),
        }
    }
}


