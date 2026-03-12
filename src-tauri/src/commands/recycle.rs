use crate::AppError;

#[tauri::command]
pub fn recycle(paths: Vec<String>) -> Vec<String> {
    paths.into_iter().filter_map(|path| recycle_item(path).ok()).collect()
}

fn recycle_item(path: String) -> Result<String, AppError> {
let result = trash::delete(&path);
    match result {
        Ok(_) => Ok(path),
        Err(e) => {
            println!("{:#?}", e);
            match e {
                trash::Error::Unknown { description } => Err(AppError::new(description)),
                trash::Error::Os { description, .. } => Err(AppError::new(description)),
                trash::Error::CouldNotAccess { .. } => Err(AppError::new(String::from("The target does not exist or the process has insufficient permissions to access it"))),
                _ => Err(AppError::new(String::from("Could not move item to trash. Please do so manually."))),
            }
        }
    }
}