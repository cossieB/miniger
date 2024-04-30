use regex::Regex;

use super::PlaylistReaderWriter;
use crate::config;
use std::{collections::HashSet, fs};

pub struct ASXReaderWriter;

impl PlaylistReaderWriter for ASXReaderWriter {
    fn read_file(&self, config: &config::Config) -> (Vec<String>, HashSet<String>){
        let mut set = HashSet::new();
        let file = fs::read_to_string(config.playlist()).expect("Error while reading playlist");
        let mut list = Vec::with_capacity(1000);
        let re = Regex::new(r#"href\s*=\s*"(.+?)""#).unwrap();
        for line in file.lines() {
            if let Some(path) = super::extract_regex(line, &re) {
                if config.keep_duplicates() == false && set.contains(&path) {
                    continue;
                }
                self.add_files_to_list(config, &mut set, &path, &mut list);
            }
        }
        (list, set)
    }

    fn write_file(&self, files: &Vec<String>, config: &config::Config) -> Result<String, &'static str> {
        let path = self.generate_new_filename(&config);
        let mut contents = String::from("<ASX version = \"3.0\">\n");
        files.iter().for_each(|file| {
            contents.push_str(&format!("<Entry><Ref href = \"{file}\"/></Entry>\n"));
        });
        contents.push_str("</ASX>");
        if let Err(_) = fs::write(&path, contents) {
            return Err("Unable to write to file");
        };
        Ok(path)
    }
}
