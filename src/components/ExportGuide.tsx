import { memo, useState, useCallback } from 'react'
import { Source } from './SourceDropdown'

interface ExportGuideProps {
  source: Source
  isOpen: boolean
  onClose: () => void
}

interface PlatformGuide {
  title: string
  icon: string
  color: string
  fileFormat: string
  steps: string[]
  notes?: string[]
}

const guides: Record<Source, PlatformGuide> = {
  telegram: {
    title: 'Telegram',
    icon: '✈️',
    color: 'var(--telegram-color)',
    fileFormat: 'result.json',
    steps: [
      'Откройте чат в Telegram Desktop',
      'Нажмите ⋮ (три точки) → Export chat history',
      'Снимите галочки с Media, Voice messages и т.д.',
      'Формат: JSON (Machine-readable JSON)',
      'Нажмите Export и дождитесь завершения',
      'Загрузите файл result.json',
    ],
    notes: [
      'Экспорт доступен только в Telegram Desktop',
      'Мобильное приложение не поддерживает экспорт',
    ],
  },
  whatsapp: {
    title: 'WhatsApp',
    icon: '💬',
    color: 'var(--whatsapp-color)',
    fileFormat: '_chat.txt',
    steps: [
      'Откройте чат в WhatsApp',
      'Нажмите ⋮ → More → Export chat',
      'Выберите "Without Media"',
      'Сохраните или отправьте себе файл',
      'Загрузите полученный .txt файл',
    ],
    notes: [
      'Формат даты зависит от региональных настроек телефона',
      'Экспорт доступен на iOS и Android',
    ],
  },
  instagram: {
    title: 'Instagram',
    icon: '📷',
    color: 'var(--instagram-color)',
    fileFormat: 'message_1.json',
    steps: [
      'Откройте instagram.com в браузере',
      'Settings → Your Activity → Download your information',
      'Выберите "Some of your information"',
      'Отметьте только "Messages"',
      'Формат: JSON, Date range: All time',
      'Нажмите "Create files" и дождитесь email',
      'Скачайте архив и распакуйте',
      'Найдите messages/inbox/[chat]/message_1.json',
    ],
    notes: [
      'Запрос может обрабатываться до 48 часов',
      'Архив приходит на email',
    ],
  },
  discord: {
    title: 'Discord',
    icon: '🎮',
    color: 'var(--discord-color)',
    fileFormat: 'messages.json',
    steps: [
      'Откройте discord.com в браузере',
      'User Settings → Privacy & Safety',
      'Scroll down to "Request all of my Data"',
      'Нажмите Request Data',
      'Дождитесь email с ссылкой на скачивание',
      'Распакуйте архив',
      'Найдите messages/[channel_id]/messages.json',
    ],
    notes: [
      'Запрос обрабатывается до 30 дней',
      'Для DM используйте сторонние инструменты',
    ],
  },
}

export const ExportGuide = memo(function ExportGuide({
  source,
  isOpen,
  onClose,
}: ExportGuideProps) {
  const guide = guides[source]

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      style={styles.backdrop}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-guide-title"
    >
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.titleRow}>
            <span style={styles.icon}>{guide.icon}</span>
            <h2 id="export-guide-title" style={{ ...styles.title, color: guide.color }}>
              Как экспортировать из {guide.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.fileFormat}>
            <span style={styles.fileFormatLabel}>Нужный файл:</span>
            <code style={styles.fileFormatValue}>{guide.fileFormat}</code>
          </div>

          <ol style={styles.steps}>
            {guide.steps.map((step, index) => (
              <li key={index} style={styles.step}>
                <span style={styles.stepNumber}>{index + 1}</span>
                <span style={styles.stepText}>{step}</span>
              </li>
            ))}
          </ol>

          {guide.notes && (
            <div style={styles.notes}>
              <span style={styles.notesTitle}>💡 Примечания:</span>
              <ul style={styles.notesList}>
                {guide.notes.map((note, index) => (
                  <li key={index} style={styles.note}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.doneButton}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  )
})

// Кнопка-триггер для открытия гайда
interface ExportGuideButtonProps {
  source: Source
}

export const ExportGuideButton = memo(function ExportGuideButton({
  source,
}: ExportGuideButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={styles.helpButton}
        aria-label={`Как экспортировать из ${guides[source].title}`}
        title="Как экспортировать?"
      >
        <span style={styles.helpIcon}>?</span>
        <span style={styles.helpText}>Как экспортировать?</span>
      </button>
      <ExportGuide
        source={source}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
})

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 1000,
    animation: 'fadeIn 150ms ease',
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
    maxHeight: '80vh',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp 200ms ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  icon: {
    fontSize: '24px',
  },
  title: {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    fontWeight: 600,
    margin: 0,
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all var(--transition-fast)',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
  },
  fileFormat: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '20px',
  },
  fileFormatLabel: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  fileFormatValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--accent-green)',
    background: 'var(--accent-green-glow)',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
  },
  steps: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-default)',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    flexShrink: 0,
  },
  stepText: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    lineHeight: 1.5,
    paddingTop: '2px',
  },
  notes: {
    marginTop: '20px',
    padding: '12px 16px',
    background: 'rgba(234, 179, 8, 0.1)',
    border: '1px solid rgba(234, 179, 8, 0.3)',
    borderRadius: 'var(--radius-md)',
  },
  notesTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--accent-yellow)',
    display: 'block',
    marginBottom: '8px',
  },
  notesList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  note: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    paddingLeft: '16px',
    position: 'relative',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  doneButton: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 600,
    padding: '10px 24px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-green)',
    color: 'var(--bg-primary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  helpButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    padding: '6px 12px',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  helpIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: 'var(--bg-tertiary)',
    fontSize: '10px',
    fontWeight: 700,
  },
  helpText: {
    // Скрываем на мобильных
  },
}
