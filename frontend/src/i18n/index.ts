import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import rw from './locales/rw.json'

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('ihute-lang') : null

// Kinyarwanda first (doc section 9.1), English as fallback
i18n.use(initReactI18next).init({
  resources: { rw: { translation: rw }, en: { translation: en } },
  lng: saved ?? 'rw',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('ihute-lang', lng)
  document.documentElement.lang = lng
})

export default i18n
