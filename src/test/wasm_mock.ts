export default async function init() {
  return Promise.resolve()
}

export function convert(
  _input: string,
  _source: string,
  _format: string,
  _includeTimestamps: boolean,
  _includeReplies: boolean,
) {
  void _input
  void _source
  void _format
  void _includeTimestamps
  void _includeReplies

  return 'Sender;Content\n'
}

export function convert_with_options(
  _input: string,
  _source: string,
  _format: string,
  _optionsJson: string,
) {
  void _input
  void _source
  void _format
  void _optionsJson

  return 'Sender;Content\n'
}

export function convert_with_report(
  input: string,
  _source: string,
  _format: string,
  _optionsJson: string,
) {
  void _source
  void _format
  void _optionsJson

  return JSON.stringify({
    output: 'Sender;Content\n',
    stats: {
      original_count: 0,
      filtered_count: 0,
      merged_count: 0,
      messages_saved: 0,
      compression_ratio: 0,
      merge_ratio: 1,
      input_bytes: new Blob([input]).size,
      output_bytes: new Blob(['Sender;Content\n']).size,
      filters_active: false,
      merged: true,
    },
  })
}

export function parse_chat(_input: string, _source: string, _optionsJson: string) {
  void _input
  void _source
  void _optionsJson

  return JSON.stringify({
    messages: [],
    stats: {},
  })
}

export function supported_sources() {
  return JSON.stringify([
    { id: 'telegram', label: 'Telegram', default_extension: 'json' },
    { id: 'whatsapp', label: 'WhatsApp', default_extension: 'txt' },
    { id: 'instagram', label: 'Instagram', default_extension: 'json' },
    { id: 'discord', label: 'Discord', default_extension: 'json' },
  ])
}

export function supported_formats() {
  return JSON.stringify([
    { id: 'csv', label: 'CSV', extension: 'csv', mime_type: 'text/csv' },
    { id: 'json', label: 'JSON', extension: 'json', mime_type: 'application/json' },
    { id: 'jsonl', label: 'JSONL', extension: 'jsonl', mime_type: 'application/x-ndjson' },
  ])
}

export const version = () => '0.0.0-mock'
