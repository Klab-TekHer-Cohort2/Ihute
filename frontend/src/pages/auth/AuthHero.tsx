import { BellRing, Bug, Mic, ShieldCheck, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/Logo'

const FEATURES: { key: string; icon: LucideIcon }[] = [
  { key: 'pest', icon: Bug },
  { key: 'voice', icon: Mic },
  { key: 'officer', icon: ShieldCheck },
  { key: 'alerts', icon: BellRing },
]

/** Left-hand brand panel of the sign-in / register page. */
export function AuthHero() {
  const { t } = useTranslation()

  return (
    <section className="relative flex flex-col overflow-hidden bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 px-6 py-8 text-white sm:px-10 lg:py-12">
      {/* soft light in the top-left corner, as in the design */}
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <Logo tone="light" subtitle={t('app.subtitle')} />
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100 ring-1 ring-white/15">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-harvest-400 opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-harvest-400" />
          </span>
          {t('auth.hero.live')}
        </span>
      </div>

      <div className="relative mt-10 lg:mt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-harvest-400">{t('auth.hero.eyebrow')}</p>
        <h1 className="mt-3 max-w-md text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.75rem]">
          {t('auth.hero.title')}
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-brand-100/85">{t('auth.hero.body')}</p>
      </div>

      <figure className="relative mt-8 hidden overflow-hidden rounded-2xl ring-1 ring-white/10 sm:block">
        <img
          src="/images/hero/auth.jpg"
          alt=""
          width={1200}
          height={540}
          className="block aspect-[20/9] w-full object-cover"
        />
        {/* green tint so the photo sits in the brand palette, as in the design */}
        <div className="absolute inset-0 bg-forest-900/35 mix-blend-multiply" />
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/80 to-transparent px-4 pb-3 pt-10 font-semibold">
          <span className="block">{t('auth.hero.imageCaption')}</span>
          <a
            href="https://commons.wikimedia.org/wiki/File:2013-06-05_12-03-37_Rwanda_Western_Province_-_Gaseke_6h_(cropped_2).jpg"
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 block text-[11px] font-normal text-white/60 hover:text-white/90"
          >
            Gaseke, Western Province · Hansueli Krapf, CC BY-SA 3.0
          </a>
        </figcaption>
      </figure>

      <ul className="relative mt-8 hidden gap-3 sm:grid sm:grid-cols-2">
        {FEATURES.map(({ key, icon: Icon }) => (
          <li key={key} className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 transition hover:bg-white/[0.11]">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-200/15 text-brand-200">
              <Icon className="size-[18px]" />
            </span>
            <h2 className="mt-3 font-semibold">{t(`auth.features.${key}.title`)}</h2>
            <p className="mt-1 text-[13px] leading-snug text-brand-100/75">{t(`auth.features.${key}.body`)}</p>
          </li>
        ))}
      </ul>

      <p className="relative mt-auto hidden pt-10 text-xs text-brand-100/60 sm:block">{t('auth.hero.partnership')}</p>
    </section>
  )
}
