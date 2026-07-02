# Double Brain Creative & Event Sdn Bhd — Event Management Website

Malaysian event management company website built with Astro + Sanity CMS, deployed on Vercel.

## Architecture

```
┌──────────────────┐     Deploy on git push    ┌──────────────────┐
│    GitHub        │ ◄─────────────────────── │    Vercel        │
│  (source code)   │                           │  (hosting)       │
│                  │                           │                  │
│  src/            │  git push → triggers      │  astro build     │
│  astro.config    │  auto-deploy              │  → dist/ (CDN)   │
│  sanity.config   │                           │  → public URL    │
└──────────────────┘                           └────────┬─────────┘
       ▲                                                │
       │  Webhook (on publish in Sanity)                 │
       │  triggers Vercel rebuild                        │
       │                                                │
       ▼                                                ▼
┌──────────────────┐                           ┌──────────────────┐
│    Sanity IO     │                           │  End Users       │
│  (headless CMS)  │                           │  Visit Site      │
│                  │                           │                  │
│  Client edits    │  Static HTML served       │  yoursite.com    │
│  in browser      │  from Vercel CDN          │  ⚡ instant      │
│  sanity.io/studio│                           │                  │
└──────────────────┘                           └──────────────────┘
```

### How content updates flow

1. Client opens `sanity.io/studio/[project]` in browser
2. Edits any content (practice areas, team, blog posts, etc.)
3. Clicks **Publish**
4. Sanity fires a webhook to Vercel
5. Vercel rebuilds the static site with fresh content (~30s)
6. Site updates instantly on the public URL

### How code updates flow

1. Developer pushes code to GitHub
2. Vercel auto-detects the push, runs `astro build`
3. Site deploys automatically

## Stack

| Layer | Technology | Cost |
|---|---|---|
| **Frontend** | Astro (static site generation) | Free |
| **CMS** | Sanity (headless, client UI at sanity.io/studio) | Free tier |
| **Hosting** | Vercel (global CDN) | Free tier |
| **Contact form** | Formspree (HTML form → email) | Free tier (1,000/mo) |
| **Source control** | GitHub | Free |
| **Custom domain** | Namecheap / Cloudflare | ~$10/yr |
| **Total** | | **$0/month + domain** |

## Key Design Decisions

- **Static site, no server**: All content fetched at build time via Sanity API. Visitors get pure static HTML from CDN — zero backend, zero cold starts, instant page loads.
- **No Node.js backend**: Contact form handled by Formspree (no Vercel function needed). Client content management via Sanity (SaaS).
- **30s content→live**: After client publishes in Sanity, webhook triggers Vercel rebuild. Acceptable for a law firm site.
- **No database**: Sanity is the source of truth. No Supabase, no Postgres, no Redis needed.

## Free Tier Limits (Generous Margin)

| Service | Free Limit | Expected Usage |
|---|---|---|
| **Sanity** | 10k documents, 1M API requests/mo, 100GB bandwidth | ~50 docs, ~5k req/mo, ~5GB |
| **Vercel** | 100k function invocations/mo, 100GB bandwidth | Static site — near zero |
| **Formspree** | 1,000 submissions/mo | ~50/mo for a law firm |

## Sanity Content Schema

| Schema | Purpose | Editable Fields |
|---|---|---|
| `siteSettings` | Global site info | Firm name, logo, hero, about text, social links |
| `practiceArea` | 6 practice areas | Icon, title, description, order |
| `teamMember` | 8 team members | Name, role, photo, bio, order |
| `office` | 3 branch offices | Name, address, phone, email, hours, map link |
| `blogPost` | News & articles | Title, slug, date, body (rich text), image |
| `testimonial` | Client testimonials | Name, role, text, order |
| `galleryClient` | Client logos | Name, logo image, order |
| `faq` | FAQs | Question, answer, order |
| `career` | Job listings | Title, department, location, type, description |

## Getting Started

```bash
npm install
npm run dev        # local dev at localhost:4321
npm run build      # build to dist/
npm run preview    # preview build locally
```

## Deployment

```bash
# Initial deploy (one-time)
vercel --prod

# After that, auto-deploys on every git push
git push
```

### Custom Domain

```bash
vercel domains add doublebraincreative.com
# Then point DNS CNAME → cname.vercel-dns.com
```
