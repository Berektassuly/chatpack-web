import { useState, useEffect, useCallback } from 'react'

interface WasmModule {
  convert: (
    input: string,
    source: string,
    format: string,
    includeTimestamps: boolean,
    includeReplies: boolean
  ) => string
  version: () => string
}

interface ConvertOptions {
  timestamps?: boolean
  replays?: boolean
}

interface UseWasmResult {
  isLoading: boolean
  isReady: boolean
  error: string | null
  convert: (input: string, source: string, format: string, options?: ConvertOptions) => Promise<string>
  version: string | null
  retry: () => void
  retryCount: number
}

// Human-readable error messages
const ERROR_MESSAGES: Record<string, string> = {
  'Unknown source': 'Unknown source. Supported: Telegram, WhatsApp, Instagram, Discord',
  'Unknown format': 'Unknown format. Supported: CSV, JSON, JSONL',
  'Failed to parse': 'Failed to parse file. Make sure it\'s an export from a supported messenger',
  'Invalid JSON': 'Invalid JSON. Check file integrity',
  'Empty input': 'File is empty or contains no messages',
  'WASM': 'Failed to load converter. Try refreshing the page',
  'network': 'Network error. Check your internet connection',
  'default': 'An error occurred during conversion',
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
    setRetryCount(prev => prev + 1)
  }, [])

  const convert = useCallback(
    async (
      input: string,
      source: string,
      format: string,
      options: ConvertOptions = {}
    ): Promise<string> => {
      if (!module) {
        throw new Error('Converter not loaded. Refresh the page and try again.')
      }
      
      if (!input || input.trim().length === 0) {
        throw new Error('File is empty or contains no data')
      }
      
      const { timestamps = false, replays = false } = options
      
      try {
        return module.convert(input, source, format, timestamps, replays)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        throw new Error(humanizeError(errorMessage))
      }
    },
    [module]
  )

  return {
    isLoading,
    isReady: module !== null && !isLoading,
    error,
    convert,
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