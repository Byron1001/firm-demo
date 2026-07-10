import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenisInstance = null
let lenisRafId = null

export function initLenis() {
  if (lenisInstance) return lenisInstance

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  lenisInstance = new Lenis({
    duration: prefersReduced ? 0 : 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    wheelMultiplier: 1.5,
    touchMultiplier: 1.5,
  })

  lenisInstance.on('scroll', (e) => {
    ScrollTrigger.update()
    window.dispatchEvent(new CustomEvent('lenis-scroll', { detail: e }))
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
  const els = document.querySelectorAll('.reveal:not([data-gsap-init])')
  if (!els.length) return

  els.forEach((el) => {
    el.setAttribute('data-gsap-init', '')
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top 15%',
          scrub: true,
        },
      }
    )
  })
}

export function initClipReveal() {
  const els = document.querySelectorAll('.clip-reveal:not([data-gsap-clip])')
  if (!els.length) return

  els.forEach((el) => {
    el.setAttribute('data-gsap-clip', '')
    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top 15%',
          scrub: true,
        },
      }
    )
  })
}

export function initBarReveal() {
  const els = document.querySelectorAll('.bar-reveal:not([data-gsap-bar])')
  if (!els.length) return

  els.forEach((el) => {
    el.setAttribute('data-gsap-bar', '')
    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          end: 'top 25%',
          scrub: true,
        },
      }
    )
  })
}

export function initStaggerReveal() {
  const wrappers = document.querySelectorAll('.stagger-reveal:not([data-gsap-stagger])')
  if (!wrappers.length) return

  wrappers.forEach((wrapper) => {
    wrapper.setAttribute('data-gsap-stagger', '')
    const items = Array.from(wrapper.children)
    if (!items.length) return

    gsap.fromTo(items,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 80%',
          end: 'top 15%',
          scrub: true,
        },
      }
    )
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

export function initMouseParallax() {
  const cards = document.querySelectorAll('[data-tilt]:not([data-tilt-initialized])')
  if (!cards.length) return

  cards.forEach((card) => {
    card.setAttribute('data-tilt-initialized', '')
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      gsap.to(card, {
        rotationY: x * 6,
        rotationX: y * -6,
        duration: 0.6,
        ease: 'power2.out',
        transformPerspective: 800,
        overwrite: 'auto',
      })
    })
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    })
  })
}

export function initVideoParallax() {
  const els = document.querySelectorAll('[data-parallax-video]:not([data-video-parallax-init])')
  if (!els.length) return

  els.forEach((el) => {
    el.setAttribute('data-video-parallax-init', '')
    const speed = parseFloat(el.getAttribute('data-parallax-video')) || 0.15
    gsap.to(el, {
      y: () => el.offsetHeight * speed * -0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  })
}

export function initMagneticButtons() {
  const buttons = document.querySelectorAll('[data-magnetic]:not([data-magnetic-init])')
  if (!buttons.length) return

  buttons.forEach((btn) => {
    btn.setAttribute('data-magnetic-init', '')

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25
      const y = (e.clientY - rect.top - rect.height / 2) * 0.25
      gsap.to(btn, {
        x, y,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    })

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0, y: 0,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    })
  })
}

export function initHeroParallax() {
  const hero = document.getElementById('home')
  if (!hero) return

  const heroContent = document.getElementById('hero-content')
  const heroOverlay = document.getElementById('hero-overlay')

  if (heroContent) {
    gsap.fromTo(heroContent,
      { opacity: 1, y: 0, scale: 1 },
      {
        opacity: 0, y: 60, scale: 0.96,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      }
    )
  }

  if (heroOverlay) {
    gsap.fromTo(heroOverlay,
      { opacity: 0 },
      {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      }
    )
  }
}

export function initStackReveal() {
  const container = document.querySelector('.stack-spacer')
  const cards = document.querySelectorAll('.stack-card')
  if (!container || !cards.length) return

  cards.forEach((card, i) => {
    const spin = (card.style.getPropertyValue('--spin') || '0deg').trim()
    gsap.fromTo(card,
      { opacity: 0, rotateZ: 20 },
      {
        opacity: 1, rotateZ: spin,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: `top ${85 - i * 8}%`,
          end: `top ${75 - i * 8}%`,
          scrub: true,
        },
      }
    )
  })
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
  ScrollTrigger.getAll().forEach((t) => t.kill())
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
  initMagneticButtons()
  initHeroParallax()
}
