use url::Url;

use crate::error::{LauncherError, LauncherResult};

pub trait ProviderClient {
  fn validate_url(&self, url: &str) -> LauncherResult<()>;
}

pub struct ModrinthProvider;

impl ProviderClient for ModrinthProvider {
  fn validate_url(&self, url: &str) -> LauncherResult<()> {
    let parsed = parse_http_url(url)?;
    let scheme = parsed.scheme();
    let host = parsed.host_str().unwrap_or_default();

    if scheme == "https" && (host == "cdn.modrinth.com" || host.ends_with(".cdn.modrinth.com")) {
      return Ok(());
    }

    Err(LauncherError::InvalidData(format!(
      "unsupported mod provider URL '{url}'"
    )))
  }
}

pub struct CurseForgeProvider;

impl ProviderClient for CurseForgeProvider {
  fn validate_url(&self, _url: &str) -> LauncherResult<()> {
    Err(LauncherError::InvalidData(
      "CurseForge provider is not enabled in MVP".to_string(),
    ))
  }
}

pub struct DirectProvider;

impl ProviderClient for DirectProvider {
  fn validate_url(&self, url: &str) -> LauncherResult<()> {
    validate_service_url(url)
  }
}

pub fn validate_mod_url(provider: &str, url: &str) -> LauncherResult<()> {
  match provider {
    "modrinth" => ModrinthProvider.validate_url(url),
    "curseforge" => CurseForgeProvider.validate_url(url),
    "direct" => DirectProvider.validate_url(url),
    _ => Err(LauncherError::InvalidData(format!(
      "unsupported provider '{provider}'"
    ))),
  }
}

pub fn validate_download_url(provider: &str, url: &str) -> LauncherResult<()> {
  match provider {
    "modrinth" | "curseforge" | "direct" => validate_mod_url(provider, url),
    _ => Err(LauncherError::InvalidData(format!(
      "unsupported provider '{provider}'"
    ))),
  }
}

pub fn validate_service_url(url: &str) -> LauncherResult<()> {
  let parsed = parse_http_url(url)?;
  let scheme = parsed.scheme();
  let host = parsed.host_str().unwrap_or_default();

  if scheme == "https" {
    return Ok(());
  }

  if scheme == "http" && is_loopback(host) {
    return Ok(());
  }

  Err(LauncherError::InvalidData(
    "URL must use https (or http on localhost/loopback for development)".to_string(),
  ))
}

fn parse_http_url(url: &str) -> LauncherResult<Url> {
  let parsed = Url::parse(url).map_err(|error| LauncherError::InvalidData(error.to_string()))?;

  if parsed.host_str().is_none() {
    return Err(LauncherError::InvalidData("URL must include a host".to_string()));
  }

  if !parsed.username().is_empty() || parsed.password().is_some() {
    return Err(LauncherError::InvalidData(
      "embedded URL credentials are not allowed".to_string(),
    ));
  }

  if parsed.fragment().is_some() {
    return Err(LauncherError::InvalidData(
      "URL fragments are not allowed".to_string(),
    ));
  }

  Ok(parsed)
}

fn is_loopback(host: &str) -> bool {
  host.eq_ignore_ascii_case("localhost") || host == "127.0.0.1" || host == "::1"
}
