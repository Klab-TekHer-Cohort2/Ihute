import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AssistantAnswer } from '@/lib/assistant'

/** Shows an IHUTE answer exactly as returned (line breaks kept; it already ends with the sources). */
export function AssistantAnswerText({ data }: { data: AssistantAnswer }) {
  const { t } = useTranslation()
  const [showEn, setShowEn] = useState(false)
  const canShowEn = data.answer_mode === 'machine_translation' && !!data.answer_en

  return (
    <div>
      <p className="whitespace-pre-line">{showEn && canShowEn ? data.answer_en : data.answer}</p>
      {canShowEn && (
        <button
          type="button"
          onClick={() => setShowEn((v) => !v)}
          aria-pressed={showEn}
          className="mt-3 text-sm font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
        >
          {t(showEn ? 'farmer.assistant.showTranslation' : 'farmer.assistant.showEnglish')}
        </button>
      )}
    </div>
  )
}
