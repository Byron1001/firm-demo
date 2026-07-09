import { useState, useEffect } from 'react'
import { useTranslations } from '../i18n'

const STORAGE_KEY = 'db-cookie-consent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

interface Props { locale?: string }

export default function CookieConsent({ locale = 'en' }: Props) {
  const t = useTranslations(locale)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      setTimeout(() => setVisible(true), 1000)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    if (typeof window.gtag !== 'undefined') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
      })
    }
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4">
      <div className="max-w-[1440px] mx-auto">
        <div className="bg-bg-alt border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <p className="text-sm text-text-light leading-relaxed flex-1 max-w-[600px]">
            {t.cookieConsent.message}
            <a href={`${import.meta.env.BASE_URL}privacy`} className="text-accent hover:underline ml-1 whitespace-nowrap">
              {t.cookieConsent.learnMore}
            </a>
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={decline}
              className="text-sm text-text-muted hover:text-primary transition-colors px-4 py-2 cursor-pointer bg-transparent border-none"
            >
              {t.cookieConsent.decline}
            </button>
            <button
              onClick={accept}
              className="text-sm font-semibold bg-accent text-primary px-5 py-2 rounded-full hover:bg-accent-dark transition-colors cursor-pointer border-none"
            >
              {t.cookieConsent.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
