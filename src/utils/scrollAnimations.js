import Lenis from 'lenis'

let lenisInstance = null
let lenisRafId = null

export function initLenis() {
  if (lenisInstance) return lenisInstance

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  lenisInstance = new Lenis({
    duration: prefersReduced ? 0 : 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  })

  function raf(time) {
    lenisInstance.raf(time)
    lenisRafId = requestAnimationFrame(raf)
  }
  lenisRafId = requestAnimationFrame(raf)

  return lenisInstance
}

export function destroyLenis() {
  if (lenisRafId) cancelAnimationFrame(lenisRafId)
  lenisInstance?.destroy()
  lenisInstance = null
  lenisRafId = null
}

export function scrollToTop(duration = 1.2) {
  if (lenisInstance) lenisInstance.scrollTo(0, { duration })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function initScrollReveal() {
  const els = document.querySelectorAll('.reveal:not([data-scroll-observer])')
  if (!els.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )
  els.forEach((el) => {
    el.setAttribute('data-scroll-observer', '')
    observer.observe(el)
  })
}

export function initCountUp() {
  const els = document.querySelectorAll('.count-up:not([data-countup-observer])')
  if (!els.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target
        const target = parseInt(el.getAttribute('data-target')) || 0
        const suffix = el.getAttribute('data-suffix') || ''
        const prefix = el.getAttribute('data-prefix') || ''
        const duration = parseInt(el.getAttribute('data-duration')) || 1500
        const start = performance.now()

        function animate(now) {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          const current = Math.round(target * eased)
          el.textContent = prefix + current.toLocaleString() + suffix
          if (progress < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
        observer.unobserve(el)
      })
    },
    { threshold: 0.3 }
  )
  els.forEach((el) => {
    el.setAttribute('data-countup-observer', '')
    observer.observe(el)
  })
}

export function initClipReveal() {
  const els = document.querySelectorAll('.clip-reveal:not([data-clip-observer])')
  if (!els.length) return

  els.forEach((el) => el.setAttribute('data-clip-observer', ''))

  function checkVisibility() {
    const vh = window.innerHeight
    document.querySelectorAll('.clip-reveal:not(.clip-revealed)').forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < vh * 0.85 && rect.bottom > 0) {
        el.classList.add('clip-revealed')
      }
    })
  }

  checkVisibility()
  window.addEventListener('scroll', checkVisibility, { passive: true })
}

export function initStaggerReveal() {
  const wrappers = document.querySelectorAll('.stagger-reveal:not([data-stagger-observer])')
  if (!wrappers.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const items = entry.target.children
        Array.from(items).forEach((item, i) => {
          item.style.transitionDelay = `${i * 0.08}s`
          item.classList.add('revealed')
        })
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.1 }
  )
  wrappers.forEach((el) => {
    el.setAttribute('data-stagger-observer', '')
    observer.observe(el)
  })
}

export function initMouseParallax() {
  const cards = document.querySelectorAll('[data-tilt]:not([data-tilt-initialized])')
  if (!cards.length) return

  cards.forEach((card) => {
    card.setAttribute('data-tilt-initialized', '')
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${y * -6}deg)`
    })
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)'
    })
  })
}

export function initVideoParallax() {
  const els = document.querySelectorAll('[data-parallax-video]:not([data-video-parallax-init])')
  if (!els.length) return

  els.forEach((el) => el.setAttribute('data-video-parallax-init', ''))

  function update() {
    const vh = window.innerHeight
    const vCenter = vh / 2
    document.querySelectorAll('[data-parallax-video]').forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-parallax-video')) || 0.15
      const rect = el.getBoundingClientRect()
      const elCenter = rect.top + rect.height / 2
      const offset = (elCenter - vCenter) * speed * -0.4
      el.style.transform = `translate3d(0, ${offset}px, 0)`
    })
  }

  if (lenisInstance) {
    lenisInstance.on('scroll', update)
  } else {
    let ticking = false
    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(() => { update(); ticking = false })
        ticking = true
      }
    }
    window.addEventListener('scroll', handler, { passive: true })
  }

  update()
}

export function initStackReveal() {
  const container = document.querySelector('.stack-spacer')
  const cards = document.querySelectorAll('.stack-card')
  if (!container || !cards.length) return

  function update() {
    const rect = container.getBoundingClientRect()
    const vh = window.innerHeight
    const total = rect.height - vh
    const progress = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0

    cards.forEach((card, i) => {
      const threshold = (i + 0.5) / cards.length
      card.classList.toggle('revealed', progress >= threshold)
    })
  }

  update()
  window.addEventListener('scroll', update, { passive: true })
}

export function initBarReveal() {
  const els = document.querySelectorAll('.bar-reveal:not([data-bar-observer])')
  if (!els.length) return

  els.forEach((el) => el.setAttribute('data-bar-observer', ''))

  function checkVisibility() {
    const vh = window.innerHeight
    document.querySelectorAll('.bar-reveal:not(.bar-revealed)').forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < vh * 0.85 && rect.bottom > 0) {
        el.classList.add('bar-revealed')
      }
    })
  }

  checkVisibility()
  window.addEventListener('scroll', checkVisibility, { passive: true })
}

export function initVideoObserver() {
  const videos = document.querySelectorAll('video[data-observe-video]:not([data-video-observer-init])')
  if (!videos.length) return

  videos.forEach((v) => v.setAttribute('data-video-observer-init', ''))

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = /** @type {HTMLVideoElement} */ (entry.target)
        if (entry.isIntersecting) {
          if (video.paused && video.readyState >= 2) video.play().catch(() => {})
        } else {
          if (!video.paused) video.pause()
        }
      })
    },
    { threshold: 0.15 }
  )
  videos.forEach((v) => observer.observe(v))
}

export function destroyAll() {
  destroyLenis()
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function initAll() {
  initLenis()

  initVideoObserver()

  if (prefersReducedMotion()) return

  initScrollReveal()
  initStackReveal()
  initCountUp()
  initClipReveal()
  initBarReveal()
  initStaggerReveal()
  initMouseParallax()
  initVideoParallax()
}
