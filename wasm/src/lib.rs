use wasm_bindgen::prelude::*;
use serde::Serialize;

// Import specific items, avoid importing Result from chatpack
use chatpack::Message;
use chatpack::parser::{Platform, create_parser};
use chatpack::core::processor::merge_consecutive;

/// Output format enum for WASM
#[derive(Debug, Clone, Copy)]
enum Format {
    Csv,
    Json,
    Jsonl,
}

/// Simplified message for output with optional fields
#[derive(Serialize)]
struct OutputMessage {
    #[serde(skip_serializing_if = "Option::is_none")]
    timestamp: Option<String>,
    sender: String,
    content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    reply_to: Option<String>,
}

impl OutputMessage {
    fn from_message(msg: &Message, include_timestamps: bool, include_replies: bool) -> Self {
        OutputMessage {
            timestamp: if include_timestamps {
                msg.timestamp.as_ref().map(|ts| ts.to_string())
            } else {
                None
            },
            sender: msg.sender.clone(),
            content: msg.content.clone(),
            reply_to: if include_replies {
                // reply_to is Option<u64>, convert to string
                msg.reply_to.map(|id| id.to_string())
            } else {
                None
            },
        }
    }
}

/// Convert chat export to specified format.
#[wasm_bindgen]
pub fn convert(
    input: &str,
    source: &str,
    format: &str,
    include_timestamps: bool,
    include_replies: bool,
) -> std::result::Result<String, JsValue> {
    let platform = parse_platform(source)?;
    let output_format = parse_format(format)?;

    // Parse
    let parser = create_parser(platform);
    let messages = parser
        .parse_str(input)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    // Merge consecutive messages from same sender
    let merged = merge_consecutive(messages);

    // Convert to output messages with config applied
    let output_messages: Vec<OutputMessage> = merged
        .iter()
        .map(|m| OutputMessage::from_message(m, include_timestamps, include_replies))
        .collect();

    // Format output
    let output = format_output(&output_messages, output_format, include_timestamps, include_replies)
        .map_err(|e| JsValue::from_str(&e))?;

    Ok(output)
}

/// Format messages to string based on output format
fn format_output(
    messages: &[OutputMessage],
    format: Format,
    include_timestamps: bool,
    include_replies: bool,
) -> std::result::Result<String, String> {
    match format {
        Format::Csv => to_csv(messages, include_timestamps, include_replies),
        Format::Json => to_json(messages),
        Format::Jsonl => to_jsonl(messages),
    }
}

/// Convert to CSV format
fn to_csv(
    messages: &[OutputMessage],
    include_timestamps: bool,
    include_replies: bool,
) -> std::result::Result<String, String> {
    let mut wtr = csv::Writer::from_writer(vec![]);
    
    // Build header dynamically based on config
    let mut headers = vec![];
    if include_timestamps {
        headers.push("timestamp");
    }
    headers.push("sender");
    headers.push("content");
    if include_replies {
        headers.push("reply_to");
    }
    
    wtr.write_record(&headers).map_err(|e| e.to_string())?;
    
    for msg in messages {
        let mut record = vec![];
        if include_timestamps {
            record.push(msg.timestamp.clone().unwrap_or_default());
        }
        record.push(msg.sender.clone());
        record.push(msg.content.clone());
        if include_replies {
            record.push(msg.reply_to.clone().unwrap_or_default());
        }
        wtr.write_record(&record).map_err(|e| e.to_string())?;
    }
    
    let data = wtr.into_inner().map_err(|e| e.to_string())?;
    String::from_utf8(data).map_err(|e| e.to_string())
}

/// Convert to JSON format
fn to_json(messages: &[OutputMessage]) -> std::result::Result<String, String> {
    serde_json::to_string_pretty(messages).map_err(|e| e.to_string())
}

/// Convert to JSONL format
fn to_jsonl(messages: &[OutputMessage]) -> std::result::Result<String, String> {
    let lines: std::result::Result<Vec<String>, _> = messages
        .iter()
        .map(|m| serde_json::to_string(m))
        .collect();
    
    lines
        .map(|l| l.join("\n"))
        .map_err(|e| e.to_string())
}

/// Get library version
#[wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

fn parse_platform(s: &str) -> std::result::Result<Platform, JsValue> {
    match s.to_lowercase().as_str() {
        "telegram" | "tg" => Ok(Platform::Telegram),
        "whatsapp" | "wa" => Ok(Platform::WhatsApp),
        "instagram" | "ig" => Ok(Platform::Instagram),
        "discord" | "dc" => Ok(Platform::Discord),
        _ => Err(JsValue::from_str(&format!(
            "Unknown source: {}. Expected: telegram, whatsapp, instagram, discord",
            s
        ))),
    }
}

fn parse_format(s: &str) -> std::result::Result<Format, JsValue> {
    match s.to_lowercase().as_str() {
        "csv" => Ok(Format::Csv),
        "json" => Ok(Format::Json),
        "jsonl" => Ok(Format::Jsonl),
        _ => Err(JsValue::from_str(&format!(
            "Unknown format: {}. Expected: csv, json, jsonl",
            s
        ))),
    }
}