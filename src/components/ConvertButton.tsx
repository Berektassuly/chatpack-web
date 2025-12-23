import { memo } from 'react'

interface ConvertButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  progress?: number  // 0-100, optional progress indicator
}

export const ConvertButton = memo(function ConvertButton({
  onClick,
  disabled = false,
  loading = false,
  progress,
}: ConvertButtonProps) {
  const showProgress = loading && typeof progress === 'number'

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      style={{
        ...styles.button,
        ...(disabled || loading ? styles.buttonDisabled : {}),
      }}
    >
      {loading ? (
        <>
          <span style={styles.spinner} aria-hidden="true">⟳</span>
          <span>
            {showProgress 
              ? `Конвертация... ${Math.round(progress)}%` 
              : 'Конвертация...'
            }
          </span>
        </>
      ) : (
        <>
          <span>Конвертировать</span>
          <span style={styles.arrow} aria-hidden="true">→</span>
        </>
      )}
      
      {/* Progress bar */}
      {showProgress && (
        <div 
          style={styles.progressBar}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div 
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }}
          />
        </div>
      )}
    </button>
  )
})

const styles: Record<string, React.CSSProperties> = {
  button: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    fontWeight: 600,
    padding: '14px 32px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-green)',
    color: 'var(--bg-primary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    minHeight: '48px',
    minWidth: '200px',
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  arrow: {
    transition: 'transform var(--transition-fast)',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'rgba(0, 0, 0, 0.3)',
  },
  progressFill: {
    height: '100%',
    background: 'var(--bg-primary)',
    transition: 'width 150ms ease',
  },
}
