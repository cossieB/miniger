use std::{path, collections::HashSet};

use crate::{config, file_exists};
mod m3u;
mod pls;
mod asx;
mod mpcpl;
pub use m3u::M3UReaderWriter; 
pub use pls::PLSReaderWriter;
pub use asx::ASXReaderWriter;
pub use mpcpl::MPCPLReaderWriter;

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

pub trait PlaylistReaderWriter {
    fn read_file(&self, config: &config::Config) -> (Vec<String>, HashSet<String>);
    fn write_file(&self, files: &Vec<String>, config: &config::Config) -> Result<String, &'static str> ;
    
    fn write(&self, files: &mut Vec<String>, config: &config::Config) -> Result<String, &'static str> {
        if config.shuffle() {
            crate::shuffle(files);
        };
        self.write_file(files, config)
    }   
    fn generate_new_filename(&self, config: &config::Config) -> String {
        let name = get_filename(config.playlist());
        let extension = Format::get_extension(config.output_format());
        let mut rng = rand::thread_rng(); //random number to reduce chance of filename clash.
        let mut path = format!("{name}_PLAYZER_{}.{extension}", rand::Rng::gen_range(&mut rng, 1000..99999));
        // make sure no file exists at the path
        while file_exists(&path) {
            path = format!("{name}_PLAYZER_{}.{extension}", rand::Rng::gen_range(&mut rng, 1000..99999));
        }
        path
    }
    fn add_files_to_list(&self, config: &config::Config, set: &mut HashSet<String>, path: &str, list: &mut Vec<String>) {
        if crate::file_exists(path) {
            if config.keep_duplicates() == false {
                set.insert(path.to_string());
            }
            list.push(path.to_string());
        }
    }
}
pub fn get_reader_writer(format: &Format) -> Box<dyn PlaylistReaderWriter> {
    match format {
        Format::M3U => Box::new(M3UReaderWriter),
        Format::PLS => Box::new(PLSReaderWriter),
        Format::ASX => Box::new(ASXReaderWriter),
        Format::MPCPL => Box::new(MPCPLReaderWriter),
    }
}
fn get_filename(path: &str) -> String {
    let re = regex::Regex::new(r"(^(?:\.(?:/|\\))?[^\.]+)(?:\.\w+)?$").unwrap(); //see tests filename_tests() below to figure out what this regex does
    extract_regex(path, &re).unwrap_or("playzer_generated".to_owned())
}

fn extract_regex(text: &str, re: &regex::Regex) -> Option<String> {
    let captures = re.captures(text)?;
    let mtch = captures.get(1)?;
    Some(String::from(&text[mtch.start()..mtch.end()]))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn format_is_m3u() {
        let f = Format::get_format("./test.m3u8");
        assert!(f.is_ok());
        assert_eq!(f.unwrap(), Format::M3U)
    }
    #[test]
    fn format_unsupported() {
        let f = Format::get_format("./test_assets/test.txt");
        println!("{:?}", f);
        assert!(f.is_err());
        assert_eq!(f.unwrap_err(), "Playlist format currently not supported")
    }
    #[test]
    fn filename_tests() {
        assert_eq!(get_filename("hello.txt"), "hello");
        assert_eq!(get_filename("h3ll0.mp3"), "h3ll0");
        assert_eq!(get_filename(".txt"), "playzer_generated");
        assert_eq!(get_filename("hello"), "hello");
        assert_eq!(get_filename("hello..txt"), "playzer_generated");
        assert_eq!(get_filename("./hello.txt"), "./hello");
        assert_eq!(get_filename(".\\hello.txt"), ".\\hello");
    }
}