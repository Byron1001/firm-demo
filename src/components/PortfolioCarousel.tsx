import { useState, useEffect, useRef, useCallback } from 'react';
import SpotlightCard from './SpotlightCard';
import { useTranslations } from '../i18n';

interface Project {
  title: string; category: string; location: string; img: string; slug: string;
}

interface Props { projects: Project[]; locale?: string }

const LERP = 0.1
const MAX_DIST_FACTOR = 0.75
const SCALE_MIN = 0.85
const OPACITY_MIN = 0.35

export default function PortfolioCarousel({ projects, locale = 'en' }: Props) {
  const t = useTranslations(locale)
  const trackRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const visualRef = useRef(0);
  const targetRef = useRef(0);
  const scrollAccumRef = useRef(0);
  const indexRef = useRef(0);
  const rafRef = useRef<number>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const isDraggingRef = useRef(false);
  const isScrollingRef = useRef(false);
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const userInteractedRef = useRef(false);
  const displayIndexRef = useRef(0);
  const dragStartClientRef = useRef(0);
  const dragBaseRef = useRef(0);

  const total = projects.length;
  const slideCount = total * 2;

  const getSlideWidth = useCallback(() => {
    const el = trackRef.current?.firstElementChild as HTMLElement | null;
    return el ? el.offsetWidth + 24 : 0;
  }, []);

  const renderCards = useCallback((offset: number) => {
    const track = trackRef.current;
    if (!track) return;
    const w = getSlideWidth();
    if (!w) return;
    const center = window.innerWidth / 2;
    const maxDist = window.innerWidth * MAX_DIST_FACTOR;
    const cards = track.children;

    track.style.transform = `translateX(${offset}px)`;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      const cardCenter = i * w + offset + w / 2;
      const dist = Math.abs(cardCenter - center);
      const progress = Math.min(dist / maxDist, 1);
      card.style.transform = `scale(${1 - progress * (1 - SCALE_MIN)})`;
      card.style.opacity = String(1 - progress * (1 - OPACITY_MIN));
    }
  }, [getSlideWidth]);

  const cloneJump = useCallback(() => {
    const w = getSlideWidth();
    if (!w) return;
    const range = total * w;
    if (visualRef.current < -(slideCount - 0.5) * w) {
      visualRef.current += range;
      targetRef.current += range;
      scrollAccumRef.current += range;
      indexRef.current -= total;
    } else if (visualRef.current > 0.5 * w) {
      visualRef.current -= range;
      targetRef.current -= range;
      scrollAccumRef.current -= range;
      indexRef.current += total;
    }

    const nearest = Math.round(-visualRef.current / w);
    const nextIdx = ((nearest % total) + total) % total;
    if (nextIdx !== displayIndexRef.current) {
      displayIndexRef.current = nextIdx;
      setDisplayIndex(nextIdx);
    }
  }, [getSlideWidth, total, slideCount]);

  const snapToIndex = useCallback((idx: number) => {
    const w = getSlideWidth();
    if (!w) return;
    targetRef.current = -(idx * w);
    indexRef.current = idx;
    const nextIdx = ((idx % total) + total) % total;
    displayIndexRef.current = nextIdx;
    setDisplayIndex(nextIdx);
  }, [getSlideWidth, total]);

  const tick = useCallback(() => {
    if (!isDraggingRef.current && !isScrollingRef.current) {
      const diff = targetRef.current - visualRef.current;
      if (Math.abs(diff) > 0.5) {
        visualRef.current += diff * LERP;
      } else {
        visualRef.current = targetRef.current;
      }
    }

    cloneJump();
    renderCards(visualRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [cloneJump, renderCards]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [tick]);

  // --- Wheel ---
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (!userInteractedRef.current) {
        userInteractedRef.current = true;
        clearInterval(intervalRef.current);
      }
      isScrollingRef.current = true;
      scrollAccumRef.current -= e.deltaX * 0.35;
      visualRef.current = scrollAccumRef.current;
      targetRef.current = scrollAccumRef.current;

      clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // --- Autoplay ---
  const next = useCallback(() => {
    if (!userInteractedRef.current) {
      snapToIndex(indexRef.current + 1);
    }
  }, [snapToIndex]);

  const startAutoplay = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 4500);
  }, [next]);

  const stopAutoplay = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  // --- Drag ---
  const handlePointerDown = (clientX: number) => {
    if (!userInteractedRef.current) {
      userInteractedRef.current = true;
      clearInterval(intervalRef.current);
    }
    setIsDragging(true);
    isDraggingRef.current = true;
    dragStartClientRef.current = clientX;
    dragBaseRef.current = visualRef.current;
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const offset = clientX - dragStartClientRef.current;
    visualRef.current = dragBaseRef.current + offset;
    targetRef.current = visualRef.current;
    scrollAccumRef.current = visualRef.current;
    renderCards(visualRef.current);
    cloneJump();
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    setIsDragging(false);
    isDraggingRef.current = false;
  };

  return (
    <SpotlightCard spotlightColor="rgba(243, 138, 20, 0.12)">
    <div ref={carouselRef}
      className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={(e) => handlePointerDown(e.clientX)}
      onMouseMove={(e) => isDraggingRef.current && handlePointerMove(e.clientX)}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
      onTouchMove={(e) => isDraggingRef.current && handlePointerMove(e.touches[0].clientX)}
      onTouchEnd={handlePointerUp}
    >
      <div ref={trackRef} className="flex gap-6 will-change-transform">
        {projects.map((p, i) => (
          <a key={`orig-${i}`} href={`${import.meta.env.BASE_URL}case-study/${p.slug}`}
            className="relative w-[85vw] max-w-[720px] aspect-[4/3] overflow-hidden rounded-2xl shrink-0 bg-bg-dark will-change-transform group"
          >
            <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading={i < 2 ? 'eager' : 'lazy'} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
              <div className="flex items-center gap-3 text-accent text-xs font-semibold tracking-[0.15em] uppercase mb-2">
                <span>{p.category}</span>
                {p.location && <><span className="w-px h-3 bg-accent/50" /><span>{p.location}</span></>}
              </div>
              <h3 className="font-heading text-xl lg:text-2xl font-bold text-white mb-1">{p.title}</h3>
            </div>
            <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </a>
        ))}
        {projects.map((p, i) => (
          <a key={`clone-${i}`} href={`${import.meta.env.BASE_URL}case-study/${p.slug}`} aria-hidden="true"
            className="relative w-[85vw] max-w-[720px] aspect-[4/3] overflow-hidden rounded-2xl shrink-0 bg-bg-dark will-change-transform group"
          >
            <img src={p.img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
              <div className="flex items-center gap-3 text-accent text-xs font-semibold tracking-[0.15em] uppercase mb-2">
                <span>{p.category}</span>
                {p.location && <><span className="w-px h-3 bg-accent/50" /><span>{p.location}</span></>}
              </div>
              <h3 className="font-heading text-xl lg:text-2xl font-bold text-white mb-1">{p.title}</h3>
            </div>
          </a>
        ))}
      </div>

      <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 lg:right-16 flex items-center gap-2 sm:gap-4 z-10">
        <button onClick={(e) => { e.preventDefault(); if (!userInteractedRef.current) { userInteractedRef.current = true; clearInterval(intervalRef.current); } snapToIndex(indexRef.current - 1); }}
          className="w-11 sm:w-12 h-11 sm:h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer bg-transparent"
          aria-label={t.portfolio.prev}>
          <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" /></svg>
        </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
          {projects.map((_, i) => (
            <button key={i} onClick={(e) => { e.preventDefault(); if (!userInteractedRef.current) { userInteractedRef.current = true; clearInterval(intervalRef.current); } snapToIndex(indexRef.current - displayIndex + i); }}
              className={`w-3 sm:w-2.5 h-3 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer border-0 ${i === displayIndex ? 'bg-accent scale-125' : 'bg-white/30 hover:bg-white/50'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button onClick={(e) => { e.preventDefault(); if (!userInteractedRef.current) { userInteractedRef.current = true; clearInterval(intervalRef.current); } snapToIndex(indexRef.current + 1); }}
          className="w-11 sm:w-12 h-11 sm:h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer bg-transparent"
          aria-label={t.portfolio.next}>
          <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
        </button>
      </div>
    </div>
    </SpotlightCard>
  );
}
