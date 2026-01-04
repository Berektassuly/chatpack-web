import { memo, useState, useCallback } from 'react'
import { Source } from './sourceTypes'

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
    icon: '',
    color: 'var(--telegram-color)',
    fileFormat: 'result.json',
    steps: [
      'Open the chat in Telegram Desktop',
      'Click ⋮ (three dots) → Export chat history',
      'Uncheck Media, Voice messages, etc.',
      'Format: JSON (Machine-readable JSON)',
      'Click Export and wait for completion',
      'Upload the result.json file',
    ],
    notes: ['Export is only available in Telegram Desktop', 'Mobile app does not support export'],
  },
  whatsapp: {
    title: 'WhatsApp',
    icon: '',
    color: 'var(--whatsapp-color)',
    fileFormat: '_chat.txt',
    steps: [
      'Open the chat in WhatsApp',
      'Tap ⋮ → More → Export chat',
      'Select "Without Media"',
      'Save or send the file to yourself',
      'Upload the .txt file',
    ],
    notes: [
      'Date format depends on your phone regional settings',
      'Export is available on iOS and Android',
    ],
  },
  instagram: {
    title: 'Instagram',
    icon: '',
    color: 'var(--instagram-color)',
    fileFormat: 'message_1.json',
    steps: [
      'Open instagram.com in your browser',
      'Settings → Your Activity → Download your information',
      'Select "Some of your information"',
      'Check only "Messages"',
      'Format: JSON, Date range: All time',
      'Click "Create files" and wait for email',
      'Download and extract the archive',
      'Find messages/inbox/[chat]/message_1.json',
    ],
    notes: ['Request may take up to 48 hours to process', 'Archive will be sent to your email'],
  },
  discord: {
    title: 'Discord',
    icon: '',
    color: 'var(--discord-color)',
    fileFormat: 'messages.json',
    steps: [
      'Open discord.com in your browser',
      'User Settings → Privacy & Safety',
      'Scroll down to "Request all of my Data"',
      'Click Request Data',
      'Wait for email with download link',
      'Extract the archive',
      'Find messages/[channel_id]/messages.json',
    ],
    notes: ['Request may take up to 30 days to process', 'For DMs use third-party tools'],
  },
}

export const ExportGuide = memo(function ExportGuide({
  source,
  isOpen,
  onClose,
}: ExportGuideProps) {
  const guide = guides[source]

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

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
              How to export from {guide.title}
            </h2>
          </div>
          <button onClick={onClose} style={styles.closeButton} aria-label="Close">
            ✕
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.fileFormat}>
            <span style={styles.fileFormatLabel}>Required file:</span>
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
              <span style={styles.notesTitle}>💡 Notes:</span>
              <ul style={styles.notesList}>
                {guide.notes.map((note, index) => (
                  <li key={index} style={styles.note}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.doneButton}>
            Got it
          </button>
        </div>
      </div>
    </div>
  )
})

// Trigger button to open the guide
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
        aria-label={`How to export from ${guides[source].title}`}
        title="How to export?"
      >
        <span style={styles.helpIcon}>?</span>
        <span style={styles.helpText}>How to export?</span>
      </button>
      <ExportGuide source={source} isOpen={isOpen} onClose={() => setIsOpen(false)} />
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
    // Hidden on mobile
  },
}
