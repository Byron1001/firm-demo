import { useState, useEffect } from 'react'
import { useTranslations } from '../i18n'

interface Project {
  title: string
  category: string
  location: string
  img: string
  slug: string
  overview: string
  stats: Record<string, string>
}

interface Props {
  projects: Project[]
  locale?: string
}

const aspects = ['aspect-[3/4]', 'aspect-[16/9]', 'aspect-[1/1]', 'aspect-[4/3]', 'aspect-[2/3]', 'aspect-[3/2]']

export default function WorkGallery({ projects, locale = 'en' }: Props) {
  const t = useTranslations(locale)
  const [selected, setSelected] = useState<Project | null>(null)

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selected])

  return (
    <>
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 py-24">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [&>div]:break-inside-avoid [&>div]:mb-6">
          {projects.map((p, i) => (
            <div
              key={p.slug}
              onClick={() => setSelected(p)}
              className={`relative group cursor-pointer overflow-hidden rounded-xl bg-bg-dark ${aspects[i]} transition-shadow duration-500 hover:shadow-[0_0_30px_-10px_#F38A14]`}
            >
              <img
                src={p.img}
                alt={p.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <span className="text-accent text-xs font-semibold tracking-[0.15em] uppercase">{p.category}</span>
                <h3 className="text-white font-heading font-bold text-xl mt-1">{p.title}</h3>
                <p className="text-white/60 text-sm mt-1">{p.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease]"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-surface rounded-2xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto animate-[scaleIn_0.25s_ease]"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-black/60 flex items-center justify-center text-white/80 hover:text-white hover:bg-accent transition-all duration-300 text-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              <span className="sr-only">{t.work.closeModal}</span>
            </button>

            <img
              src={selected.img}
              alt={selected.title}
              className="w-full aspect-video object-cover rounded-t-2xl"
            />

            <div className="p-8 lg:p-10">
              <div className="flex items-center gap-3 text-accent text-xs font-semibold tracking-[0.15em] uppercase mb-4 flex-wrap">
                <span>{selected.category}</span>
                <span className="w-px h-3 bg-accent/30" />
                <span>{selected.location}</span>
              </div>

              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-primary leading-tight mb-4">
                {selected.title}
              </h2>

              <p className="text-text-light leading-relaxed mb-8">
                {selected.overview}
              </p>

              <div className="flex flex-wrap gap-8 mb-8 pb-8 border-b border-white/10">
                {Object.entries(selected.stats).map(([key, val]) => (
                  <div key={key} className="text-center">
                    <p className="font-heading text-2xl lg:text-3xl font-bold text-primary">{val}</p>
                    <p className="text-text-muted text-xs tracking-[0.15em] uppercase mt-1">{key}</p>
                  </div>
                ))}
              </div>

              <a
                href={`${import.meta.env.BASE_URL}case-study/${selected.slug}`}
                className="inline-flex items-center justify-center gap-2 bg-accent text-primary font-semibold px-6 py-3 rounded-full hover:bg-accent-dark transition-[background-color,transform] hover:-translate-y-0.5 text-sm w-full sm:w-auto min-h-[48px]"
              >
                {t.work.viewCaseStudy}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
