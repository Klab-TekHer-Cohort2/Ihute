import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInput } from '@/components/ui/Field'

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  return (
    <TextInput
      {...props}
      icon={Lock}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={t(visible ? 'auth.hidePassword' : 'auth.showPassword')}
          aria-pressed={visible}
          className="grid size-9 place-items-center rounded-lg text-forest-600 hover:bg-brand-50"
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      }
    />
  )
}
