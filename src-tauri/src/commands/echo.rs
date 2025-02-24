// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
pub fn echo(string: String) {
    println!("{string}")
}