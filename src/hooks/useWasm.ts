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
  retry: () => void
  retryCount: number
}

// Человекочитаемые сообщения об ошибках
const ERROR_MESSAGES: Record<string, string> = {
  'Unknown source': 'Неизвестный источник. Поддерживаются: Telegram, WhatsApp, Instagram, Discord',
  'Unknown format': 'Неизвестный формат. Поддерживаются: CSV, JSON, JSONL',
  'Failed to parse': 'Не удалось распознать файл. Убедитесь, что это экспорт из поддерживаемого мессенджера',
  'Invalid JSON': 'Некорректный JSON. Проверьте целостность файла',
  'Empty input': 'Файл пуст или не содержит сообщений',
  'WASM': 'Ошибка загрузки конвертера. Попробуйте обновить страницу',
  'network': 'Ошибка сети. Проверьте подключение к интернету',
  'default': 'Произошла ошибка при конвертации',
}

function humanizeError(error: string): string {
  // Ищем совпадение с известными ошибками
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return message
    }
  }
  
  // Если ошибка короткая и понятная, возвращаем как есть
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
      
      // Dynamic import of WASM module
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
    async (input: string, source: string, format: string): Promise<string> => {
      if (!module) {
        throw new Error('Конвертер не загружен. Обновите страницу и попробуйте снова.')
      }
      
      // Проверка на пустой ввод
      if (!input || input.trim().length === 0) {
        throw new Error('Файл пуст или не содержит данных')
      }
      
      try {
        return module.convert(input, source, format)
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

// Отдельная функция для оценки размера файла и времени обработки
export function estimateProcessingTime(fileSize: number): string {
  // Примерно 100K сообщений/сек, ~100 байт на сообщение
  const estimatedMessages = fileSize / 100
  const estimatedSeconds = estimatedMessages / 100000
  
  if (estimatedSeconds < 1) {
    return 'менее секунды'
  } else if (estimatedSeconds < 60) {
    return `~${Math.ceil(estimatedSeconds)} сек.`
  } else {
    return `~${Math.ceil(estimatedSeconds / 60)} мин.`
  }
}

// Хелпер для определения, нужен ли progress bar
export function needsProgressIndicator(fileSize: number): boolean {
  // Показываем progress для файлов > 1MB
  return fileSize > 1024 * 1024
}
