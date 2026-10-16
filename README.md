# AppverseSI — A New Universe of Software

Responsive Next.js website for Appverse.si (Appverse Superintelligence). Product names and launch dates are intentionally not invented; unreleased products are marked as in development.

## Run locally

Requires Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. For a production check, run `npm run typecheck` and `npm run build`.

## Deploy to Vercel

1. Open https://vercel.com/new and import `banarasikumar/AppverseSIC` from GitHub.
2. Keep the detected Next.js framework settings and deploy.
3. Test the temporary `vercel.app` preview first.
4. When ready, add `appverse.si` under the Vercel project’s Settings → Domains and configure the exact DNS records Vercel provides.

## Business inquiry form

The site deploys without email delivery configured, but the inquiry form will return a setup message until the following Vercel environment variables are set:

- `RESEND_API_KEY` — API key from Resend.
- `CONTACT_TO_EMAIL` — inbox for inquiries.
- `CONTACT_FROM_EMAIL` — sender address on a domain verified in Resend.

Add the values under Vercel → Project → Settings → Environment Variables, then redeploy and test the form. Never commit real secrets. `.env.example` contains placeholders only.

## What’s included

- Responsive homepage, mobile navigation, orbital visual, starfield accents, scroll reveals, and reduced-motion support.
- Brand story, product-in-development section, business services, and contact form.
- Next.js metadata, social preview SVG, favicon, sitemap, and robots route.
- Validated contact API endpoint with a honeypot field and optional Resend delivery.

The orbital scene uses CSS rather than WebGL to keep the initial experience lightweight. Actual frame rate depends on the visitor’s device and browser.
