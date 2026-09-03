# Hangul Technologies — website

Static marketing site for **hangultech.com**. Plain HTML/CSS/JS — no build step,
no framework, no backend. Pages: Home, About, Products, Services, Contact.

## Run locally

Any static file server works, e.g.:

```bash
npx serve .
```

or just open `index.html` directly (nav links use root-relative paths like
`/about`, so a local server is recommended over `file://`).

## Deploy to Vercel

**Option A — Vercel CLI (fastest):**

```bash
npm i -g vercel
vercel login
vercel --prod
```

Run from this folder. Vercel auto-detects it as a static site (no framework,
no build command needed).

**Option B — GitHub + Vercel dashboard:**

1. Push this folder to a GitHub repo.
2. In the [Vercel dashboard](https://vercel.com/new), import the repo.
3. Framework preset: "Other" / static. No build command, no output directory override needed.
4. Deploy.

## Connect the domain

In the Vercel project → **Settings → Domains**, add `hangultech.com` (and
`www.hangultech.com`), then point your domain's DNS to Vercel as instructed
there (either delegate nameservers to Vercel, or add the A/CNAME records it
gives you).

## Contact details in use

- Email: `contact@hangultech.com`
- Phone: `+91 90350 63330`
- MediHan links to `https://medihan.in`, HayaKart links to `https://hayakart.in` (confirmed live).
  EduHan / HangoTrip / Hanzio still link to the contact form (`/contact?product=<name>`) —
  swap in real URLs once each has a confirmed public domain.

## Things to fill in before going live

- **Contact form** — has no backend by design (static site). It currently
  opens the visitor's email client via a `mailto:` link
  (`js/main.js` → the `#contact-form` handler). To capture submissions in an
  inbox/dashboard instead, wire the form to a service like
  [Formspree](https://formspree.io) or [Getform](https://getform.io), or add
  a Vercel Serverless Function later.
- **Social links** — LinkedIn/X icons in the footer currently point to `#`.
  Add real profile URLs once they exist.
- **OG/social preview image** — not included yet; add one under `/assets`
  and reference it with `og:image` meta tags if you want rich link previews.

## Structure

```
index.html      Home
about.html      About
products.html   Product details (EduHan, MediHan, HangoTrip, HayaKart, Hanzio)
services.html   Services (app dev, DevOps/cloud, operations, support, ...)
contact.html    Contact form + details
404.html        Custom not-found page
css/style.css   All styles
js/main.js      Nav toggle, active link, contact form handler
assets/         Favicon etc.
vercel.json     Clean URLs (/about instead of /about.html)
```
