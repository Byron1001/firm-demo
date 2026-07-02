# Lexicon Legal — Deployment Guide

## Architecture

- **Frontend:** [Astro](https://astro.build) (static site generation / SSG) + Tailwind CSS v4 + React 19 islands
- **Backend:** Spring Boot 3.4.4 (Java 21) — REST API for contact form submissions
- **Database:** H2 (dev) / PostgreSQL (prod)
- **Output:** Static `dist/` folder + Java JAR backend

## Prerequisites

- Node.js >= 18
- npm >= 9
- Java 21 (JDK)
- Maven 3.9+

## Local Development

### Backend (Spring Boot)

```bash
cd backend

# Build the project
mvn package

# Start dev server (http://localhost:8080)
java -jar target/legal-firm-backend-1.0.0.jar

# Or use Maven directly in development
mvn spring-boot:run
```

The backend starts on port 8080 with an H2 in-memory database. API docs:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/contact` | Submit a consultation request |

### Frontend (Astro)

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

Set `PUBLIC_API_URL` to point to your backend. Defaults to `http://localhost:8080`:

```bash
export PUBLIC_API_URL=http://localhost:8080
```

### Production Backend (PostgreSQL)

```bash
cd backend
java -jar target/legal-firm-backend-1.0.0.jar \
  --spring.profiles.active=prod \
  --DATABASE_URL=jdbc:postgresql://host:5432/lexiconlegal \
  --DATABASE_USER=user \
  --DATABASE_PASSWORD=password \
  --FIRM_EMAIL=contact@lexiconlegal.com \
  --MAIL_HOST=smtp.sendgrid.net \
  --MAIL_PORT=587 \
  --MAIL_USERNAME=apikey \
  --MAIL_PASSWORD=your-sendgrid-key
```

Or set environment variables instead of command-line args.

### Production Frontend

Build and deploy the `dist/` folder to any static host (Netlify, Vercel, Cloudflare Pages, etc.).

Deploying to different hosts requires setting the `PUBLIC_API_URL` environment variable at build time or via the host's environment config:
- **Netlify:** Add `PUBLIC_API_URL` in Site settings → Build & deploy → Environment variables
- **Vercel:** Add `PUBLIC_API_URL` in Project Settings → Environment Variables
- **Cloudflare Pages:** Add `PUBLIC_API_URL` in Settings → Environment variables

## AWS Deployment (Cheapest — ~$4-5/mo)

Single EC2 instance running everything: nginx serves the frontend, reverse-proxies `/api/*` to Spring Boot, and H2 file-based database (no RDS).

```
yourdomain.com
  └── Route 53
        └── EC2 t4g.nano (single box)
              ├── nginx → serves frontend static files
              ├── nginx → /api/* → Spring Boot (localhost:8080)
              └── Spring Boot → H2 file database
```

### Prerequisites

```bash
# Install AWS CLI
pip install awscli
aws configure

# Create a hosted zone in Route 53 for your domain first (or transfer it to Route 53)
```

### Step 1: Launch a t4g.nano EC2

```bash
# Create security group (allows SSH + HTTP + HTTPS)
aws ec2 create-security-group \
  --group-name lexiconlegal-sg \
  --description "Lexicon Legal web server"

aws ec2 authorize-security-group-ingress \
  --group-name lexiconlegal-sg \
  --protocol tcp --port 22 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name lexiconlegal-sg \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name lexiconlegal-sg \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Launch a t4g.nano (free-tier eligible, ~$3.50/mo)
aws ec2 run-instances \
  --image-id resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-6.1-arm64 \
  --instance-type t4g.nano \
  --security-groups lexiconlegal-sg \
  --associate-public-ip-address
```

Save the **PublicIpAddress** from the output.

### Step 2: SSH in and set up the server

```bash
ssh -i your-key.pem ec2-user@<public-ip>

# Install dependencies
sudo dnf install -y nginx java-21-amazon-corretto-devel

# Start nginx
sudo systemctl enable --now nginx
```

### Step 3: Upload the frontend build

From your local machine:

```bash
# Build with the right API URL (same EC2 = localhost)
PUBLIC_API_URL=http://localhost:8080 npm run build

# Upload to EC2
scp -i your-key.pem -r dist/* ec2-user@<public-ip>:/home/ec2-user/frontend/
```

On the EC2, move files and configure nginx:

```bash
ssh -i your-key.pem ec2-user@<public-ip>

sudo mkdir -p /var/www/lexiconlegal
sudo cp -r /home/ec2-user/frontend/* /var/www/lexiconlegal/
sudo chown -R nginx:nginx /var/www/lexiconlegal
```

### Step 4: Configure nginx

```bash
sudo tee /etc/nginx/conf.d/lexiconlegal.conf << 'EOF'
server {
    listen 80;
    server_name _;

    root /var/www/lexiconlegal;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo nginx -t && sudo systemctl reload nginx
```

### Step 5: Set up Spring Boot (file-based H2)

```bash
# Create data directory
sudo mkdir -p /var/lexiconlegal/data
sudo chown -R ec2-user:ec2-user /var/lexiconlegal

# Upload the JAR from local
# exit SSH, then on your machine:
scp -i your-key.pem backend/target/legal-firm-backend-1.0.0.jar ec2-user@<public-ip>:/home/ec2-user/
```

Back on EC2:

```bash
# Create a systemd service
sudo tee /etc/systemd/system/lexiconlegal.service << 'EOF'
[Unit]
Description=Lexicon Legal Spring Boot
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/var/lexiconlegal
ExecStart=/usr/bin/java -jar /home/ec2-user/legal-firm-backend-1.0.0.jar \
  --server.port=8080 \
  --spring.datasource.url=jdbc:h2:file:/var/lexiconlegal/data/lexiconlegal \
  --spring.datasource.driver-class-name=org.h2.Driver \
  --spring.jpa.hibernate.ddl-auto=update \
  --spring.jpa.open-in-view=false \
  --app.firm-email=contact@lexiconlegal.com \
  --spring.mail.host=localhost \
  --spring.mail.port=1025
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now lexiconlegal
```

Verify the API works:

```bash
curl http://localhost:8080/api/contact -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","message":"hello"}'
```

### Step 6: HTTPS with Let's Encrypt (Free)

```bash
sudo dnf install -y certbot python3-certbot-nginx

# Get your domain pointed to the EC2 IP in Route 53 first, then:
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot auto-configures nginx for HTTPS + auto-renewal
```

Once HTTPS is set, update the API URL in the frontend and rebuild:

```bash
PUBLIC_API_URL=https://yourdomain.com npm run build
scp -i your-key.pem -r dist/* ec2-user@<public-ip>:/home/ec2-user/frontend/
# on EC2:
sudo cp -r /home/ec2-user/frontend/* /var/www/lexiconlegal/
```

### Updating After Changes

```bash
# Frontend
PUBLIC_API_URL=https://yourdomain.com npm run build
scp -i your-key.pem -r dist/* ec2-user@<public-ip>:/home/ec2-user/frontend/
ssh -i your-key.pem ec2-user@<public-ip> "sudo cp -r /home/ec2-user/frontend/* /var/www/lexiconlegal/"

# Backend
mvn package -q
scp -i your-key.pem backend/target/legal-firm-backend-1.0.0.jar ec2-user@<public-ip>:/home/ec2-user/
ssh -i your-key.pem ec2-user@<public-ip> "sudo systemctl restart lexiconlegal"
```

### Cost Breakdown

| Service | Monthly |
|---------|---------|
| EC2 t4g.nano | ~$3.50 |
| Route 53 hosted zone | ~$0.50 |
| Let's Encrypt SSL | Free |
| H2 file DB | Free |
| Domain registration | ~$1/mo ($12/yr) |
| **Total** | **~$5/mo** |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PUBLIC_API_URL` | Frontend | `http://localhost:8080` | Backend API URL |
| `DATABASE_URL` | Prod backend | — | PostgreSQL JDBC URL |
| `DATABASE_USER` | Prod backend | — | PostgreSQL username |
| `DATABASE_PASSWORD` | Prod backend | — | PostgreSQL password |
| `FIRM_EMAIL` | Prod backend | — | Email to receive contact notifications |
| `MAIL_HOST` | Prod backend | `localhost` | SMTP server host |
| `MAIL_PORT` | Prod backend | `1025` | SMTP server port |
| `MAIL_USERNAME` | Prod backend | — | SMTP username |
| `MAIL_PASSWORD` | Prod backend | — | SMTP password |

## Project Structure

```
src/
  components/       # React interactive islands
    Header.tsx       # Sticky nav + mobile menu
    ContactForm.tsx  # Form with email submission
    FaqSection.tsx   # Accordion FAQ
    ScrollReveal.tsx # IntersectionObserver animations
  layouts/
    Layout.astro     # HTML shell + SEO meta + Google Fonts
  pages/
    index.astro      # Main page (assembles all sections)
  sections/          # Astro section components (zero JS)
    Hero.astro       # Hero with stats + CTA
    About.astro      # About the firm
    PracticeAreas.astro # 9 practice area cards
    Team.astro       # Attorney profiles
    WhyChooseUs.astro # Differentiators
    Testimonials.astro # Client reviews
    Faq.astro        # FAQ section wrapping FaqSection
    Contact.astro    # Contact info + form
    Cta.astro        # Call-to-action banner
    Footer.astro     # Footer with 4-column layout
    FloatingButtons.astro # WhatsApp float + back-to-top
  styles/
    global.css       # Tailwind imports + theme + animations
public/
  favicon.svg        # SVG favicon
```

## Deployment (One-Click)

### Option 1: Netlify (Recommended)

1. Push to GitHub/GitLab/Bitbucket
2. Go to [Netlify](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Select your repo
4. Settings will auto-detect (build: `npm run build`, publish: `dist/`)
5. Click **Deploy**

Or use the CLI:

```bash
npx netlify-cli deploy --prod --dir=dist
```

### Option 2: Vercel

1. Push to GitHub/GitLab/Bitbucket
2. Go to [Vercel](https://vercel.com) → **Add New** → **Project**
3. Import your repo
4. Framework preset auto-detects **Astro**
5. Click **Deploy**

Or use the CLI:

```bash
npx vercel --prod
```

### Option 3: Cloudflare Pages

1. Push to GitHub/GitLab
2. Go to [Cloudflare Pages](https://pages.cloudflare.com) → **Create a project**
3. Connect your Git provider
4. Build command: `npm run build`
5. Build output: `dist/`

### Option 4: GitHub Pages

```bash
npm run build
npx gh-pages -d dist
```

### Option 5: Any Static Host

The `dist/` folder contains pure static files. Upload it to any web server, S3 bucket, or CDN.

## Customization

### Firm Details

Edit these files to replace placeholder content:

| What | File |
|------|------|
| Firm name | `src/components/Header.tsx`, `src/sections/Footer.astro` |
| Phone number | `src/sections/Contact.astro`, `src/components/Header.tsx` |
| Email address | `src/components/ContactForm.tsx`, `src/sections/Contact.astro` |
| WhatsApp number | `src/sections/Hero.astro`, `src/sections/Contact.astro`, `src/sections/FloatingButtons.astro` |
| Office address | `src/sections/Contact.astro`, `src/sections/Footer.astro` |
| Team members | `src/sections/Team.astro` |
| Practice areas | `src/sections/PracticeAreas.astro` |
| Testimonials | `src/sections/Testimonials.astro` |
| Hero stats | `src/sections/Hero.astro` |
| About section | `src/sections/About.astro` |
| FAQ content | `src/components/FaqSection.tsx` |

### Brand Colors

Edit `src/styles/global.css` to change the Tailwind theme:

```css
@theme {
  --color-primary: #1a1a2e;      /* Dark navy */
  --color-accent: #c9a84c;       /* Gold */
  --color-accent-dark: #a8882e;  /* Darker gold */
}
```

## SEO

SEO meta tags are in `src/layouts/Layout.astro`. Update:

- `<title>` and `<meta name="description">`
- OG tags for social sharing

For better local SEO, consider:
- Creating practice-area-specific pages (e.g., `/corporate-law`)
- Adding a Google Business Profile link
- Submitting to legal directories (Avvo, Justia, FindLaw)

## Performance

The site ships **zero JavaScript by default** — only interactive islands hydrate:

- `Header.tsx` — scroll effects + mobile menu (small)
- `ContactForm.tsx` — form validation + mailto (loaded on scroll)
- `FaqSection.tsx` — accordion toggles (loaded on scroll)
- `ScrollReveal.tsx` — intersection observer (lightweight)

Expected Lighthouse scores: **95-100** across all categories.
