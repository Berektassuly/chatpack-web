import { useState, useCallback } from 'react'
import { useWasm } from './hooks/useWasm'
import { DropZone } from './components/DropZone'
import { SourceSelector, Source } from './components/SourceSelector'
import { FormatSelector, Format } from './components/FormatSelector'
import { ConvertButton } from './components/ConvertButton'

type ConversionStatus = 'idle' | 'converting' | 'success' | 'error'

interface ConversionResult {
  content: string
  filename: string
  originalSize: number
  outputSize: number
  messageCount?: number
}

export default function App() {
  const { isLoading: wasmLoading, isReady: wasmReady, error: wasmError, convert } = useWasm()
  
  const [file, setFile] = useState<File | null>(null)
  const [source, setSource] = useState<Source>('telegram')
  const [format, setFormat] = useState<Format>('csv')
  const [status, setStatus] = useState<ConversionStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ConversionResult | null>(null)

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    setFile(selectedFile)
    setStatus('idle')
    setError(null)
    setResult(null)

    // Auto-detect source from filename
    if (selectedFile) {
      const name = selectedFile.name.toLowerCase()
      if (name.includes('telegram') || name.includes('result.json')) {
        setSource('telegram')
      } else if (name.includes('whatsapp') || name.endsWith('.txt')) {
        setSource('whatsapp')
      } else if (name.includes('instagram') || name.includes('message')) {
        setSource('instagram')
      } else if (name.includes('discord')) {
        setSource('discord')
      }
    }
  }, [])

  const handleConvert = useCallback(async () => {
    if (!file || !wasmReady) return

    setStatus('converting')
    setError(null)

    try {
      const content = await file.text()
      const output = await convert(content, source, format)
      
      const extension = format === 'jsonl' ? 'jsonl' : format
      const baseName = file.name.replace(/\.[^/.]+$/, '')
      const filename = `${baseName}_optimized.${extension}`

      // Count lines for stats
      const lineCount = output.split('\n').filter(line => line.trim()).length

      setResult({
        content: output,
        filename,
        originalSize: file.size,
        outputSize: new Blob([output]).size,
        messageCount: lineCount - 1, // minus header for CSV
      })
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
      setStatus('error')
    }
  }, [file, wasmReady, convert, source, format])

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

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const compressionRatio = result 
    ? ((1 - result.outputSize / result.originalSize) * 100).toFixed(1)
    : null

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <a href="/" style={styles.logo}>
            <span style={styles.logoIcon}>📦</span>
            <span style={styles.logoText}>chatpack</span>
          </a>
          <nav style={styles.nav}>
            <a href="https://github.com/berektassuly/chatpack" target="_blank" rel="noopener noreferrer" style={styles.navLink}>
              GitHub
            </a>
            <a href="https://berektassuly.com/blog" target="_blank" rel="noopener noreferrer" style={styles.navLink}>
              Blog
            </a>
            <a href="https://linkedin.com/in/berektassuly" target="_blank" rel="noopener noreferrer" style={styles.navLink}>
              LinkedIn
            </a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.container}>
          {/* Hero */}
          <section style={styles.hero}>
            <h1 style={styles.title}>
              Prepare chat data for <span style={styles.titleAccent}>RAG / LLM</span>
            </h1>
            <p style={styles.subtitle}>
              Compress Telegram, WhatsApp, Instagram, Discord exports <strong>13x</strong>.
              <br />
              Works in browser — files never leave your device.
            </p>
          </section>

          {/* Converter Card */}
          <section style={styles.card}>
            {wasmLoading && (
              <div style={styles.wasmLoading}>
                <span style={styles.spinner}>⟳</span>
                <span>Loading converter...</span>
              </div>
            )}

            {wasmError && (
              <div style={styles.wasmError}>
                <span>⚠️ Failed to load converter: {wasmError}</span>
              </div>
            )}

            {wasmReady && (
              <>
                <DropZone
                  onFileSelect={handleFileSelect}
                  file={file}
                  disabled={status === 'converting'}
                />

                <div style={styles.controls}>
                  <SourceSelector
                    value={source}
                    onChange={setSource}
                    disabled={status === 'converting'}
                  />
                  <FormatSelector
                    value={format}
                    onChange={setFormat}
                    disabled={status === 'converting'}
                  />
                </div>

                <div style={styles.actions}>
                  <ConvertButton
                    onClick={handleConvert}
                    disabled={!file || status === 'converting'}
                    loading={status === 'converting'}
                  />
                </div>

                {error && (
                  <div style={styles.error}>
                    <span>❌ {error}</span>
                  </div>
                )}

                {status === 'success' && result && (
                  <div style={styles.result}>
                    <div style={styles.resultHeader}>
                      <span style={styles.resultIcon}>✅</span>
                      <span style={styles.resultTitle}>Conversion complete</span>
                    </div>
                    
                    <div style={styles.resultStats}>
                      <div style={styles.stat}>
                        <span style={styles.statLabel}>Output</span>
                        <span style={styles.statValue}>{formatBytes(result.outputSize)}</span>
                      </div>
                      <div style={styles.stat}>
                        <span style={styles.statLabel}>Compression</span>
                        <span style={{ ...styles.statValue, color: 'var(--accent-green)' }}>
                          {compressionRatio}%
                        </span>
                      </div>
                      {result.messageCount && (
                        <div style={styles.stat}>
                          <span style={styles.statLabel}>Messages</span>
                          <span style={styles.statValue}>{result.messageCount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <button onClick={handleDownload} style={styles.downloadButton}>
                      <span>⬇</span>
                      <span>Download {result.filename}</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Features */}
          <section style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🔒</span>
              <span style={styles.featureText}>
                <strong>100% Private</strong> — processed locally in browser
              </span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>⚡</span>
              <span style={styles.featureText}>
                <strong>Fast</strong> — 100K+ messages per second
              </span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>💻</span>
              <span style={styles.featureText}>
                Also available as CLI: <code>cargo install chatpack</code>
              </span>
            </div>
          </section>

          {/* Help text */}
          <p style={styles.helpText}>
            Having issues? Let me know on{' '}
            <a href="https://github.com/berektassuly/chatpack/issues" target="_blank" rel="noopener noreferrer" style={styles.helpLink}>
              GitHub
            </a>{' '}
            or{' '}
            <a href="https://t.me/berektassuly" target="_blank" rel="noopener noreferrer" style={styles.helpLink}>
              Telegram
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <span style={styles.footerCopyright}>
            © 2025 Mukhammedali Berektassuly
          </span>
          <div style={styles.footerLinks}>
            <a href="https://linkedin.com/in/berektassuly" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              LinkedIn
            </a>
            <a href="https://github.com/berektassuly" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              GitHub
            </a>
            <a href="https://berektassuly.com/blog" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              Blog
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

  // Header
  header: {
    borderBottom: '1px solid var(--border-subtle)',
    background: 'var(--bg-secondary)',
  },
  headerContent: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    gap: '24px',
  },
  navLink: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color var(--transition-fast)',
  },

  // Main
  main: {
    flex: 1,
    padding: '48px 24px',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
  },

  // Hero
  hero: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontFamily: 'var(--font-mono)',
    fontSize: '28px',
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: 'var(--accent-red)',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 'var(--radius-md)',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-subtle)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '24px',
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
  result: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-subtle)',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  resultIcon: {
    fontSize: '20px',
  },
  resultTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--accent-green)',
  },
  resultStats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 600,
    padding: '12px 20px',
    border: '1px solid var(--accent-green)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-green-glow)',
    color: 'var(--accent-green)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
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
    maxWidth: '800px',
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
