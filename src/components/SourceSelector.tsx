import { memo } from 'react'

export type Source = 'telegram' | 'whatsapp' | 'instagram' | 'discord'

interface SourceSelectorProps {
  value: Source
  onChange: (source: Source) => void
  disabled?: boolean
}

const sources: { id: Source; label: string; shortLabel: string; color: string }[] = [
  { id: 'telegram', label: 'Telegram', shortLabel: 'TG', color: 'var(--telegram-color)' },
  { id: 'whatsapp', label: 'WhatsApp', shortLabel: 'WA', color: 'var(--whatsapp-color)' },
  { id: 'instagram', label: 'Instagram', shortLabel: 'IG', color: 'var(--instagram-color)' },
  { id: 'discord', label: 'Discord', shortLabel: 'DC', color: 'var(--discord-color)' },
]

export const SourceSelector = memo(function SourceSelector({ 
  value, 
  onChange,
  disabled = false 
}: SourceSelectorProps) {
  return (
    <div style={styles.container}>
      <span style={styles.label}>Source</span>
      <div style={styles.buttons}>
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => onChange(source.id)}
            disabled={disabled}
            title={source.label}
            style={{
              ...styles.button,
              ...(value === source.id ? {
                ...styles.buttonActive,
                borderColor: source.color,
                color: source.color,
                boxShadow: `0 0 12px ${source.color}33`,
              } : {}),
              ...(disabled ? styles.buttonDisabled : {}),
            }}
          >
            {source.shortLabel}
          </button>
        ))}
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
  buttons: {
    display: 'flex',
    gap: '6px',
  },
  button: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 600,
    padding: '8px 14px',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  buttonActive: {
    background: 'var(--bg-tertiary)',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}
