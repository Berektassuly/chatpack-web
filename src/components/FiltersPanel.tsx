import { memo, useState } from 'react'

export interface Filters {
  sender: string
  dateFrom: string
  dateTo: string
}

interface FiltersPanelProps {
  value: Filters
  onChange: (filters: Filters) => void
  disabled?: boolean
}

export const FiltersPanel = memo(function FiltersPanel({
  value,
  onChange,
  disabled = false,
}: FiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const active = hasFilters(value)

  const update = (key: keyof Filters, fieldValue: string) => {
    onChange({
      ...value,
      [key]: fieldValue,
    })
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>FILTERS</span>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-controls="filters-panel-content"
          style={{
            ...styles.statusButton,
            ...(isOpen ? styles.statusButtonOpen : {}),
            ...(active ? styles.statusButtonActive : {}),
            ...(disabled ? styles.statusButtonDisabled : {}),
          }}
        >
          <span>{active ? 'Active' : 'Optional'}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms ease',
            }}
            aria-hidden="true"
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
      </div>

      <div
        id="filters-panel-content"
        style={{
          ...styles.content,
          ...(isOpen ? styles.contentOpen : {}),
        }}
        aria-hidden={!isOpen}
      >
        <div style={styles.grid}>
          <label style={styles.field}>
            <span style={styles.label}>Sender</span>
            <input
              type="text"
              autoComplete="off"
              value={value.sender}
              onChange={(event) => update('sender', event.target.value)}
              placeholder="Alice"
              disabled={disabled}
              tabIndex={isOpen ? 0 : -1}
              style={{
                ...styles.input,
                ...(disabled ? styles.inputDisabled : {}),
              }}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>From date</span>
            <input
              type="date"
              value={value.dateFrom}
              onChange={(event) => update('dateFrom', event.target.value)}
              disabled={disabled}
              tabIndex={isOpen ? 0 : -1}
              style={{
                ...styles.input,
                ...(disabled ? styles.inputDisabled : {}),
              }}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>To date</span>
            <input
              type="date"
              value={value.dateTo}
              onChange={(event) => update('dateTo', event.target.value)}
              disabled={disabled}
              tabIndex={isOpen ? 0 : -1}
              style={{
                ...styles.input,
                ...(disabled ? styles.inputDisabled : {}),
              }}
            />
          </label>
        </div>
      </div>
    </div>
  )
})

function hasFilters(filters: Filters): boolean {
  return Boolean(filters.sender.trim() || filters.dateFrom || filters.dateTo)
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid var(--border-subtle)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  title: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 500,
  },
  statusButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '40px',
    padding: '8px 12px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'border-color var(--transition-fast), color var(--transition-fast)',
  },
  statusButtonOpen: {
    borderColor: 'var(--accent-green)',
  },
  statusButtonActive: {
    color: 'var(--accent-green)',
  },
  statusButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  content: {
    maxHeight: 0,
    opacity: 0,
    overflow: 'hidden',
    transform: 'translateY(-4px)',
    transition:
      'max-height var(--transition-default), opacity var(--transition-fast), transform var(--transition-default)',
  },
  contentOpen: {
    maxHeight: '360px',
    opacity: 1,
    transform: 'translateY(0)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    paddingTop: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    minHeight: '44px',
    padding: '10px 12px',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    transition: 'border-color var(--transition-fast), background var(--transition-fast)',
  },
  inputDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}
