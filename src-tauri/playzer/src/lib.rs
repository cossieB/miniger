use std::{path};
pub mod config;
pub mod format;

fn file_exists(path: &str) -> bool {
    let path = path::Path::new(path);
    path.exists()
}

fn get_input(prompt: String) -> String {
    println!("{prompt}");
    let mut input = String::new();
    loop {
        match std::io::stdin().read_line(&mut input) {
            Ok(_) => {
                break;
            }
            Err(e) => {
                println!("Unable to read input. Please try again. {}", e)
            }
        };
    }
    input.trim().replace("\"", "").to_string()
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

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn file_does_exist() {
        assert!(file_exists("./test_assets/test.txt"))
    }
    #[test]
    fn file_doesnt_exist() {
        assert!(!file_exists("./fake.txt"))
    }
}