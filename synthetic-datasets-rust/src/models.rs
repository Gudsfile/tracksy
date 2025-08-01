use chrono::{DateTime, Utc};
use serde::Serialize;
use std::net::Ipv4Addr;

// Note : En Rust, les sous-structures sont directement intégrées.
// Les modèles Artist et Album sont "plats" dans la structure Track pour la génération.
#[derive(Debug, Clone)]
pub struct Artist {
    pub name: String,
}

#[derive(Debug, Clone)]
pub struct Album {
    pub name: String,
    pub artist: Artist,
}

#[derive(Debug, Clone)]
pub struct Track {
    pub uri: String,
    pub name: String,
    pub album: Album,
    pub duration_ms: u32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Streaming {
    // Serde s'occupera de formater la date en ISO8601
    pub ts: DateTime<Utc>,
    pub platform: String,
    pub ms_played: u32,
    pub conn_country: String,
    pub ip_addr_decrypted: Ipv4Addr,
    pub user_agent_decrypted: String,
    pub master_metadata_track_name: String,
    pub master_metadata_album_artist_name: String,
    pub master_metadata_album_album_name: String,
    pub spotify_track_uri: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_show_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spotify_episode_uri: Option<String>,
    pub reason_start: String,
    pub reason_end: String,
    pub shuffle: bool,
    pub skipped: bool,
    pub offline: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offline_timestamp: Option<i64>,
    pub incognito_mode: bool,
}