declare module '../wasm/chatpack_wasm.js' {
  export default function init(): Promise<void>
  export function convert(
    input: string,
    source: string,
    format: string,
    includeTimestamps: boolean,
    includeReplies: boolean
  ): string
  export function version(): string
}