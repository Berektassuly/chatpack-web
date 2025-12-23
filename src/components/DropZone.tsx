import { memo, useCallback, useState, useRef } from 'react'

// File size limit: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

interface DropZoneProps {
  onFileSelect: (file: File | null) => void
  file: File | null
  disabled?: boolean
  accept?: string
}

export const DropZone = memo(function DropZone({
  onFileSelect,
  file,
  disabled = false,
  accept = '.json,.txt,.csv',
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndSelect = useCallback((selectedFile: File) => {
    setSizeError(null)
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      setSizeError(`File too large (${formatFileSize(selectedFile.size)}). Max: ${formatFileSize(MAX_FILE_SIZE)}`)
      return
    }
    
    onFileSelect(selectedFile)
  }, [onFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      validateAndSelect(files[0])
    }
  }, [disabled, validateAndSelect])

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click()
    }
  }, [disabled])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      validateAndSelect(files[0])
    }
  }, [validateAndSelect])

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setSizeError(null)
    onFileSelect(null)
  }, [onFileSelect])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }, [handleClick])

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={file ? `Selected file: ${file.name}` : 'Drop file or click to select'}
      aria-disabled={disabled}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        ...styles.container,
        ...(isDragOver ? styles.containerDragOver : {}),
        ...(file ? styles.containerWithFile : {}),
        ...(disabled ? styles.containerDisabled : {}),
        ...(sizeError ? styles.containerError : {}),
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={styles.input}
        disabled={disabled}
        aria-hidden="true"
      />

      {sizeError ? (
        <div style={styles.errorInfo}>
          <div style={styles.errorIcon}>⚠️</div>
          <div style={styles.errorText}>{sizeError}</div>
          <button
            onClick={handleRemove}
            style={styles.retryButton}
            aria-label="Try another file"
          >
            Select another file
          </button>
        </div>
      ) : file ? (
        <div style={styles.fileInfo}>
          <div style={styles.fileIcon} aria-hidden="true">📄</div>
          <div style={styles.fileDetails}>
            <span style={styles.fileName}>{file.name}</span>
            <span style={styles.fileSize}>{formatFileSize(file.size)}</span>
          </div>
          <button
            onClick={handleRemove}
            style={styles.removeButton}
            title="Remove file"
            aria-label="Remove selected file"
          >
            ✕
          </button>
        </div>
      ) : (
        <div style={styles.placeholder}>
          <div style={styles.icon} aria-hidden="true">
            {isDragOver ? '📥' : '📁'}
          </div>
          <div style={styles.text}>
            <span style={styles.textPrimary}>
              {isDragOver ? 'Drop file here' : 'Drop file or click to select'}
            </span>
            <span style={styles.textSecondary}>
              .json, .txt, .csv • up to {formatFileSize(MAX_FILE_SIZE)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
})

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '140px',
    padding: '24px',
    border: '2px dashed var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--bg-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition-default)',
    outline: 'none',
  },
  containerDragOver: {
    borderColor: 'var(--accent-green)',
    background: 'var(--accent-green-glow)',
    transform: 'scale(1.01)',
  },
  containerWithFile: {
    borderStyle: 'solid',
    borderColor: 'var(--accent-green)',
    background: 'var(--bg-tertiary)',
  },
  containerDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  containerError: {
    borderColor: 'var(--accent-red)',
    background: 'rgba(239, 68, 68, 0.1)',
  },
  input: {
    display: 'none',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '40px',
    lineHeight: 1,
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  textPrimary: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--text-primary)',
  },
  textSecondary: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  fileIcon: {
    fontSize: '32px',
    lineHeight: 1,
  },
  fileDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  fileName: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileSize: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all var(--transition-fast)',
    minWidth: '32px',  // Для мобильных устройств
  },
  errorInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '32px',
  },
  errorText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: 'var(--accent-red)',
  },
  retryButton: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    padding: '8px 16px',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
}
