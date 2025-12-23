import { memo } from 'react'

export interface Flags {
  timestamps: boolean
  replays: boolean
}

interface FlagsSelectorProps {
  value: Flags
  onChange: (flags: Flags) => void
  disabled?: boolean
}

const flagsList: { key: keyof Flags; label: string }[] = [
  { key: 'timestamps', label: 'Timestamps' },
  { key: 'replays', label: 'Replays' },
]

export const FlagsSelector = memo(function FlagsSelector({
  value,
  onChange,
  disabled = false,
}: FlagsSelectorProps) {
  const handleToggle = (flag: keyof Flags) => {
    onChange({
      ...value,
      [flag]: !value[flag],
    })
  }

  return (
    <div style={styles.container}>
      {flagsList.map(({ key, label }) => (
        <label
          key={key}
          style={{
            ...styles.checkbox,
            ...(disabled ? styles.checkboxDisabled : {}),
          }}
        >
          <input
            type="checkbox"
            checked={value[key]}
            onChange={() => handleToggle(key)}
            disabled={disabled}
            style={styles.input}
          />
          <span
            style={{
              ...styles.checkmark,
              ...(value[key] ? styles.checkmarkChecked : {}),
            }}
          >
            {value[key] && '✓'}
          </span>
          <span style={styles.label}>{label}</span>
        </label>
      ))}
    </div>
  )
})

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '8px 0',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkboxDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  input: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  checkmark: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-tertiary)',
    color: 'var(--accent-green)',
    fontSize: '12px',
    fontWeight: 'bold',
    transition: 'all var(--transition-fast)',
    flexShrink: 0,
  },
  checkmarkChecked: {
    background: 'var(--accent-green-glow)',
    borderColor: 'var(--accent-green)',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--text-primary)',
  },
}
