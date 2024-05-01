use std::path;

use serde::{Deserialize, Serialize};
pub mod config;
pub mod format;
pub mod reader_writer;

#[derive(Serialize, Deserialize)]
pub struct FileInfo {
    title: String,
    path: String
}

fn file_exists(path: &str) -> bool {
    let path = path::Path::new(path);
    path.exists()
}

fn shuffle<T: Clone>(arr: &mut Vec<T>) {
    use rand::Rng;
    let mut i = arr.len() - 1;
    while i > 0 {
        let mut rng = rand::thread_rng();
        let j = rng.gen_range(0..i);
        ( arr[i], arr[j] ) = ( arr[j].clone(), arr[i].clone() );
        i -= 1;
    };
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