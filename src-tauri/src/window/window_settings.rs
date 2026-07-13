pub struct WindowSettings {
    pub title: String,
    pub maximized: bool,
    pub drag_drop_enabled: bool,
    pub height: f64,
    pub width: f64,
    pub always_on_top: bool,
    pub maximizable: bool,
    pub minimizable: bool,
    pub center: bool
}
impl Default for WindowSettings {
    fn default() -> Self {
        Self {
            title: "".into(),
            maximized: false,
            drag_drop_enabled: false,
            height: 720.0,
            width: 1280.0,
            always_on_top: false,
            maximizable: true,
            minimizable: true,
            center: true
        }
    }
}