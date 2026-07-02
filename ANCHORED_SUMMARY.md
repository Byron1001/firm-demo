## Goal
- Build a complete legal firm website with Spring Boot backend and Astro frontend for public deployment

## Constraints & Preferences
- Use Spring Boot for backend (user explicitly chose this over JS serverless or Python FastAPI)
- Use Astro + Tailwind + React for frontend
- Interactive with contact via WhatsApp, email, phone
- Production-grade architecture for a real legal firm
- Contact form must POST to backend API, not mailto

## Progress
### Done
- Researched top law firm websites for design inspiration
- Evaluated framework options: Astro (chosen for frontend), Spring Boot (chosen for backend)
- Built Astro frontend with 11 sections: Header, Hero, About, PracticeAreas, Team, WhyChooseUs, Testimonials, Faq, Cta, Contact, Footer
- Built 4 React interactive components: Header.tsx (sticky nav + mobile menu), ContactForm.tsx (POSTs to API), FaqSection.tsx (accordion), ScrollReveal.tsx (animations)
- Created complete Spring Boot backend: ContactController, EmailService, ContactRequest (JPA entity), ContactRequestRepository, CorsConfig
- Configured H2 for dev, PostgreSQL for prod via Spring profiles
- Backend verified: starts on port 8080, POST /api/contact returns JSON success response, saves to DB, attempts email notification
- Frontend verified: `npm run build` produces clean static output
- Integration verified: CORS preflight passes, full POST flow works end-to-end
- Created `.env` with PUBLIC_API_URL for frontend-backend connection
- Updated DEPLOY.md with comprehensive backend deployment instructions + env vars table
- Fixed: added mail SMTP config to dev profile so JavaMailSender bean initializes

## Key Decisions
- Astro (SSG) over Next.js: Zero JS by default, best Core Web Vitals, used by real law firms
- Spring Boot over JS serverless: User explicitly chose Java/Spring Boot
- H2 in-memory for dev, PostgreSQL for prod via Spring profiles
- JavaMailSender for email notifications; controller catches mail failures gracefully
- React islands only for interactive parts (form, FAQ, nav), rest is static HTML
- WhatsApp floating button + inline throughout site with animation

## Next Steps
- Replace placeholder content with real firm data
- Configure SMTP credentials for production email delivery
- Add practice-area-specific subpages for SEO
- Deploy frontend to Netlify/Vercel and backend to Railway/Fly.io
- Connect custom domain

## Critical Context
- Java 21 + Maven 3.9+ available
- Spring Boot 3.4.4 with web, mail, data-jpa, validation starters
- Frontend: Astro 5.x, Tailwind v4, React 19
- Backend runs on port 8080, Frontend on port 4321
- PUBLIC_API_URL env var connects frontend to backend
- DEPLOY.md has full deployment instructions for both frontend and backend

## Relevant Files
- /backend/pom.xml: Maven config
- /backend/src/main/resources/application.yml: Dev (H2) + Prod (PostgreSQL) profiles
- /backend/src/main/java/com/lexiconlegal/controller/ContactController.java: POST /api/contact
- /backend/src/main/java/com/lexiconlegal/service/EmailService.java: JavaMailSender
- /backend/src/main/java/com/lexiconlegal/model/ContactRequest.java: JPA entity
- /backend/src/main/java/com/lexiconlegal/config/CorsConfig.java: CORS config
- /src/components/ContactForm.tsx: Posts to backend API with loading/error states
- /src/components/Header.tsx: Sticky nav with scroll tracking
- /src/components/FaqSection.tsx: Accordion FAQ
- /src/components/ScrollReveal.tsx: IntersectionObserver animations
- /src/sections/*.astro: All page sections
- /DEPLOY.md: Deployment guide (both frontend + backend)
- /.env: PUBLIC_API_URL config
