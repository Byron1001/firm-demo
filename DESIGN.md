# Design

## Theme

Vibrant, bold editorial — oversized typography carries the brand. Dark-and-light contrast with coral energy. Celebratory but precise.

## Colors

```css
/* Primaries */
--color-primary: #1a1a2e;       /* Deep midnight navy */
--color-secondary: #16213e;     /* Slightly lighter navy */
--color-bg-dark: #0f0f1a;      /* Near-black for dark sections */

/* Accents */
--color-accent: #f76b6b;        /* Coral — primary accent */
--color-accent-light: #ffb3b3;  /* Light coral */
--color-accent-dark: #e05050;   /* Deeper coral for hover */
--color-accent-secondary: #ff9a56; /* Peach — secondary accent */

/* Neutrals */
--color-bg-alt: #f8f7f4;       /* Warm off-white for alternating sections */
--color-text-light: #6b7280;    /* Muted text */
```

## Typography

| Type | Font | Usage |
|------|------|-------|
| Display | Playfair Display | H1-H3, large headings |
| Body | Inter | Body text, nav, small type |

- Headings: `tracking-[-0.03em]` to `[-0.02em]`, responsive `clamp()` sizing
- Body: 0.95rem–1.05rem, `leading-relaxed`
- Label text: `text-xs font-semibold tracking-[0.15em] uppercase`

## Spacing

Sections: `py-[120px] max-sm:py-20`
Content max-width: 1440px
Horizontal padding: `px-6 lg:px-16`

## Components

### Section Header Pattern
```
[line] [LABEL]  (flex items-center gap-3)
[Heading text]  (font-heading, bold, clamp sizing)
```

### Cards
| Card Type | Style |
|-----------|-------|
| Award | `bg-bg-alt border border-gray-100 rounded-2xl p-8 text-center` |
| Team | `w-[280px] bg-white border border-gray-200 rounded-2xl` |
| Testimonial | `w-[380px] bg-white p-8 rounded-2xl border border-gray-200` |
| Client logo | `bg-white border border-gray-100 rounded-xl p-6 h-[130px]` |
| Why Choose Us | `bg-white/5 border border-white/10 rounded-2xl p-10 text-center` |

### Buttons
- Primary: `bg-accent text-primary font-semibold px-8 py-4 rounded-xl`
- Secondary: `bg-transparent text-white border border-white/20 px-8 py-4 rounded-xl`
- WhatsApp: `bg-[#25D366] text-white px-8 py-4 rounded-xl`
- Hover: `hover:-translate-y-0.5` lift on all CTAs

### Navigation
- Fixed header, transparent → white on scroll
- Mobile: fullscreen overlay with backdrop blur
- Active indicator: `h-0.5 bg-accent rounded-full` underline
- Logo: inline SVG icon `DB` + company name

## Animation

- Lenis smooth scroll (custom easing)
- Hero: staggered `fade-in-up` on badge → h1 → p → CTAs → stats
- Hover: `-translate-y-0.5` lift on cards, `translate-x-1` on contact items
- Section transitions: `duration-500` on most interactive states

## Responsive

- Sections collapse to single column on mobile
- Heading sizes use `clamp()` for fluid scaling
- Team + Testimonials: horizontal scroll on mobile/tablet
- Gallery: 6-col → 4 → 3 → 2 grid
