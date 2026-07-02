import { useEffect, useRef, useCallback } from 'react';

interface Service {
  num: string; title: string; desc: string; img: string; video?: string; slug: string;
}

interface Props { services: Service[] }

export default function ExpertiseCards({ services }: Props) {
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<'entering' | 'entered'>('entering');
  const total = services.length;

  const tick = useCallback(() => {
    const container = containerRef.current;
    if (!container) { rafRef.current = requestAnimationFrame(tick); return; }

    const viewH = window.innerHeight;
    const rect = container.getBoundingClientRect();
    const progress = -rect.top / (total * viewH);
    const clamped = Math.max(0, Math.min(1, progress));

    const inView = phaseRef.current === 'entering' ? false : (clamped > 0.015 && clamped < 1);
    const frontIndex = Math.round(clamped * (total - 1));

    for (let i = 0; i < total; i++) {
      const card = container.children[i] as HTMLElement;
      if (!card) continue;

      if (!inView || i !== frontIndex) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.zIndex = '0';
        continue;
      }

      card.style.transform = 'none';
      card.style.opacity = '1';
      card.style.zIndex = '100';
      card.style.pointerEvents = 'auto';

      const localProgress = clamped * (total - 1) - frontIndex;
      const parallaxY = Math.sin(localProgress * Math.PI) * (-20);

      const video = card.querySelector('video');
      if (video) {
        const dur = video.duration || 0;
        if (dur > 0) {
          const target = clamped * dur;
          if (Math.abs(video.currentTime - target) > 0.15) {
            video.currentTime = target;
          }
        }
        video.style.transform = `translateY(${parallaxY}px)`;
      } else {
        const img = card.querySelector('img');
        if (img) {
          img.style.filter = `brightness(${0.85 + clamped * 0.15})`;
          img.style.transform = `translateY(${parallaxY}px) scale(${1 + clamped * 0.03})`;
        }
      }
    }

    const heading = document.getElementById('expertise-heading');
    if (heading) {
      heading.style.pointerEvents = 'none';
      if (phaseRef.current === 'entered') {
        const containerTop = rect.top;
        const headingVisible = containerTop < viewH && containerTop > -viewH * 0.2;
        let hOpacity;
        if (headingVisible && clamped < 0.08) hOpacity = 1;
        else if (clamped < 0.025) hOpacity = clamped / 0.025;
        else if (clamped < 0.08) hOpacity = 1;
        else hOpacity = Math.max(0, 1 - (clamped - 0.08) / 0.045);
        heading.style.opacity = String(hOpacity);
        heading.style.visibility = hOpacity > 0 ? 'visible' : 'hidden';
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [total]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);

    const timer = setTimeout(() => {
      phaseRef.current = 'entered';
    }, 900);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timer);
    };
  }, [tick]);

  return (
    <div ref={containerRef} style={{ height: `${total * 100}vh` }}>
      {services.map((s, i) => (
        <div key={s.slug} id={`service-${s.slug}`}
          className="fixed inset-0 bg-surface overflow-hidden will-change-transform flex items-center"
         style={{ opacity: 0, zIndex: 0, pointerEvents: 'none' }}
        >
          <div className={`max-w-[1440px] mx-auto px-6 lg:px-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:[&>:last-child]:order-first' : ''}`}>
            <div className="relative z-10">
              <span className="text-accent font-heading text-lg font-semibold tracking-[0.15em] mb-4 block">
                {s.num}
              </span>
              <h3 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-primary mb-6">
                {s.title}
              </h3>
              <p className="text-primary text-[1.05rem] leading-relaxed mb-8 max-w-[480px]">
                {s.desc}
              </p>
              <a
                href={`/services/${s.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors group"
              >
                Learn more
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>
            </div>
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[70vh] overflow-hidden rounded-2xl transition-transform duration-700 hover:scale-105 will-change-transform">
              {s.video ? (
                <video muted playsInline preload="auto"
                  className="absolute inset-0 w-full h-full object-cover will-change-transform"
                  poster={s.img} data-observe-video
                >
                  <source src={s.video} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={s.img}
                  alt={s.title}
                  className="w-full h-full object-cover will-change-transform"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              )}
            </div>
          </div>
        </div>
      ))}

      <div id="expertise-heading"
        className="fixed inset-0 z-[200] bg-surface flex items-center pointer-events-none"
        style={{ opacity: 0, visibility: 'hidden' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 w-full">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-px bg-accent" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">What We Do</span>
          </div>
          <h2 className="font-heading text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-primary">
            Our Expertise
          </h2>
        </div>
      </div>
    </div>
  );
}
