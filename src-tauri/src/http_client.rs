use reqwest::{Client, header};

pub fn get_base_url(subdomain: &str, region: &str) -> String {
    if region == "eu" {
        format!("https://{}.api.eu.kandji.io/api/v1", subdomain)
    } else {
        format!("https://{}.api.kandji.io/api/v1", subdomain)
    }
}

pub fn build_client(token: &str) -> Result<Client, reqwest::Error> {
    let mut headers = header::HeaderMap::new();
    let auth = format!("Bearer {}", token);
    headers.insert(
        header::AUTHORIZATION,
        header::HeaderValue::from_str(&auth).unwrap(),
    );
    Client::builder().default_headers(headers).build()
}
