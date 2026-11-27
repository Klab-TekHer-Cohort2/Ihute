import { isAxiosError } from 'axios'
import { api } from '@/lib/api'

/** What our backend returns from /assistant/ask and /assistant/diagnose (IHUTE RAG answer). */
export interface AssistantAnswer {
  answer: string
  answer_en?: string | null
  answer_mode?: 'english' | 'english_notice' | 'machine_translation' | 'fixed_message' | string | null
  machine_translated: boolean
  sources: { ref: string; document: string; page?: number; crop?: string }[]
  sufficient?: boolean | null
  served_from?: 'live' | 'cache' | string | null
  classifier?: { label: string; confidence?: number; disease?: string; diagnosis_uncertain?: boolean; note?: string } | null
  question_used?: string | null
}

export type ReplyLanguage = 'en' | 'rw'

// IHUTE answers take 20-60 s (up to ~2 min after a Colab restart); the backend waits 120 s.
const TIMEOUT = 150_000

export const replyLanguage = (lng: string): ReplyLanguage => (lng.startsWith('rw') ? 'rw' : 'en')

export async function askAssistant(question: string, reply_language: ReplyLanguage) {
  const { data } = await api.post<AssistantAnswer>('/assistant/ask', { question, reply_language }, { timeout: TIMEOUT })
  return data
}

export async function diagnoseAssistant(body: {
  disease_label: string
  confidence?: number
  reply_language: ReplyLanguage
  crop?: string
}) {
  const { data } = await api.post<AssistantAnswer>('/assistant/diagnose', body, { timeout: TIMEOUT })
  return data
}

export async function assistantHealth() {
  const { data } = await api.get<{ status: string }>('/assistant/health', { timeout: 20_000 })
  return data
}

/** i18n key for a friendly error message. */
export function assistantErrorKey(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status
    if (status === 503) return 'farmer.assistant.errors.starting'
    if (status === 502 || status === 504 || !err.response) return 'farmer.assistant.errors.unreachable'
  }
  return 'farmer.assistant.errors.generic'
}
