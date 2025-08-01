use crate::models::{Album, Artist, Streaming, Track};
use anyhow::Result;
use chrono::{DateTime, Datelike, Duration, Utc};
use fake::Fake;
use fake::faker::company::en::CatchPhrase;
use fake::faker::internet::en::{IPv4, UserAgent};
use fake::faker::name::en::Name;
use indicatif::{ProgressBar, ProgressStyle};
use rand::distributions::{Distribution, WeightedIndex};
use rand::{Rng, random, seq::SliceRandom};

use chrono::TimeZone;

const HOUR_WEIGHTS: [f64; 24] = [
    0.01, 0.01, 0.01, 0.01, 0.02, 0.04, 0.07, 0.09, 0.08, 0.06, 0.05, 0.05, 0.05, 0.04, 0.04, 0.05,
    0.06, 0.07, 0.08, 0.07, 0.05, 0.03, 0.02, 0.01,
];
const MONTH_WEIGHTS: [f64; 12] = [
    0.11, 0.1, 0.09, 0.08, 0.07, 0.06, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11,
];
const REASON_START: [&str; 4] = ["trackdone", "fwdbtn", "backbtn", "clickrow"];

pub struct SpotifyFactory {
    catalog: Vec<Track>,
    now: DateTime<Utc>,
    hour_dist: WeightedIndex<f64>,
    month_dist: WeightedIndex<f64>,
}

impl SpotifyFactory {
    pub fn new(num_artists: u32, num_albums: u32, num_tracks: u32) -> Result<Self> {
        println!("🎵 Generating music catalog...");
        let catalog = Self::generate_catalog(num_artists, num_albums, num_tracks);
        println!("✅ Catalog created with {} unique tracks.", catalog.len());

        Ok(Self {
            catalog,
            now: Utc::now(),
            hour_dist: WeightedIndex::new(HOUR_WEIGHTS)?,
            month_dist: WeightedIndex::new(MONTH_WEIGHTS)?,
        })
    }

    pub fn create_streaming_history(
        &self,
        n_records: u32,
        yearly_growth_factor: f32,
    ) -> Result<Vec<Streaming>> {
        let start_year = 2020;
        let current_year = self.now.year();
        let years: Vec<i32> = (start_year..=current_year).collect();
        let year_weights: Vec<f32> = (0..years.len())
            .map(|i| yearly_growth_factor.powi(i as i32))
            .collect();
        let total_weight: f32 = year_weights.iter().sum();
        let mut records_per_year: Vec<(i32, u32)> = years
            .iter()
            .zip(year_weights.iter())
            .map(|(year, weight)| (*year, (n_records as f32 * (weight / total_weight)) as u32))
            .collect();
        let total_calculated: u32 = records_per_year.iter().map(|(_, count)| count).sum();
        if let Some(last) = records_per_year.last_mut() {
            last.1 += n_records - total_calculated;
        }
        println!(
            "Generating records with a yearly growth factor of {}:",
            yearly_growth_factor
        );
        for (year, num_records) in &records_per_year {
            println!(" - {}: {} records", year, num_records);
        }
        let mut all_streamings = Vec::with_capacity(n_records as usize);
        let bar = ProgressBar::new(n_records as u64)
            .with_style(ProgressStyle::default_bar().template(
            "{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos:>7}/{len:7} ({eta})",
        )?);
        for (year, num_records) in records_per_year {
            let track_dist = WeightedIndex::new(self.generate_track_popularity())?;
            for _ in 0..num_records {
                let ts = self.get_random_datetime_for_year(year)?;
                all_streamings.push(self.create_one_streaming_record(ts, &track_dist));
                bar.inc(1);
            }
        }
        bar.finish_with_message("✅ Done generating records!");
        let mut rng = rand::thread_rng();
        all_streamings.shuffle(&mut rng);
        Ok(all_streamings)
    }

    fn create_one_streaming_record(
        &self,
        ts: DateTime<Utc>,
        track_dist: &WeightedIndex<f64>,
    ) -> Streaming {
        let mut rng = rand::thread_rng();
        let track = self.catalog[track_dist.sample(&mut rng)].clone();
        let skipped = random::<f32>() < 0.25;

        let (ms_played, reason_end) = if skipped {
            (rng.gen_range(1000..=30000), "fwdbtn")
        } else {
            (
                (track.duration_ms as f32 * rng.gen_range(0.95..=1.0)) as u32,
                "trackdone",
            )
        };

        let offline = random::<f32>() < 0.1;

        let ip_str: String = IPv4().fake_with_rng(&mut rng);

        Streaming {
            ts,
            platform: ["Android OS", "iOS", "Windows"]
                .choose(&mut rng)
                .unwrap()
                .to_string(),
            ms_played,
            conn_country: "US".to_string(),
            ip_addr_decrypted: ip_str.parse().unwrap(),
            user_agent_decrypted: UserAgent().fake_with_rng(&mut rng),
            master_metadata_track_name: track.name,
            master_metadata_album_artist_name: track.album.artist.name,
            master_metadata_album_album_name: track.album.name,
            spotify_track_uri: track.uri,
            episode_name: None,
            episode_show_name: None,
            spotify_episode_uri: None,
            reason_start: REASON_START.choose(&mut rng).unwrap().to_string(),
            reason_end: reason_end.to_string(),
            shuffle: random(),
            skipped,
            offline,
            offline_timestamp: if offline {
                Some((ts - Duration::minutes(rng.gen_range(1..60))).timestamp())
            } else {
                None
            },
            incognito_mode: random(),
        }
    }

    fn generate_track_popularity(&self) -> Vec<f64> {
        (0..self.catalog.len())
            .map(|_| rand::random::<f64>().powi(2))
            .collect()
    }

    fn get_random_datetime_for_year(&self, year: i32) -> Result<DateTime<Utc>> {
        let mut rng = rand::thread_rng();
        loop {
            let month = if year < self.now.year() {
                self.month_dist.sample(&mut rng) as u32 + 1
            } else {
                let valid_months_weights = &MONTH_WEIGHTS[..self.now.month0() as usize];
                let dist = WeightedIndex::new(valid_months_weights)?;
                dist.sample(&mut rng) as u32 + 1
            };

            let day = rng.gen_range(1..=28);
            let hour = self.hour_dist.sample(&mut rng) as u32;
            let minute = rng.gen_range(0..=59);
            let second = rng.gen_range(0..=59);

            if let Some(gen_date) = Utc
                .with_ymd_and_hms(year, month, day, hour, minute, second)
                .single()
            {
                if gen_date <= self.now {
                    return Ok(gen_date);
                }
            }
        }
    }

    fn generate_catalog(num_artists: u32, num_albums: u32, num_tracks: u32) -> Vec<Track> {
        let mut catalog = Vec::new();
        let mut rng = rand::thread_rng();

        for _ in 0..num_artists {
            let artist = Artist {
                name: Name().fake_with_rng(&mut rng),
            };
            for _ in 0..num_albums {
                let album = Album {
                    name: CatchPhrase().fake_with_rng(&mut rng),
                    artist: artist.clone(),
                };
                for _ in 0..num_tracks {
                    let track_id: String = (0..22)
                        .map(|_| rng.sample(rand::distributions::Alphanumeric) as char)
                        .collect();
                    catalog.push(Track {
                        uri: format!("spotify:track:{}", track_id),
                        name: CatchPhrase().fake_with_rng(&mut rng),
                        album: album.clone(),
                        duration_ms: rng.gen_range(120_000..=360_000),
                    });
                }
            }
        }
        catalog
    }
}
