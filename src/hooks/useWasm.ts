import { useState, useEffect, useCallback } from 'react'

interface WasmModule {
  convert: (
    input: string,
    source: string,
    format: string,
    includeTimestamps: boolean,
    includeReplies: boolean,
  ) => string
  convert_with_options?: (
    input: string,
    source: string,
    format: string,
    optionsJson: string,
  ) => string
  convert_with_report?: (
    input: string,
    source: string,
    format: string,
    optionsJson: string,
  ) => string
  parse_chat?: (input: string, source: string, optionsJson: string) => string
  supported_sources?: () => string
  supported_formats?: () => string
  version: () => string
}

export interface ConvertOptions {
  timestamps?: boolean
  ids?: boolean
  replies?: boolean
  replays?: boolean
  edited?: boolean
  merge?: boolean
  sender?: string
  dateFrom?: string
  dateTo?: string
}

export interface ConversionStats {
  original_count: number
  filtered_count: number
  merged_count: number
  messages_saved: number
  compression_ratio: number
  merge_ratio: number
  input_bytes: number
  output_bytes: number
  filters_active: boolean
  merged: boolean
}

export interface ConversionReport {
  output: string
  stats: ConversionStats
}

interface UseWasmResult {
  isLoading: boolean
  isReady: boolean
  error: string | null
  convert: (
    input: string,
    source: string,
    format: string,
    options?: ConvertOptions,
  ) => Promise<string>
  convertWithReport: (
    input: string,
    source: string,
    format: string,
    options?: ConvertOptions,
  ) => Promise<ConversionReport>
  version: string | null
  retry: () => void
  retryCount: number
}

// Human-readable error messages
const ERROR_MESSAGES: Record<string, string> = {
  'Unknown source': 'Unknown source. Supported: Telegram, WhatsApp, Instagram, Discord',
  'Unknown format': 'Unknown format. Supported: CSV, JSON, JSONL',
  'Failed to parse': "Failed to parse file. Make sure it's an export from a supported messenger",
  'Invalid JSON': 'Invalid JSON. Check file integrity',
  'Invalid date': 'Invalid date. Use YYYY-MM-DD or pick a date from the calendar',
  'Invalid options JSON': 'Invalid conversion options',
  'Empty input': 'File is empty or contains no messages',
  WASM: 'Failed to load converter. Try refreshing the page',
  network: 'Network error. Check your internet connection',
  default: 'An error occurred during conversion',
}

function humanizeError(error: string): string {
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return message
    }
  }

  if (error.length < 100 && !error.includes('panicked') && !error.includes('wasm')) {
    return error
  }

  return ERROR_MESSAGES.default
}

function normalizeOption(value?: string): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toWasmOptions(options: ConvertOptions = {}): string {
  return JSON.stringify({
    include_timestamps: options.timestamps ?? false,
    include_ids: options.ids ?? false,
    include_replies: options.replies ?? options.replays ?? false,
    include_edited: options.edited ?? false,
    merge_consecutive: options.merge ?? true,
    filter_sender: normalizeOption(options.sender),
    date_from: normalizeOption(options.dateFrom),
    date_to: normalizeOption(options.dateTo),
  })
}

function fallbackReport(input: string, output: string): ConversionReport {
  const lines = output.split('\n').filter((line) => line.trim()).length
  return {
    output,
    stats: {
      original_count: lines,
      filtered_count: lines,
      merged_count: lines,
      messages_saved: 0,
      compression_ratio: 0,
      merge_ratio: 1,
      input_bytes: new Blob([input]).size,
      output_bytes: new Blob([output]).size,
      filters_active: false,
      merged: false,
    },
  }
}

export function useWasm(): UseWasmResult {
  const [module, setModule] = useState<WasmModule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadWasm = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const wasm = await import('../wasm/chatpack_wasm.js')
      await wasm.default()

      setModule(wasm as unknown as WasmModule)
      setVersion(wasm.version())
      setIsLoading(false)
    } catch (err) {
      console.error('Failed to load WASM:', err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(humanizeError(errorMessage))
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWasm()
  }, [loadWasm, retryCount])

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1)
  }, [])

  const convertWithReport = useCallback(
    async (
      input: string,
      source: string,
      format: string,
      options: ConvertOptions = {},
    ): Promise<ConversionReport> => {
      if (!module) {
        throw new Error('Converter not loaded. Refresh the page and try again.')
      }

      if (!input || input.trim().length === 0) {
        throw new Error('File is empty or contains no data')
      }

      const optionsJson = toWasmOptions(options)

      try {
        if (module.convert_with_report) {
          return JSON.parse(module.convert_with_report(input, source, format, optionsJson))
        }

        if (module.convert_with_options) {
          const output = module.convert_with_options(input, source, format, optionsJson)
          return fallbackReport(input, output)
        }

        const output = module.convert(
          input,
          source,
          format,
          options.timestamps ?? false,
          options.replies ?? options.replays ?? false,
        )
        return fallbackReport(input, output)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        throw new Error(humanizeError(errorMessage))
      }
    },
    [module],
  )

  const convert = useCallback(
    async (
      input: string,
      source: string,
      format: string,
      options: ConvertOptions = {},
    ): Promise<string> => {
      const report = await convertWithReport(input, source, format, options)
      return report.output
    },
    [convertWithReport],
  )

  return {
    isLoading,
    isReady: module !== null && !isLoading,
    error,
    convert,
    convertWithReport,
    version,
    retry,
    retryCount,
  }
}

// Estimate processing time based on file size
export function estimateProcessingTime(fileSize: number): string {
  const estimatedMessages = fileSize / 100
  const estimatedSeconds = estimatedMessages / 100000

  if (estimatedSeconds < 1) {
    return 'less than a second'
  } else if (estimatedSeconds < 60) {
    return `~${Math.ceil(estimatedSeconds)} sec`
  } else {
    return `~${Math.ceil(estimatedSeconds / 60)} min`
  }
}

// Helper to determine if progress bar is needed
export function needsProgressIndicator(fileSize: number): boolean {
  return fileSize > 1024 * 1024
}
