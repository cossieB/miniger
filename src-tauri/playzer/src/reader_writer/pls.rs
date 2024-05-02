use regex::Regex;

use crate::{reader_writer::PlaylistReaderWriter, FileInfo};
use crate::config;
use std::path::Path;
use std::{
    collections::HashSet,
    fs,
};

pub struct PLSReaderWriter;

impl PlaylistReaderWriter for PLSReaderWriter {
    fn read_file(&self, path: &str) -> Vec<FileInfo> {
        let file = fs::read_to_string(path).expect("Error while reading playlist");
        let mut list = Vec::with_capacity(1000);
        let re = Regex::new(r#"File\d+\s*=\s*(.+)"#).unwrap();
        for line in file.lines() {
            if let Some(path) = crate::extract_regex(line, &re) {
                list.push({FileInfo{
                    path: path.clone(),
                    title: Path::new(&path).file_name().unwrap().to_os_string().into_string().unwrap()
                }});
            }
        }
        return list;
    }
    fn process_file(&self, config: &config::Config) -> (Vec<String>, HashSet<String>) {
        let mut set = HashSet::new();
        let file = fs::read_to_string(config.playlist()).expect("Error while reading playlist");
        let mut list = Vec::with_capacity(1000);
        let re = Regex::new(r#"File\d+\s*=\s*(.+)"#).unwrap();
        for line in file.lines() {
            if let Some(path) = crate::extract_regex(line, &re) {
                if config.keep_duplicates() == false && set.contains(&path) {
                    continue;
                }
                self.add_files_to_list(config, &mut set, &path, &mut list);
            }
        }
        (list, set)
    }

    fn write_file(&self, files: &Vec<String>, path: String) -> Result<String, &'static str>  {
        let mut contents = String::from("[playlist]\n");
        for (i, file) in files.iter().enumerate() {
            contents.push_str(&format!("File{}={file}\n", i+1));
        };
        if let Err(_) = fs::write(&path, contents) {
            return Err("Unable to write to file");
        };
        Ok(path)
    }
}

