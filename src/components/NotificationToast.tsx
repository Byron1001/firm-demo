import { useState, useEffect } from 'react'

const messages = [
  { emoji: '🎉', title: 'Let\'s Create Something Amazing!', text: 'Planning an event? We\'d love to bring your vision to life.' },
  { emoji: '💡', title: 'Got an Idea?', text: 'From corporate events to weddings — let\'s make it unforgettable.' },
  { emoji: '✨', title: 'Your Dream Event Awaits', text: 'Reach out today and let\'s start planning together.' },
]

export default function NotificationToast() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [msg] = useState(() => messages[Math.floor(Math.random() * messages.length)])

  useEffect(() => {
    const seen = sessionStorage.getItem('ntf-seen')
    if (seen) return
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
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

  if (dismissed) return null

  return (
    <>
      <div
        className={`fixed bottom-24 sm:bottom-28 right-4 sm:right-6 z-50 max-w-[360px] w-[calc(100%-2rem)] sm:w-auto bg-surface border border-white/10 rounded-2xl shadow-2xl shadow-black/40 transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors cursor-pointer border-none bg-transparent"
          aria-label="Close notification"
        >
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
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
              Chat on WhatsApp
            </button>
            <button
              onClick={handleClose}
               className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer bg-transparent border-none"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
