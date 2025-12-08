pub fn create_dirs(app_data_dir: std::path::PathBuf) {
    let img_dir = app_data_dir.join("images");
    if !img_dir.exists() {
        std::fs::create_dir_all(img_dir).unwrap()
    }
    let thumbs_dir = app_data_dir.join("thumbs");
    if !thumbs_dir.exists() {
        std::fs::create_dir_all(thumbs_dir).unwrap()
    }
}