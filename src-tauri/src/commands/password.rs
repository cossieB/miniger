use keyring::Entry;
use tauri::menu::MenuEvent;
use tauri_plugin_log::log::error;

use crate::{AppError, events};

const SERVICE_NAME: &str = match option_env!("THIS_APP") {
    Some(val) => val,
    None => "com.mngr",
};

#[tauri::command]
pub async fn set_password(password: String) -> Result<(), AppError> {
    let entry = Entry::new(SERVICE_NAME, "default_user")
        .map_err(|e| format!("Failed to initialize keyring entry: {}", e))?;

    if let Err(e) = entry.set_password(&password) {
        let error_message = match e {
            keyring::Error::PlatformFailure(error) => format!("Platform failure: {error}"),
            keyring::Error::NoStorageAccess(error) => format!("No storage access: {error}"),
            keyring::Error::NoEntry => "No such entry found".to_string(),
            keyring::Error::BadEncoding(items) => format!("Bad encoding encountered: {items:?}"),
            keyring::Error::BadDataFormat(items, error) => {
                format!("Bad data format ({items:?}): {error}")
            }
            keyring::Error::BadStoreFormat(error) => format!("Bad store format: {error}"),
            keyring::Error::TooLong(items, max_len) => {
                format!("Input too long ({items:?}), max length: {max_len}")
            }
            keyring::Error::Invalid(items, error) => format!("Invalid data ({items:?}): {error}"),
            keyring::Error::Ambiguous(items) => {
                format!("Ambiguous match found for items: {items:?}")
            }
            keyring::Error::NoDefaultStore => "No default credential store configured".to_string(),
            keyring::Error::NotSupportedByStore(error) => {
                format!("Operation not supported by store: {error}")
            }
            other => format!("An unknown keyring error occurred: {other}"),
        };
        error!("{error_message}");
        return Err(AppError::new(error_message));
    }

    Ok(())
}

#[tauri::command]
pub async fn get_password() -> Result<Option<String>, AppError> {
    let entry = Entry::new(SERVICE_NAME, "default_user")
        .map_err(|e| format!("Failed to initialize keyring entry: {}", e))?;

    match entry.get_password() {
        Ok(password) => Ok(Some(password)),
        Err(e) => {
            let error_message = match e {
                keyring::Error::NoEntry => {
                    return Ok(None);
                }
                keyring::Error::PlatformFailure(error) => format!("Platform failure: {error}"),
                keyring::Error::NoStorageAccess(error) => format!("No storage access: {error}"),
                keyring::Error::BadEncoding(items) => {
                    format!("Bad encoding encountered: {items:?}")
                }
                keyring::Error::BadDataFormat(items, error) => {
                    format!("Bad data format ({items:?}): {error}")
                }
                keyring::Error::BadStoreFormat(error) => format!("Bad store format: {error}"),
                keyring::Error::TooLong(items, max_len) => {
                    format!("Data too long ({items:?}), max length: {max_len}")
                }
                keyring::Error::Invalid(items, error) => {
                    format!("Invalid data ({items:?}): {error}")
                }
                keyring::Error::Ambiguous(items) => {
                    format!("Ambiguous match found for items: {items:?}")
                }
                keyring::Error::NoDefaultStore => {
                    "No default credential store configured".to_string()
                }
                keyring::Error::NotSupportedByStore(error) => {
                    format!("Operation not supported by store: {error}")
                }
                other => format!("An unknown keyring error occurred: {other}"),
            };
            error!("{error_message}");
            Err(AppError::new(error_message))
        }
    }
}

#[tauri::command]
pub async fn delete_password() -> Result<(), AppError> {
    let entry = Entry::new(SERVICE_NAME, "default_user")
        .map_err(|e| format!("Failed to initialize keyring entry: {}", e))?;

    if let Err(e) = entry.delete_credential() {
        let error_message = match e {
            keyring::Error::PlatformFailure(error) => format!("Platform failure: {error}"),
            keyring::Error::NoStorageAccess(error) => format!("No storage access: {error}"),
            keyring::Error::NoEntry => "Password entry did not exist".to_string(),
            keyring::Error::BadEncoding(items) => format!("Bad encoding encountered: {items:?}"),
            keyring::Error::BadDataFormat(items, error) => {
                format!("Bad data format ({items:?}): {error}")
            }
            keyring::Error::BadStoreFormat(error) => format!("Bad store format: {error}"),
            keyring::Error::TooLong(items, max_len) => {
                format!("Data too long ({items:?}), max length: {max_len}")
            }
            keyring::Error::Invalid(items, error) => format!("Invalid data ({items:?}): {error}"),
            keyring::Error::Ambiguous(items) => {
                format!("Ambiguous match found for items: {items:?}")
            }
            keyring::Error::NoDefaultStore => "No default credential store configured".to_string(),
            keyring::Error::NotSupportedByStore(error) => {
                format!("Operation not supported by store: {error}")
            }
            other => format!("An unknown keyring error occurred: {other}"),
        };
        error!("{error_message}");
        return Err(AppError::new(error_message));
    }

    Ok(())
}

#[tauri::command]
pub async fn show_api_key_window(app: tauri::AppHandle) {
    events::handle_menu_event(&app, MenuEvent { id: "tmdb".into() });
}
