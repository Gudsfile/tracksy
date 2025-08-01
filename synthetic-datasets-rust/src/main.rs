mod factory;
mod models;
mod writers;

use anyhow::Result;
// 👇 CORRECTION: Ajout de l'import pour la méthode .year()
use chrono::Datelike;
use factory::SpotifyFactory;
use models::Streaming;
use std::collections::HashMap;
use std::path::Path;

// --- Configuration ---
const TOTAL_RECORDS: u32 = 5000;
const YEARLY_GROWTH: f32 = 1.6;
const OUTPUT_DIR: &str = "output/spotify_data_rust";
const PREFIX: &str = "StreamingHistory";

fn main() -> Result<()> {
    // 1. Initialiser le factory
    let factory = SpotifyFactory::new(100, 2, 10)?;

    // 2. Générer le jeu de données complet
    let all_streamings = factory.create_streaming_history(TOTAL_RECORDS, YEARLY_GROWTH)?;

    // --- Logique de répartition des données ---
    let output_path = Path::new(OUTPUT_DIR);

    // Exemple 1: Un grand fichier JSON
    writers::write_json(&all_streamings, &output_path.join("all_streamings.json"))?;

    // Exemple 2: Un ZIP avec un JSON par année
    let mut streamings_by_year: HashMap<i32, Vec<Streaming>> = HashMap::new();
    for s in all_streamings {
        // L'appel s.ts.year() est maintenant valide
        streamings_by_year.entry(s.ts.year()).or_default().push(s);
    }

    let files_for_yearly_zip: HashMap<String, Vec<Streaming>> = streamings_by_year
        .into_iter()
        .map(|(year, data)| (format!("{}_{}.json", PREFIX, year), data))
        .collect();

    writers::write_zip(
        &output_path.join("streamings_by_year.zip"),
        files_for_yearly_zip,
    )?;

    Ok(())
}
