export default async function init() {
  return Promise.resolve()
}

export function parse_chat(
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

  return {
    messages: [],
    stats: {},
  }
}

export const version = () => '0.0.0-mock'
