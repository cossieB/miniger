mod asx;
mod m3u;
mod mpcpl;
mod pls;

pub use asx::ASXReaderWriter;
pub use m3u::M3UReaderWriter;
pub use mpcpl::MPCPLReaderWriter;
pub use pls::PLSReaderWriter;

use std::collections::HashSet;

use crate::{config, file_exists, format::Format, FileInfo};

pub trait PlaylistReaderWriter {
    fn read_file(&self, config: &config::Config) -> Vec<FileInfo>;
    fn process_file(&self, config: &config::Config) -> (Vec<String>, HashSet<String>);
    fn write_file(
        &self,
        files: &Vec<String>,
        config: &config::Config,
    ) -> Result<String, &'static str>;

    fn write(
        &self,
        files: &mut Vec<String>,
        config: &config::Config,
    ) -> Result<String, &'static str> {
        if config.shuffle() {
            crate::shuffle(files);
        };
        self.write_file(files, config)
    }
    fn generate_new_filename(&self, config: &config::Config) -> String {
        let name = crate::get_filename(config.playlist());
        let extension = Format::get_extension(config.output_format());
        let mut rng = rand::thread_rng(); //random number to reduce chance of filename clash.
        let mut path = format!(
            "{name}_PLAYZER_{}.{extension}",
            rand::Rng::gen_range(&mut rng, 1000..99999)
        );
        // make sure no file exists at the path
        while file_exists(&path) {
            path = format!(
                "{name}_PLAYZER_{}.{extension}",
                rand::Rng::gen_range(&mut rng, 1000..99999)
            );
        }
        path
    }
    fn add_files_to_list(
        &self,
        config: &config::Config,
        set: &mut HashSet<String>,
        path: &str,
        list: &mut Vec<String>,
    ) {
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
