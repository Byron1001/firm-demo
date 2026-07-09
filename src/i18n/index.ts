import { en, ms, type Locale, type Translations } from './translations';

const translations: Record<Locale, Translations> = { en, ms };

export function useTranslations(locale: Locale): Translations {
  return translations[locale] || translations.en;
}

export function getLocale(url: URL): Locale {
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] === 'ms') return 'ms';
  return 'en';
}

export function altLangUrl(url: URL): string {
  const base = import.meta.env.BASE_URL || '/';
  const clean = (s: string) => s.replace(/\/$/, '');
  if (getLocale(url) === 'ms') {
    const rest = url.pathname.replace(/^\/ms\//, '').replace(/^\/ms$/, '');
    return `${clean(base)}${rest ? '/' + rest : ''}`;
  }
  const path = url.pathname === '/' || url.pathname === clean(base) ? '' : url.pathname;
  return `${clean(base)}/ms${path}`;
}

export type { Locale, Translations };
