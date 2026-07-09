import { useState, useEffect, useRef } from 'react';
import { ICONS } from '../icons';
import { useTranslations, type Locale } from '../i18n';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const wb = (h: string) => `${BASE}${h}`;

const isMainPage = () => window.location.pathname === BASE + '/' || window.location.pathname === BASE || window.location.pathname.endsWith('/index.html');

function scrollToHash(hash: string) {
  const id = hash.replace('#', '');
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Header({ locale = 'en' }: { locale?: Locale }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const lastScrollY = useRef(0);
  const t = useTranslations(locale);
  const otherLocale = locale === 'en' ? 'ms' : 'en';

  const navItems = [
    { label: t.nav.home, href: wb('/#home') },
    {
      label: t.nav.services,
      href: wb('/#services'),
      children: [
        { label: t.nav.services_sub.corporateEvents, href: wb('/services/corporate-events') },
        { label: t.nav.services_sub.exhibitions, href: wb('/services/exhibitions') },
        { label: t.nav.services_sub.weddingPlanning, href: wb('/services/wedding-planning') },
        { label: t.nav.services_sub.brandingDesign, href: wb('/services/branding-design') },
        { label: t.nav.services_sub.sports, href: wb('/services/sports') },
      ],
    },
    { label: t.nav.portfolio, href: wb('/#portfolio') },
    { label: t.nav.work, href: wb('/work') },
    { label: t.nav.insights, href: wb('/#insights') },
    { label: t.nav.about, href: wb('/about') },
    { label: t.nav.team, href: wb('/#team') },
    { label: t.nav.contact, href: wb('/#contact') },
  ];

  useEffect(() => {
    const onScroll = (e?: Event) => {
      const currentY = e
        ? (e as CustomEvent).detail.scroll
        : 0;
      setScrolled(currentY > 40);
      if (currentY > 100) {
        setHidden(currentY > lastScrollY.current);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('lenis-scroll', onScroll as EventListener, { passive: true });
    requestAnimationFrame(() => onScroll());
    return () => window.removeEventListener('lenis-scroll', onScroll as EventListener);
  }, []);

  useEffect(() => {
    if (menuOpen) setHidden(false);
  }, [menuOpen]);

  useEffect(() => {
    if (!isMainPage()) return;
    const ids = navItems.map(i => i.href.replace('/#', ''));
    const els = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (window.location.hash) scrollToHash(window.location.hash);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-120px 0px -40% 0px' }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [locale]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    setDropdownOpen(false);
    const hashOnly = href.includes('#');
    if (hashOnly) {
      e.preventDefault();
      if (isMainPage()) {
        scrollToHash(href.split('#')[1]);
      } else {
        window.location.href = href;
      }
    }
  };

  const handleServicesClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (menuOpen) {
      setDropdownOpen(prev => !prev);
    } else {
      setDropdownOpen(prev => !prev);
    }
    if (isMainPage()) {
      scrollToHash('#services');
    }
  };

  const isActive = (href: string) => {
    if (href === '/about') return false;
    return active === href.replace('/#', '');
  };

  return (
    <header
      style={{ top: 'var(--ann-height, 0px)' }}
      className={`fixed left-0 w-full z-50 transition-[background-color,box-shadow,padding,transform] duration-500 will-change-[transform,opacity] ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        scrolled ? 'bg-surface/90 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)] py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 flex items-center justify-between">
        <a href={wb('/')} className="flex items-center gap-2.5">
          <span className="w-9 h-9 min-w-9 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: ICONS['logo-ac'] }} />
          <span className="font-heading font-bold text-xl text-white">
            Double Brain Creative &amp; Event SDN BHD
          </span>
        </a>

        <nav
          className={`fixed inset-0 bg-surface/98 backdrop-blur-md flex flex-col items-center justify-center gap-8 transition-[transform] duration-500 z-40 lg:static lg:bg-transparent lg:backdrop-blur-none lg:flex-row lg:gap-6 lg:transform-none overflow-y-auto scrollbar-hide pt-16 lg:pt-0 ${
            menuOpen ? 'translate-y-0' : '-translate-y-full lg:translate-y-0'
          }`}
        >
          {navItems.map(item => (
            item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => !menuOpen && setDropdownOpen(true)}
                onMouseLeave={() => !menuOpen && setDropdownOpen(false)}
              >
                <button
                  onClick={handleServicesClick}
                  className={`text-lg lg:text-sm font-medium relative py-2 flex items-center gap-1.5 transition-colors duration-300 cursor-pointer bg-transparent border-none text-white/80 hover:text-accent ${
                    isActive(item.href) ? 'text-accent' : ''
                  }`}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full hidden lg:block" />
                  )}
                  <svg className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </button>
                <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-[opacity,transform] duration-200 ${dropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'}`}>
                  <div className="bg-bg-alt rounded-xl shadow-xl border border-white/10 py-2 min-w-[200px]">
                    {item.children.map(child => (
                      <a
                        key={child.href}
                        href={child.href}
                        onClick={(e) => handleClick(e, child.href)}
                        className="block px-5 py-2.5 text-sm text-white/60 hover:text-accent hover:bg-white/5 transition-colors"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className={`text-lg lg:text-sm font-medium relative py-2 transition-colors duration-300 text-white/80 hover:text-accent ${
                  isActive(item.href) ? 'text-accent' : ''
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full" />
                )}
              </a>
            )
          ))}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              const p = window.location.pathname.replace(BASE, '');
              window.location.href = BASE + (p.startsWith('/ms')
                ? (p.replace(/^\/ms/, '') || '/')
                : '/ms' + p);
            }}
            className="text-lg lg:text-sm font-medium px-5 sm:px-3 py-3 sm:py-1.5 rounded-lg border border-white/20 text-white/60 hover:text-accent hover:border-accent/50 transition-colors lg:ml-2 min-h-[44px] flex items-center"
          >
            {t.nav.lang[otherLocale]}
          </a>
          <a
            href={wb('/#contact')}
            onClick={(e) => handleClick(e, wb('/#contact'))}
            className="bg-accent text-white px-8 sm:px-6 py-3 sm:py-2.5 rounded-lg font-semibold text-sm hover:bg-accent-dark transition-[background-color,transform] hover:-translate-y-0.5 lg:ml-2 min-h-[48px]"
          >
            {t.nav.startEvent}
          </a>
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 p-3 cursor-pointer z-50 lg:hidden bg-transparent border-none"
          aria-label={t.nav.toggleMenu}
        >
          <span className={`block w-6 h-0.5 rounded transition-[transform,opacity,background-color] duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5 bg-white' : 'bg-white'}`} />
          <span className={`block w-6 h-0.5 rounded transition-[transform,opacity,background-color] duration-300 ${menuOpen ? 'opacity-0 bg-white' : 'bg-white'}`} />
          <span className={`block w-6 h-0.5 rounded transition-[transform,opacity,background-color] duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5 bg-white' : 'bg-white'}`} />
        </button>
      </div>
    </header>
  );
}
