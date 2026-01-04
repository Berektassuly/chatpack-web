import { useState, useCallback } from 'react'
import { useWasm, needsProgressIndicator, estimateProcessingTime } from './hooks/useWasm'
import { DropZone } from './components/DropZone'
import { SourceDropdown } from './components/SourceDropdown'
import { Source, detectSource } from './components/sourceTypes'
import { FormatDropdown, Format } from './components/FormatDropdown'
import { FlagsSelector, Flags } from './components/FlagsSelector'
import { ConvertButton } from './components/ConvertButton'
import { ResultPreview } from './components/ResultPreview'
import { ExportGuideButton } from './components/ExportGuide'

type ConversionStatus = 'idle' | 'converting' | 'success' | 'error'

interface ConversionResult {
  content: string
  filename: string
  originalSize: number
  outputSize: number
  messageCount?: number
}

export default function App() {
  const {
    isLoading: wasmLoading,
    isReady: wasmReady,
    error: wasmError,
    convert,
    retry: retryWasm,
    retryCount,
  } = useWasm()

  const [file, setFile] = useState<File | null>(null)
  const [source, setSource] = useState<Source>('telegram')
  const [format, setFormat] = useState<Format>('csv')
  const [flags, setFlags] = useState<Flags>({ timestamps: false, replays: false })
  const [status, setStatus] = useState<ConversionStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [progress, setProgress] = useState<number | undefined>(undefined)

  // Handle file selection with auto-detection
  const handleFileSelect = useCallback((selectedFile: File | null) => {
    setFile(selectedFile)
    setStatus('idle')
    setError(null)
    setResult(null)
    setProgress(undefined)

    if (selectedFile) {
      // Auto-detect source from filename
      const detectedSource = detectSource(selectedFile.name)
      if (detectedSource) {
        setSource(detectedSource)
      }
    }
  }, [])

  const handleConvert = useCallback(async () => {
    if (!file || !wasmReady) return

    setStatus('converting')
    setError(null)
    setProgress(undefined)

    // Simulate progress for large files
    const showProgress = needsProgressIndicator(file.size)
    let progressInterval: ReturnType<typeof setInterval> | null = null

    if (showProgress) {
      setProgress(0)
      let currentProgress = 0
      progressInterval = setInterval(() => {
        // Logarithmic progress — fast to 80%, then slower
        currentProgress = Math.min(95, currentProgress + (95 - currentProgress) * 0.1)
        setProgress(currentProgress)
      }, 100)
    }

    try {
      const content = await file.text()
      const output = await convert(content, source, format, {
        timestamps: flags.timestamps,
        replays: flags.replays,
      })

      // Complete progress
      if (progressInterval) {
        clearInterval(progressInterval)
        setProgress(100)
      }

      const extension = format === 'jsonl' ? 'jsonl' : format
      const baseName = file.name.replace(/\.[^/.]+$/, '')
      const filename = `${baseName}_chatpack.${extension}`

      // Count messages
      const lineCount = output.split('\n').filter((line) => line.trim()).length
      const messageCount = format === 'csv' ? lineCount - 1 : lineCount // CSV has header

      setResult({
        content: output,
        filename,
        originalSize: file.size,
        outputSize: new Blob([output]).size,
        messageCount: Math.max(0, messageCount),
      })
      setStatus('success')

      // Reset progress after success
      setTimeout(() => setProgress(undefined), 500)
    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      setProgress(undefined)
      setError(err instanceof Error ? err.message : 'Conversion failed')
      setStatus('error')
    }
  }, [file, wasmReady, convert, source, format, flags])

  const handleDownload = useCallback(() => {
    if (!result) return

    const blob = new Blob([result.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [result])

  // Show estimated time for large files
  const estimatedTime =
    file && needsProgressIndicator(file.size) ? estimateProcessingTime(file.size) : null

  return (
    <div style={styles.app}>
      {/* Skip link for accessibility */}
      <a href="#main-content" style={styles.skipLink}>
        Skip to main content
      </a>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <a href="/" style={styles.logo} aria-label="chatpack — home">
            <span style={styles.logoIcon} aria-hidden="true">
              📦
            </span>
            <span style={styles.logoText}>chatpack</span>
          </a>
          <nav style={styles.nav} aria-label="Main navigation">
            <a
              href="https://github.com/berektassuly/chatpack"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.navLink}
            >
              GitHub
            </a>
            <a
              href="https://crates.io/crates/chatpack"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.navLink}
            >
              Crates.io
            </a>
            <a
              href="https://berektassuly.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.navLink}
            >
              Blog
            </a>
            <a
              href="https://www.linkedin.com/in/mukhammedali-berektassuly/"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.navLink}
            >
              LinkedIn
            </a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" style={styles.main}>
        <div style={styles.container}>
          {/* Hero */}
          <section style={styles.hero}>
            <h1 style={styles.title}>
              Prepare chat data for <span style={styles.titleAccent}>RAG / LLM</span>
            </h1>
            <p style={styles.subtitle}>
              Compress Telegram, WhatsApp, Instagram, Discord exports <strong>13x</strong>.
              <br />
              <span style={styles.privacyNote}>
                🔒 Works in browser — files never leave your device.
              </span>
            </p>
          </section>

          {/* Converter Card */}
          <section style={styles.card} aria-label="Converter">
            {wasmLoading && (
              <div style={styles.wasmLoading} role="status" aria-live="polite">
                <span style={styles.spinner} aria-hidden="true">
                  ⟳
                </span>
                <span>Loading converter...</span>
              </div>
            )}

            {wasmError && (
              <div style={styles.wasmError} role="alert">
                <span>⚠️ {wasmError}</span>
                <button onClick={retryWasm} style={styles.retryButton}>
                  Try again {retryCount > 0 && `(${retryCount})`}
                </button>
              </div>
            )}

            {wasmReady && (
              <>
                <DropZone
                  onFileSelect={handleFileSelect}
                  file={file}
                  disabled={status === 'converting'}
                />

                {/* Controls Row - aligned */}
                <div style={styles.controlsRow}>
                  <div style={styles.controlGroup}>
                    <div style={styles.controlHeader}>
                      <span style={styles.controlLabel}>SOURCE</span>
                      <ExportGuideButton source={source} />
                    </div>
                    <SourceDropdown
                      value={source}
                      onChange={setSource}
                      disabled={status === 'converting'}
                    />
                  </div>

                  <div style={styles.controlGroup}>
                    <div style={styles.controlHeader}>
                      <span style={styles.controlLabel}>OUTPUT FORMAT</span>
                    </div>
                    <FormatDropdown
                      value={format}
                      onChange={setFormat}
                      disabled={status === 'converting'}
                    />
                  </div>

                  <div style={styles.controlGroup}>
                    <div style={styles.controlHeader}>
                      <span style={styles.controlLabel}>FLAGS</span>
                    </div>
                    <FlagsSelector
                      value={flags}
                      onChange={setFlags}
                      disabled={status === 'converting'}
                    />
                  </div>
                </div>

                <div style={styles.actions}>
                  <ConvertButton
                    onClick={handleConvert}
                    disabled={!file || status === 'converting'}
                    loading={status === 'converting'}
                    progress={progress}
                  />
                </div>

                {/* Estimated time for large files */}
                {file && estimatedTime && status !== 'success' && (
                  <p style={styles.estimatedTime}>Estimated time: {estimatedTime}</p>
                )}

                {error && (
                  <div style={styles.error} role="alert">
                    <span>❌ {error}</span>
                  </div>
                )}

                {status === 'success' && result && (
                  <ResultPreview
                    content={result.content}
                    filename={result.filename}
                    originalSize={result.originalSize}
                    outputSize={result.outputSize}
                    messageCount={result.messageCount}
                    onDownload={handleDownload}
                  />
                )}
              </>
            )}
          </section>

          {/* Features */}
          <section style={styles.features} aria-label="Features">
            <div style={styles.feature}>
              <span style={styles.featureIcon} aria-hidden="true">
                🔒
              </span>
              <span style={styles.featureText}>
                <strong>100% Private</strong> — processed locally in browser
              </span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon} aria-hidden="true">
                ⚡
              </span>
              <span style={styles.featureText}>
                <strong>Fast</strong> — 100K+ messages per second
              </span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon} aria-hidden="true">
                📦
              </span>
              <span style={styles.featureText}>
                Also available as CLI: <code>cargo install chatpack</code>
              </span>
            </div>
          </section>

          {/* Help text */}
          <p style={styles.helpText}>
            Having issues? Let me know on{' '}
            <a
              href="https://github.com/berektassuly/chatpack/issues"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.helpLink}
            >
              GitHub
            </a>{' '}
            or{' '}
            <a
              href="https://t.me/berektassuly"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.helpLink}
            >
              Telegram
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <span style={styles.footerCopyright}>© 2025 Mukhammedali Berektassuly</span>
          <div style={styles.footerLinks}>
            <a
              href="https://www.linkedin.com/in/mukhammedali-berektassuly/"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.footerLink}
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/berektassuly"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.footerLink}
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  skipLink: {
    position: 'absolute',
    left: '-9999px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  },

  // Header
  header: {
    borderBottom: '1px solid var(--border-subtle)',
    background: 'var(--bg-secondary)',
  },
  headerContent: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: '24px',
  },
  logoText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  nav: {
    display: 'flex',
    gap: '8px',
  },
  navLink: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    transition: 'color var(--transition-fast), background var(--transition-fast)',
  },

  // Main
  main: {
    flex: 1,
    padding: '48px 16px',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },

  // Hero
  hero: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(22px, 5vw, 28px)',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '12px',
    lineHeight: 1.3,
  },
  titleAccent: {
    color: 'var(--accent-green)',
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  privacyNote: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },

  // Card
  card: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    marginBottom: '32px',
  },
  wasmLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '40px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
  },
  wasmError: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '24px',
    color: 'var(--accent-red)',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
  },
  retryButton: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    padding: '10px 20px',
    border: '1px solid var(--accent-red)',
    borderRadius: 'var(--radius-md)',
    background: 'transparent',
    color: 'var(--accent-red)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },

  // Controls Row - ровный грид
  controlsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid var(--border-subtle)',
    alignItems: 'start',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  controlHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    height: '28px',
  },
  controlLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '24px',
  },
  estimatedTime: {
    textAlign: 'center',
    marginTop: '12px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  error: {
    marginTop: '16px',
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--accent-red)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--accent-red)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
  },

  // Features
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '32px',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-subtle)',
  },
  featureIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  featureText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },

  // Help text
  helpText: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  helpLink: {
    color: 'var(--text-secondary)',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },

  // Footer
  footer: {
    borderTop: '1px solid var(--border-subtle)',
    background: 'var(--bg-secondary)',
  },
  footerContent: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  footerCopyright: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  footerLinks: {
    display: 'flex',
    gap: '20px',
  },
  footerLink: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color var(--transition-fast)',
  },
}
