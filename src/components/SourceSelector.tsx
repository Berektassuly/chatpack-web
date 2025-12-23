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
    <div style={styles.container} role="radiogroup" aria-label="Выберите источник">
      <span style={styles.label} id="source-label">Источник</span>
      <div style={styles.buttons} aria-labelledby="source-label">
        {sources.map((source) => {
          const isActive = value === source.id
          return (
            <button
              key={source.id}
              onClick={() => onChange(source.id)}
              disabled={disabled}
              role="radio"
              aria-checked={isActive}
              aria-label={source.label}
              style={{
                ...styles.button,
                ...(isActive ? {
                  ...styles.buttonActive,
                  borderColor: source.color,
                  color: source.color,
                  boxShadow: `0 0 12px ${source.color}33`,
                } : {}),
                ...(disabled ? styles.buttonDisabled : {}),
              }}
            >
              <span style={styles.shortLabel}>{source.shortLabel}</span>
              <span style={styles.fullLabel}>{source.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
})

// Улучшенное автоопределение источника
export function detectSource(filename: string): Source | null {
  const name = filename.toLowerCase()
  
  // Telegram: result.json или файл с 'telegram' в названии
  if (name === 'result.json' || name.includes('telegram')) {
    return 'telegram'
  }
  
  // WhatsApp: _chat.txt, WhatsApp Chat - *.txt, или файл с 'whatsapp' в названии
  if (
    name.includes('whatsapp') || 
    name.endsWith('_chat.txt') ||
    name.startsWith('whatsapp chat')
  ) {
    return 'whatsapp'
  }
  
  // Instagram: message_1.json или файл с 'instagram' в названии
  // НЕ используем просто 'message' — слишком общее
  if (
    name.includes('instagram') ||
    /message_\d+\.json$/.test(name)
  ) {
    return 'instagram'
  }
  
  // Discord: messages.json (в папке с ID канала) или файл с 'discord' в названии
  if (
    name.includes('discord') ||
    (name === 'messages.json' && !name.includes('instagram'))
  ) {
    return 'discord'
  }
  
  return null
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
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
    flexWrap: 'wrap',
  },
  button: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 600,
    padding: '10px 16px',  // Увеличено для мобильных
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    minWidth: '44px',  // Минимум для тапа на мобильных (Apple HIG)
    minHeight: '44px',
  },
  buttonActive: {
    background: 'var(--bg-tertiary)',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  shortLabel: {
    display: 'inline',
  },
  fullLabel: {
    display: 'none',  // Показываем на широких экранах через CSS
  },
}
