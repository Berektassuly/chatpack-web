import { memo, useState, useRef, useEffect, useCallback } from 'react'

export type Format = 'csv' | 'json' | 'jsonl'

interface FormatSelectorProps {
  value: Format
  onChange: (format: Format) => void
  disabled?: boolean
}

const formats: { id: Format; label: string; description: string }[] = [
  { id: 'csv', label: 'CSV', description: '13x сжатие — лучший для LLM' },
  { id: 'json', label: 'JSON', description: 'Структурированный массив' },
  { id: 'jsonl', label: 'JSONL', description: 'Один JSON на строку — для RAG' },
]

export const FormatSelector = memo(function FormatSelector({
  value,
  onChange,
  disabled = false,
}: FormatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([])

  // Закрытие при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Фокус на первом элементе при открытии
  useEffect(() => {
    if (isOpen) {
      const currentIndex = formats.findIndex((f) => f.id === value)
      setTimeout(() => setFocusedIndex(currentIndex >= 0 ? currentIndex : 0), 0)
    }
  }, [isOpen, value])

  // Фокус на элементе
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.focus()
    }
  }, [isOpen, focusedIndex])

  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault()
        setIsOpen(true)
        break
      case 'ArrowUp':
        e.preventDefault()
        setIsOpen(true)
        setFocusedIndex(formats.length - 1)
        break
    }
  }, [])

  const handleOptionKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) => (prev + 1) % formats.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) => (prev - 1 + formats.length) % formats.length)
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          onChange(formats[index].id)
          setIsOpen(false)
          triggerRef.current?.focus()
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          triggerRef.current?.focus()
          break
        case 'Tab':
          setIsOpen(false)
          break
      }
    },
    [onChange],
  )

  const handleSelect = useCallback(
    (format: Format) => {
      onChange(format)
      setIsOpen(false)
      triggerRef.current?.focus()
    },
    [onChange],
  )

  const selectedFormat = formats.find((f) => f.id === value)!

  return (
    <div style={styles.container} ref={containerRef}>
      <span style={styles.label} id="format-label">
        Формат
      </span>
      <div style={styles.dropdownContainer}>
        <button
          ref={triggerRef}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleTriggerKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby="format-label"
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
            aria-hidden="true"
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
          <div
            style={styles.dropdown}
            role="listbox"
            aria-labelledby="format-label"
            aria-activedescendant={`format-option-${formats[focusedIndex]?.id}`}
          >
            {formats.map((format, index) => (
              <button
                key={format.id}
                ref={(el) => {
                  optionsRef.current[index] = el
                }}
                id={`format-option-${format.id}`}
                onClick={() => handleSelect(format.id)}
                onKeyDown={(e) => handleOptionKeyDown(e, index)}
                role="option"
                aria-selected={value === format.id}
                tabIndex={focusedIndex === index ? 0 : -1}
                style={{
                  ...styles.option,
                  ...(value === format.id ? styles.optionActive : {}),
                  ...(focusedIndex === index ? styles.optionFocused : {}),
                }}
              >
                <span style={styles.optionLabel}>{format.label}</span>
                <span style={styles.optionDescription}>{format.description}</span>
                {value === format.id && (
                  <span style={styles.checkmark} aria-hidden="true">
                    ✓
                  </span>
                )}
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
    padding: '10px 14px', // Увеличено для мобильных
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    minWidth: '90px',
    minHeight: '44px', // Минимум для тапа
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
    minWidth: '240px',
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
    padding: '12px 14px', // Увеличено
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background var(--transition-fast)',
    position: 'relative',
    outline: 'none',
  },
  optionActive: {
    background: 'var(--accent-green-glow)',
  },
  optionFocused: {
    background: 'var(--bg-tertiary)',
    outline: '2px solid var(--accent-green)',
    outlineOffset: '-2px',
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
    paddingRight: '20px', // Место для галочки
  },
  checkmark: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--accent-green)',
    fontSize: '14px',
    fontWeight: 'bold',
  },
}
