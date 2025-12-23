import { memo, useState, useRef, useEffect, useCallback } from 'react'

export type Source = 'telegram' | 'whatsapp' | 'instagram' | 'discord'

interface SourceDropdownProps {
  value: Source
  onChange: (source: Source) => void
  disabled?: boolean
}

const sources: { id: Source; label: string }[] = [
  { id: 'telegram', label: 'Telegram' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'discord', label: 'Discord' },
]

export const SourceDropdown = memo(function SourceDropdown({
  value,
  onChange,
  disabled = false,
}: SourceDropdownProps) {
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

  const handleSelect = useCallback((source: Source) => {
    onChange(source)
    setIsOpen(false)
  }, [onChange])

  const selectedSource = sources.find(s => s.id === value)!

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
        <span style={styles.value}>{selectedSource.label}</span>
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
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => handleSelect(source.id)}
              style={{
                ...styles.option,
                ...(value === source.id ? styles.optionActive : {}),
              }}
            >
              {source.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

// Улучшенное автоопределение источника
export function detectSource(filename: string): Source | null {
  const name = filename.toLowerCase()
  
  if (name === 'result.json' || name.includes('telegram')) {
    return 'telegram'
  }
  
  if (name.includes('whatsapp') || name.endsWith('_chat.txt') || name.startsWith('whatsapp chat')) {
    return 'whatsapp'
  }
  
  if (name.includes('instagram') || /message_\d+\.json$/.test(name)) {
    return 'instagram'
  }
  
  if (name.includes('discord') || (name === 'messages.json' && !name.includes('instagram'))) {
    return 'discord'
  }
  
  return null
}

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
