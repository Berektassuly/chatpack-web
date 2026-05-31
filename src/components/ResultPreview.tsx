import { memo, useState, useCallback } from 'react'
import type { ConversionStats } from '../hooks/useWasm'

interface ResultPreviewProps {
  content: string
  filename: string
  originalSize: number
  outputSize: number
  messageCount?: number
  stats?: ConversionStats
  onDownload: () => void
}

const MAX_PREVIEW_LINES = 10
const MAX_LINE_LENGTH = 100

export const ResultPreview = memo(function ResultPreview({
  content,
  filename,
  originalSize,
  outputSize,
  messageCount,
  stats,
  onDownload,
}: ResultPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const compressionRatio = ((1 - outputSize / originalSize) * 100).toFixed(1)

  // Подготовка превью
  const previewLines = content
    .split('\n')
    .slice(0, MAX_PREVIEW_LINES)
    .map((line) =>
      line.length > MAX_LINE_LENGTH ? line.substring(0, MAX_LINE_LENGTH) + '...' : line,
    )

  const totalLines = content.split('\n').length
  const hasMoreLines = totalLines > MAX_PREVIEW_LINES

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [content])

  const handleDownload = useCallback(() => {
    onDownload()
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }, [onDownload])

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.icon} aria-hidden="true">
          ✅
        </span>
        <span style={styles.title}>Конвертация завершена</span>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Размер</span>
          <span style={styles.statValue}>{formatBytes(outputSize)}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Сжатие</span>
          <span style={{ ...styles.statValue, color: 'var(--accent-green)' }}>
            {compressionRatio}%
          </span>
        </div>
        {messageCount !== undefined && (
          <div style={styles.stat}>
            <span style={styles.statLabel}>Сообщений</span>
            <span style={styles.statValue}>{messageCount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {stats && (
        <div style={styles.pipelineStats}>
          <span style={styles.pipelineItem}>Parsed {stats.original_count.toLocaleString()}</span>
          <span style={styles.pipelineDivider}>/</span>
          <span style={styles.pipelineItem}>Filtered {stats.filtered_count.toLocaleString()}</span>
          <span style={styles.pipelineDivider}>/</span>
          <span style={styles.pipelineItem}>Output {stats.merged_count.toLocaleString()}</span>
          {stats.messages_saved > 0 && (
            <>
              <span style={styles.pipelineDivider}>/</span>
              <span style={styles.pipelineAccent}>
                Saved {stats.messages_saved.toLocaleString()} messages
              </span>
            </>
          )}
        </div>
      )}

      {/* Preview toggle */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        style={styles.previewToggle}
        aria-expanded={showPreview}
        aria-controls="result-preview"
      >
        <span>{showPreview ? '▼' : '▶'}</span>
        <span>Превью результата</span>
      </button>

      {/* Preview content */}
      {showPreview && (
        <div id="result-preview" style={styles.previewContainer}>
          <pre style={styles.previewCode}>
            {previewLines.map((line, index) => (
              <div key={index} style={styles.previewLine}>
                <span style={styles.lineNumber}>{index + 1}</span>
                <span style={styles.lineContent}>{line}</span>
              </div>
            ))}
            {hasMoreLines && (
              <div style={styles.previewMore}>... ещё {totalLines - MAX_PREVIEW_LINES} строк</div>
            )}
          </pre>
          <button
            onClick={handleCopy}
            style={styles.copyButton}
            aria-label="Скопировать в буфер обмена"
          >
            {copied ? '✓ Скопировано' : '📋 Копировать всё'}
          </button>
        </div>
      )}

      {/* Download button */}
      <button
        onClick={handleDownload}
        style={{
          ...styles.downloadButton,
          ...(downloaded ? styles.downloadButtonSuccess : {}),
        }}
        aria-live="polite"
      >
        <span aria-hidden="true">{downloaded ? '✓' : '⬇'}</span>
        <span>{downloaded ? 'Скачивание началось!' : `Скачать ${filename}`}</span>
      </button>

      {/* Download hint */}
      {downloaded && <p style={styles.downloadHint}>Файл сохранён в папку загрузок</p>}
    </div>
  )
})

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-subtle)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  icon: {
    fontSize: '20px',
  },
  title: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--accent-green)',
  },
  stats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
    flexWrap: 'wrap',
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
  pipelineStats: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    padding: '10px 12px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
  },
  pipelineItem: {
    color: 'var(--text-secondary)',
  },
  pipelineDivider: {
    color: 'var(--text-muted)',
  },
  pipelineAccent: {
    color: 'var(--accent-green)',
  },
  previewToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 12px',
    marginBottom: '12px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    textAlign: 'left',
  },
  previewContainer: {
    marginBottom: '16px',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  previewCode: {
    margin: 0,
    padding: '12px',
    background: 'var(--bg-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    lineHeight: 1.5,
    overflow: 'auto',
    maxHeight: '200px',
  },
  previewLine: {
    display: 'flex',
    gap: '12px',
  },
  lineNumber: {
    color: 'var(--text-muted)',
    userSelect: 'none',
    minWidth: '24px',
    textAlign: 'right',
  },
  lineContent: {
    color: 'var(--text-primary)',
    whiteSpace: 'pre',
  },
  previewMore: {
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    paddingTop: '8px',
    paddingLeft: '36px',
  },
  copyButton: {
    width: '100%',
    padding: '10px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    background: 'var(--bg-tertiary)',
    border: 'none',
    borderTop: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
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
    padding: '14px 20px',
    border: '1px solid var(--accent-green)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-green-glow)',
    color: 'var(--accent-green)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    minHeight: '48px',
  },
  downloadButtonSuccess: {
    background: 'var(--accent-green)',
    color: 'var(--bg-primary)',
  },
  downloadHint: {
    marginTop: '8px',
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
}
