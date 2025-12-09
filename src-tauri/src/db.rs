use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: include_str!("migrations/schema.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add film.metadata column",
            sql: include_str!("migrations/add_metadata.sql"),
            kind: MigrationKind::Up,
        },
    ]
}
