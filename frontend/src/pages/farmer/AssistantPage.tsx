import { Mic, MicOff, Send, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AssistantAnswerText } from '@/components/AssistantAnswer'
import { PageHeader } from '@/components/ui/Card'
import { askAssistant, assistantErrorKey, assistantHealth, replyLanguage, type AssistantAnswer } from '@/lib/assistant'
import { cn } from '@/lib/utils'

interface Message {
  id: number
  from: 'me' | 'bot'
  text: string
  data?: AssistantAnswer // IHUTE answer (bot only)
  error?: boolean
}

const TOPICS = ['armyworm', 'blight', 'fertilizer', 'planting'] as const

// Minimal typing for the Web Speech API (not in TS's DOM lib everywhere).
type Recognition = {
  lang: string
  interimResults: boolean
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void
  onend: () => void
  start: () => void
  stop: () => void
}
const getRecognition = (): (new () => Recognition) | undefined =>
  (window as unknown as Record<string, new () => Recognition>).SpeechRecognition ??
  (window as unknown as Record<string, new () => Recognition>).webkitSpeechRecognition

export function AssistantPage() {
  const { t, i18n } = useTranslation()
  const [messages, setMessages] = useState<Message[]>(() => [{ id: 0, from: 'bot', text: t('farmer.assistant.welcome') }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)
  const recRef = useRef<Recognition | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const SpeechRecognition = getRecognition()
  const [health, setHealth] = useState<string | null>(null)

  useEffect(() => {
    assistantHealth()
      .then((h) => setHealth(h.status))
      .catch(() => setHealth('offline'))
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, typing])

  /** Sends the question to our backend, which asks the IHUTE RAG service (20-60 s). */
  const ask = async (text: string) => {
    const q = text.trim()
    if (!q || typing) return
    setMessages((m) => [...m, { id: Date.now(), from: 'me', text: q }])
    setInput('')
    setTyping(true)
    try {
      const data = await askAssistant(q, replyLanguage(i18n.language))
      setMessages((m) => [...m, { id: Date.now() + 1, from: 'bot', text: data.answer, data }])
    } catch (err) {
      setMessages((m) => [...m, { id: Date.now() + 1, from: 'bot', text: t(assistantErrorKey(err)), error: true }])
    } finally {
      setTyping(false)
    }
  }

  const toggleMic = () => {
    if (!SpeechRecognition) return
    if (listening) return recRef.current?.stop()
    const rec = new SpeechRecognition()
    rec.lang = i18n.language === 'en' ? 'en-US' : 'rw-RW'
    rec.interimResults = false
    rec.onresult = (e) => setInput(e.results[0][0].transcript)
    rec.onend = () => setListening(false)
    recRef.current = rec
    setListening(true)
    rec.start()
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    ask(input)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <PageHeader title={t('farmer.assistant.title')} subtitle={t('farmer.assistant.subtitle')} />
      {health && (
        <p className="-mt-2 mb-3 flex items-center gap-2 text-sm text-forest-700">
          <span className={cn('size-2.5 rounded-full', health === 'ready' ? 'bg-brand-500' : health === 'offline' ? 'bg-red-500' : 'bg-harvest-400')} />
          {t(`farmer.assistant.status.${['ready', 'loading', 'offline'].includes(health) ? health : 'limited'}`)}
        </p>
      )}

      <div className="flex min-h-[50vh] flex-col gap-3 rounded-3xl bg-white p-4 sm:p-6" aria-live="polite">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-[15px] leading-relaxed',
              m.from === 'me'
                ? 'ml-auto rounded-br-md bg-brand-600 text-white'
                : m.error
                  ? 'rounded-bl-md bg-red-50 text-red-800'
                  : 'rounded-bl-md bg-brand-50 text-forest-900',
            )}
          >
            {m.data ? <AssistantAnswerText data={m.data} /> : m.text}
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-3 self-start rounded-2xl rounded-bl-md bg-brand-50 px-4 py-4" aria-label={t('farmer.assistant.typing')}>
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-2 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </span>
            <span className="text-sm text-forest-700">{t('farmer.assistant.thinking')}</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TOPICS.map((k) => (
          <button
            key={k}
            onClick={() => ask(t(`farmer.assistant.suggestions.${k}`))}
            disabled={typing}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm text-forest-800 ring-1 ring-brand-200 hover:ring-brand-400"
          >
            <Sparkles className="size-3.5 text-harvest-500" />
            {t(`farmer.assistant.suggestions.${k}`)}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="sticky bottom-24 mt-4 flex gap-2 md:bottom-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('farmer.assistant.placeholder')}
          aria-label={t('farmer.assistant.placeholder')}
          className="h-14 min-w-0 flex-1 rounded-2xl border border-brand-200 bg-white px-5 text-[15px] outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-200/60"
        />
        {SpeechRecognition && (
          <button
            type="button"
            onClick={toggleMic}
            aria-pressed={listening}
            aria-label={t(listening ? 'farmer.assistant.stopMic' : 'farmer.assistant.mic')}
            className={cn(
              'grid size-14 shrink-0 place-items-center rounded-2xl transition',
              listening ? 'bg-harvest-400 text-forest-900' : 'bg-[#f6e9d3] text-forest-900 hover:bg-[#f1dfc0]',
            )}
          >
            {listening ? <MicOff className="size-6" /> : <Mic className="size-6" />}
          </button>
        )}
        <button
          type="submit"
          disabled={!input.trim() || typing}
          aria-label={t('farmer.assistant.send')}
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  )
}
