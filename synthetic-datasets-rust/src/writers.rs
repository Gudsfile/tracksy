use crate::models::Streaming;
use anyhow::Result;
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;
use zip::write::{FileOptions, ZipWriter};

pub fn write_json(streamings: &[Streaming], path: &Path) -> Result<()> {
    if let Some(p) = path.parent() {
        fs::create_dir_all(p)?;
    }
    let file = File::create(path)?;
    serde_json::to_writer_pretty(file, streamings)?;
    println!(
        "✅ Successfully wrote {} records to {}",
        streamings.len(),
        path.display()
    );
    Ok(())
}

pub fn write_zip(zip_path: &Path, files_to_add: HashMap<String, Vec<Streaming>>) -> Result<()> {
    if let Some(p) = zip_path.parent() {
        fs::create_dir_all(p)?;
    }
    let zip_file = File::create(zip_path)?;
    let mut zip = ZipWriter::new(zip_file);
    let options: FileOptions<()> =
        FileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    println!("\nCreating ZIP file: {}", zip_path.display());
    for (filename, streamings) in files_to_add {
        zip.start_file(filename.clone(), options)?;
        let json_string = serde_json::to_string(&streamings)?;
        zip.write_all(json_string.as_bytes())?;
        println!("  - Added {} records to {}", streamings.len(), filename);
    }

    zip.finish()?;
    println!(
        "✅ Successfully created ZIP archive at {}",
        zip_path.display()
    );
    Ok(())
}
