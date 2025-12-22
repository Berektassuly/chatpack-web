import { memo, useCallback, useState, useRef } from 'react'

interface DropZoneProps {
  onFileSelect: (file: File) => void
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
  const inputRef = useRef<HTMLInputElement>(null)

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
      onFileSelect(files[0])
    }
  }, [disabled, onFileSelect])

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click()
    }
  }, [disabled])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
  }, [onFileSelect])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        ...styles.container,
        ...(isDragOver ? styles.containerDragOver : {}),
        ...(file ? styles.containerWithFile : {}),
        ...(disabled ? styles.containerDisabled : {}),
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={styles.input}
        disabled={disabled}
      />

      {file ? (
        <div style={styles.fileInfo}>
          <div style={styles.fileIcon}>📄</div>
          <div style={styles.fileDetails}>
            <span style={styles.fileName}>{file.name}</span>
            <span style={styles.fileSize}>{formatFileSize(file.size)}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFileSelect(null as unknown as File)
            }}
            style={styles.removeButton}
            title="Remove file"
          >
            ✕
          </button>
        </div>
      ) : (
        <div style={styles.placeholder}>
          <div style={styles.icon}>
            {isDragOver ? '📥' : '📁'}
          </div>
          <div style={styles.text}>
            <span style={styles.textPrimary}>
              {isDragOver ? 'Drop file here' : 'Drop file here or click to select'}
            </span>
            <span style={styles.textSecondary}>
              Supports .json, .txt, .csv
            </span>
          </div>
        </div>
      )}
    </div>
  )
})

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
    width: '28px',
    height: '28px',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all var(--transition-fast)',
  },
}
