declare module '../wasm/chatpack_wasm.js' {
  export default function init(): Promise<void>
  export function convert(
    input: string,
    source: string,
    format: string,
    includeTimestamps: boolean,
    includeReplies: boolean,
  ): string
  export function convert_with_options(
    input: string,
    source: string,
    format: string,
    optionsJson: string,
  ): string
  export function convert_with_report(
    input: string,
    source: string,
    format: string,
    optionsJson: string,
  ): string
  export function parse_chat(input: string, source: string, optionsJson: string): string
  export function supported_sources(): string
  export function supported_formats(): string
  export function version(): string
}
