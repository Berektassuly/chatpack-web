import { memo, useState, useRef, useEffect } from 'react'

export type Format = 'csv' | 'json' | 'jsonl'

interface FormatSelectorProps {
  value: Format
  onChange: (format: Format) => void
  disabled?: boolean
}

const formats: { id: Format; label: string; description: string }[] = [
  { id: 'csv', label: 'CSV', description: '13x compression — best for LLM' },
  { id: 'json', label: 'JSON', description: 'Structured array' },
  { id: 'jsonl', label: 'JSONL', description: 'One JSON per line — for RAG' },
]

export const FormatSelector = memo(function FormatSelector({
  value,
  onChange,
  disabled = false,
}: FormatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedFormat = formats.find((f) => f.id === value)!

  return (
    <div style={styles.container} ref={containerRef}>
      <span style={styles.label}>Format</span>
      <div style={styles.dropdownContainer}>
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          style={{
            ...styles.trigger,
            ...(isOpen ? styles.triggerOpen : {}),
            ...(disabled ? styles.triggerDisabled : {}),
          }}
        >
          <span style={styles.triggerValue}>{selectedFormat.label}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              ...styles.chevron,
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isOpen && (
          <div style={styles.dropdown}>
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => {
                  onChange(format.id)
                  setIsOpen(false)
                }}
                style={{
                  ...styles.option,
                  ...(value === format.id ? styles.optionActive : {}),
                }}
              >
                <span style={styles.optionLabel}>{format.label}</span>
                <span style={styles.optionDescription}>{format.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  dropdownContainer: {
    position: 'relative',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 600,
    padding: '8px 12px',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    minWidth: '90px',
  },
  triggerOpen: {
    borderColor: 'var(--accent-green)',
    background: 'var(--bg-tertiary)',
  },
  triggerDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  triggerValue: {
    flex: 1,
    textAlign: 'left',
  },
  chevron: {
    color: 'var(--text-muted)',
    transition: 'transform var(--transition-fast)',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    minWidth: '220px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    zIndex: 100,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
  option: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    width: '100%',
    padding: '10px 12px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background var(--transition-fast)',
  },
  optionActive: {
    background: 'var(--accent-green-glow)',
  },
  optionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  optionDescription: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
}
