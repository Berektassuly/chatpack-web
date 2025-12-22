use wasm_bindgen::prelude::*;

use chatpack::cli::{OutputFormat, Source};
use chatpack::core::models::OutputConfig;
use chatpack::core::output::{to_csv, to_json, to_jsonl};
use chatpack::core::processor::merge_consecutive;
use chatpack::parsers::create_parser;

/// Convert chat export to specified format.
///
/// # Arguments
/// * `input` - Raw content of the chat export file
/// * `source` - Source platform: "telegram", "whatsapp", "instagram", "discord"
/// * `format` - Output format: "csv", "json", "jsonl"
///
/// # Returns
/// Converted content as string, or error message
#[wasm_bindgen]
pub fn convert(input: &str, source: &str, format: &str) -> Result<String, JsValue> {
    let source = parse_source(source)?;
    let format = parse_format(format)?;

    // Parse
    let parser = create_parser(source);
    let messages = parser
        .parse_str(input)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    // Merge consecutive messages from same sender
    let merged = merge_consecutive(messages);

    // Convert to output format
    let config = OutputConfig::new().with_timestamps();

    let output = match format {
        OutputFormat::Csv => to_csv(&merged, &config),
        OutputFormat::Json => to_json(&merged, &config),
        OutputFormat::Jsonl => to_jsonl(&merged, &config),
    }
    .map_err(|e| JsValue::from_str(&e.to_string()))?;

    Ok(output)
}

/// Get library version
#[wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

fn parse_source(s: &str) -> Result<Source, JsValue> {
    match s.to_lowercase().as_str() {
        "telegram" | "tg" => Ok(Source::Telegram),
        "whatsapp" | "wa" => Ok(Source::WhatsApp),
        "instagram" | "ig" => Ok(Source::Instagram),
        "discord" | "dc" => Ok(Source::Discord),
        _ => Err(JsValue::from_str(&format!(
            "Unknown source: {}. Expected: telegram, whatsapp, instagram, discord",
            s
        ))),
    }
}

fn parse_format(s: &str) -> Result<OutputFormat, JsValue> {
    match s.to_lowercase().as_str() {
        "csv" => Ok(OutputFormat::Csv),
        "json" => Ok(OutputFormat::Json),
        "jsonl" => Ok(OutputFormat::Jsonl),
        _ => Err(JsValue::from_str(&format!(
            "Unknown format: {}. Expected: csv, json, jsonl",
            s
        ))),
    }
}
