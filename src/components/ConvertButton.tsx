import { memo } from 'react'

interface ConvertButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export const ConvertButton = memo(function ConvertButton({
  onClick,
  disabled = false,
  loading = false,
}: ConvertButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...styles.button,
        ...(disabled || loading ? styles.buttonDisabled : {}),
      }}
    >
      {loading ? (
        <>
          <span style={styles.spinner}>⟳</span>
          <span>Converting...</span>
        </>
      ) : (
        <>
          <span>Convert</span>
          <span style={styles.arrow}>→</span>
        </>
      )}
    </button>
  )
})

const styles: Record<string, React.CSSProperties> = {
  button: {
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
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  arrow: {
    transition: 'transform var(--transition-fast)',
  },
}
