use crate::http_client::{build_client, get_base_url};
use serde::Serialize;

#[derive(Serialize)]
pub struct HealthResult {
    pub ok: bool,
    pub error: Option<String>,
}

/// Test a connection with provided credentials (called before saving).
#[tauri::command]
pub async fn check_connection(
    subdomain: String,
    token: String,
    region: String,
) -> Result<HealthResult, String> {
    let base = get_base_url(&subdomain, &region);
    let client = build_client(&token).map_err(|e| e.to_string())?;

    match client
        .get(format!("{}/devices?limit=1", base))
        .send()
        .await
    {
        Ok(res) if res.status().is_success() || res.status().as_u16() == 200 => {
            Ok(HealthResult { ok: true, error: None })
        }
        Ok(res) => {
            let status = res.status().as_u16();
            let body = res.text().await.unwrap_or_default();
            Ok(HealthResult {
                ok: false,
                error: Some(format!("HTTP {}: {}", status, body)),
            })
        }
        Err(e) => Ok(HealthResult {
            ok: false,
            error: Some(e.to_string()),
        }),
    }
}
