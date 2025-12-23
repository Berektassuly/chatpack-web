import { memo, useState, useRef, useEffect, useCallback } from 'react'

export type Format = 'csv' | 'json' | 'jsonl'

interface FormatDropdownProps {
  value: Format
  onChange: (format: Format) => void
  disabled?: boolean
}

const formats: { id: Format; label: string }[] = [
  { id: 'csv', label: 'CSV' },
  { id: 'json', label: 'JSON' },
  { id: 'jsonl', label: 'JSONL' },
]

export const FormatDropdown = memo(function FormatDropdown({
  value,
  onChange,
  disabled = false,
}: FormatDropdownProps) {
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

  const handleSelect = useCallback((format: Format) => {
    onChange(format)
    setIsOpen(false)
  }, [onChange])

  const selectedFormat = formats.find(f => f.id === value)!

  return (
    <div style={styles.container} ref={containerRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          ...styles.trigger,
          ...(isOpen ? styles.triggerOpen : {}),
          ...(disabled ? styles.triggerDisabled : {}),
        }}
      >
        <span style={styles.value}>{selectedFormat.label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
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
              onClick={() => handleSelect(format.id)}
              style={{
                ...styles.option,
                ...(value === format.id ? styles.optionActive : {}),
              }}
            >
              {format.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    width: '100%',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 16px',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  triggerOpen: {
    borderColor: 'var(--accent-green)',
  },
  triggerDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  value: {
    flex: 1,
    textAlign: 'left',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    zIndex: 100,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
  option: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background var(--transition-fast)',
  },
  optionActive: {
    background: 'var(--accent-green-glow)',
    color: 'var(--accent-green)',
  },
}
