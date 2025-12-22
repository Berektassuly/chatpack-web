import { useState, useEffect, useCallback } from 'react'

interface WasmModule {
  convert: (input: string, source: string, format: string) => string
  version: () => string
}

interface UseWasmResult {
  isLoading: boolean
  isReady: boolean
  error: string | null
  convert: (input: string, source: string, format: string) => Promise<string>
  version: string | null
}

export function useWasm(): UseWasmResult {
  const [module, setModule] = useState<WasmModule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadWasm() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Dynamic import of WASM module
        const wasm = await import('../wasm/chatpack_wasm.js')
        await wasm.default()
        
        if (mounted) {
          setModule(wasm as unknown as WasmModule)
          setVersion(wasm.version())
          setIsLoading(false)
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to load WASM:', err)
          setError(err instanceof Error ? err.message : 'Failed to load WASM module')
          setIsLoading(false)
        }
      }
    }

    loadWasm()

    return () => {
      mounted = false
    }
  }, [])

  const convert = useCallback(
    async (input: string, source: string, format: string): Promise<string> => {
      if (!module) {
        throw new Error('WASM module not loaded')
      }
      
      try {
        return module.convert(input, source, format)
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : String(err))
      }
    },
    [module]
  )

  return {
    isLoading,
    isReady: module !== null && !isLoading,
    error,
    convert,
    version
  }
}
