import { useState, useEffect, useRef } from 'react';
import { ICONS } from '../icons';

const navItems = [
  { label: 'Home', href: '/#home' },
  {
    label: 'Services',
    href: '/#services',
    children: [
      { label: 'Corporate Events', href: '/services/corporate-events' },
      { label: 'Exhibitions', href: '/services/exhibitions' },
      { label: 'Wedding Planning', href: '/services/wedding-planning' },
      { label: 'Branding & Design', href: '/services/branding-design' },
      { label: 'Sports', href: '/services/sports' },
    ],
  },
  { label: 'Work', href: '/#portfolio' },
  { label: 'Insights', href: '/#insights' },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/#team' },
  { label: 'Contact', href: '/#contact' },
];

const isMainPage = () => window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');

function scrollToHash(hash: string) {
  const id = hash.replace('#', '');
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 40);
      if (currentY > 100) {
        setHidden(currentY > lastScrollY.current);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) setHidden(false);
  }, [menuOpen]);

  useEffect(() => {
    if (!isMainPage()) return;
    const ids = navItems.map(i => i.href.replace('/#', ''));
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (window.location.hash) scrollToHash(window.location.hash);
    const onScroll = () => {
      const scrollY = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollY) {
          setActive(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    setDropdownOpen(false);
    if (isMainPage() && href.startsWith('/#')) {
      e.preventDefault();
      scrollToHash(href.replace('/', ''));
    }
  };

  const handleServicesClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (menuOpen) {
      setMenuOpen(false);
      setDropdownOpen(false);
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
      className={`fixed top-0 left-0 w-full z-50 transition-[background-color,box-shadow,padding,transform] duration-500 will-change-[transform,opacity] ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        scrolled ? 'bg-surface/90 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)] py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 min-w-9 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: ICONS['logo-ac'] }} />
          <span className="font-heading font-bold text-xl text-white">
            Double Brain Creative &amp; Event SDN BHD
          </span>
        </a>

        <nav
          className={`fixed inset-0 bg-surface/98 backdrop-blur-md flex flex-col items-center justify-center gap-6 transition-[transform] duration-500 z-40 lg:static lg:bg-transparent lg:backdrop-blur-none lg:flex-row lg:gap-6 lg:transform-none overflow-y-auto scrollbar-hide ${
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
                  className={`text-lg lg:text-sm font-medium relative py-1 flex items-center gap-1.5 transition-colors duration-300 cursor-pointer bg-transparent border-none text-white/80 hover:text-accent ${
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
                className={`text-lg lg:text-sm font-medium relative py-1 transition-colors duration-300 text-white/80 hover:text-accent ${
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
            href="/#contact"
            onClick={(e) => handleClick(e, '/#contact')}
            className="bg-accent text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent-dark transition-[background-color,transform] hover:-translate-y-0.5 lg:ml-2"
          >
            Get in Touch
          </a>
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 p-1 cursor-pointer z-50 lg:hidden bg-transparent border-none"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 rounded transition-[transform,opacity,background-color] duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5 bg-white' : 'bg-white'}`} />
          <span className={`block w-6 h-0.5 rounded transition-[transform,opacity,background-color] duration-300 ${menuOpen ? 'opacity-0 bg-white' : 'bg-white'}`} />
          <span className={`block w-6 h-0.5 rounded transition-[transform,opacity,background-color] duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5 bg-white' : 'bg-white'}`} />
        </button>
      </div>
    </header>
  );
}
