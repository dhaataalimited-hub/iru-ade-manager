use keyring::Entry;
use serde::{Deserialize, Serialize};

const SERVICE: &str = "io.iru.ade-manager";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Credentials {
    pub subdomain: String,
    pub region: String,
}

fn token_entry() -> keyring::Result<Entry> {
    Entry::new(SERVICE, "api-token")
}

fn subdomain_entry() -> keyring::Result<Entry> {
    Entry::new(SERVICE, "subdomain")
}

fn region_entry() -> keyring::Result<Entry> {
    Entry::new(SERVICE, "region")
}

/// Load credentials from Keychain. Returns None if not configured yet.
#[tauri::command]
pub fn load_credentials() -> Result<Option<Credentials>, String> {
    let sub = match subdomain_entry()
        .map_err(|e| e.to_string())?
        .get_password()
    {
        Ok(s) => s,
        Err(keyring::Error::NoEntry) => return Ok(None),
        Err(e) => return Err(e.to_string()),
    };
    let region = region_entry()
        .map_err(|e| e.to_string())?
        .get_password()
        .unwrap_or_else(|_| "us".to_string());
    Ok(Some(Credentials {
        subdomain: sub,
        region,
    }))
}

/// Save credentials to Keychain (token is stored securely, never returned to frontend).
#[tauri::command]
pub fn save_credentials(
    subdomain: String,
    token: String,
    region: String,
) -> Result<(), String> {
    token_entry()
        .map_err(|e| e.to_string())?
        .set_password(&token)
        .map_err(|e| e.to_string())?;
    subdomain_entry()
        .map_err(|e| e.to_string())?
        .set_password(&subdomain)
        .map_err(|e| e.to_string())?;
    region_entry()
        .map_err(|e| e.to_string())?
        .set_password(&region)
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Remove all credentials from Keychain.
#[tauri::command]
pub fn clear_credentials() -> Result<(), String> {
    for entry in [token_entry(), subdomain_entry(), region_entry()] {
        match entry.map_err(|e| e.to_string())?.delete_credential() {
            Ok(_) | Err(keyring::Error::NoEntry) => {}
            Err(e) => return Err(e.to_string()),
        }
    }
    Ok(())
}

/// Read the stored token (Rust-internal use only — never called from JS directly via invoke).
pub fn get_stored_token() -> Result<String, String> {
    token_entry()
        .map_err(|e| e.to_string())?
        .get_password()
        .map_err(|e| e.to_string())
}

/// Read stored subdomain + region.
pub fn get_stored_creds() -> Result<Credentials, String> {
    let subdomain = subdomain_entry()
        .map_err(|e| e.to_string())?
        .get_password()
        .map_err(|e| e.to_string())?;
    let region = region_entry()
        .map_err(|e| e.to_string())?
        .get_password()
        .unwrap_or_else(|_| "us".to_string());
    Ok(Credentials { subdomain, region })
}
