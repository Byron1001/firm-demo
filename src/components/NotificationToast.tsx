import { useState, useEffect } from 'react'
import { useTranslations } from '../i18n'

interface Props { locale?: string }

export default function NotificationToast({ locale = 'en' }: Props) {
  const t = useTranslations(locale)
  const messages = t.notification.messages.map((m: { title: string; text: string }, i: number) => ({
    emoji: ['🎉', '💡', '✨'][i] || '🎉',
    title: m.title,
    text: m.text,
  }))
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [msg, setMsg] = useState<typeof messages[0] | null>(null)

  useEffect(() => {
    const seen = sessionStorage.getItem('ntf-seen')
    if (seen) return

    const hero = document.getElementById('home')
    const heroH = hero?.offsetHeight ?? window.innerHeight
    let triggered = false
    const checkScroll = (e?: Event) => {
      const y = e ? (e as CustomEvent).detail.scroll : 0
      if (!triggered && y > heroH * 0.6) {
        triggered = true
        setMsg(messages[Math.floor(Math.random() * messages.length)])
        setVisible(true)
        window.removeEventListener('lenis-scroll', checkScroll as EventListener)
      }
    }

    const timer = setTimeout(() => checkScroll(), 6000)
    window.addEventListener('lenis-scroll', checkScroll as EventListener, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('lenis-scroll', checkScroll as EventListener)
    }
  }, [])

  const handleClose = () => {
    setVisible(false)
    setDismissed(true)
    sessionStorage.setItem('ntf-seen', '1')
  }

  const handleAction = () => {
    setVisible(false)
    setDismissed(true)
    sessionStorage.setItem('ntf-seen', '1')
    window.open('https://wa.me/60123456790', '_blank')
  }

  if (dismissed || !msg) return null

  return (
    <>
      <div
        className={`fixed bottom-28 sm:bottom-32 right-4 sm:right-6 z-[60] max-w-[360px] w-[calc(100%-2rem)] sm:w-auto bg-surface border border-white/10 rounded-2xl shadow-2xl shadow-black/40 transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors cursor-pointer border-none bg-transparent"
          aria-label={t.notification.close}
        >
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-5 pr-8">
           <div className="text-2xl mb-2">{msg.emoji}</div>
           <h4 className="font-heading text-sm font-bold text-primary mb-1">{msg.title}</h4>
           <p className="text-xs text-text-light/70 leading-relaxed">{msg.text}</p>
           <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleAction}
               className="text-xs font-semibold bg-[#25D366] text-white px-4 py-2 rounded-full hover:brightness-110 transition-all cursor-pointer border-none"
            >
              {t.notification.cta}
            </button>
            <button
              onClick={handleClose}
               className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer bg-transparent border-none"
            >
              {t.notification.dismiss}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
