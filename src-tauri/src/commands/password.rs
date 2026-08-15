use keyring::Entry;

use crate::AppError;

#[tauri::command]
pub async fn set_password(password: String) -> Result<(), AppError> {
    let entry = Entry::new("mngr", "default_user")
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
        return Err(AppError::new(error_message));
    }

    Ok(())
}

#[tauri::command]
pub async fn get_password() -> Result<Option<String>, AppError> {
    let entry = Entry::new("my-app", "default_user")
        .map_err(|e| AppError::new(format!("Failed to initialize keyring entry: {}", e)))?;

    match entry.get_password() {
        Ok(password) => Ok(Some(password)),
        Err(e) => match e {
            keyring::Error::NoEntry => Ok(None),

            keyring::Error::PlatformFailure(error) => Err(AppError::new(format!("Platform failure: {error}"))),
            keyring::Error::NoStorageAccess(error) => Err(AppError::new(format!("No storage access: {error}"))),
            keyring::Error::BadEncoding(items) => {
                Err(AppError::new(format!("Bad encoding encountered: {items:?}")))
            }
            keyring::Error::BadDataFormat(items, error) => {
                Err(AppError::new(format!("Bad data format ({items:?})): {error}")))
            }
            keyring::Error::BadStoreFormat(error) => Err(AppError::new(format!("Bad store format: {error}"))),
            keyring::Error::TooLong(items, max_len) => {
                Err(AppError::new(format!("Data too long ({items:?})), max length: {max_len}")))
            }
            keyring::Error::Invalid(items, error) => {
                Err(AppError::new(format!("Invalid data ({items:?})): {error}")))
            }
            keyring::Error::Ambiguous(items) => {
                Err(AppError::new(format!("Ambiguous match found for items: {items:?}")))
            }
            keyring::Error::NoDefaultStore => {
                Err(AppError::new("No default credential store configured".to_owned()))
            }
            keyring::Error::NotSupportedByStore(error) => {
                Err(AppError::new(format!("Operation not supported by store: {error}")))
            }
            other => Err(AppError::new(format!("An unknown keyring error occurred: {other}"))),
        },
    }
}

#[tauri::command]
pub async fn delete_password() -> Result<(), AppError> {
    let entry = Entry::new("mngr", "default_user")
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
        return Err(AppError::new(error_message));
    }

    Ok(())
}
