use super::PlaylistReaderWriter;
use crate::config;
use std::{
    collections::HashSet,
    fs,
};

pub struct PLSReaderWriter;

impl PLSReaderWriter {
    fn parse_line(&self, line: &str) -> Option<String> {
        let equalsign_index = line.find('=')?;
        let path = &line.get(equalsign_index + 1..)?;
        Some(path.to_string())
    }
}

impl PlaylistReaderWriter for PLSReaderWriter {
    fn read_file(&self, config: &config::Config) -> (Vec<String>, HashSet<String>) {
        let mut set = HashSet::new();
        let file = fs::read_to_string(config.playlist()).expect("Error while reading playlist");
        let mut list = Vec::with_capacity(1000);

        for line in file.lines() {
            if let Some(path) = self.parse_line(line) {
                if config.keep_duplicates() == false && set.contains(&path) {
                    continue;
                }
                self.add_files_to_list(config, &mut set, &path, &mut list);
            }
        }
        (list, set)
    }

    fn write_file(&self, files: &Vec<String>, config: &config::Config) -> Result<String, &'static str>  {
        let path = self.generate_new_filename(&config);
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

