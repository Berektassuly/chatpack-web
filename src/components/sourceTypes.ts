export type Source = 'telegram' | 'whatsapp' | 'instagram' | 'discord'

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
