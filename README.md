# AppverseSI — Apps, Software & Product Engineering

AppverseSI (Appverse Superintelligence) is an independent software company focused on creating and publishing useful applications. It also welcomes project enquiries from businesses seeking websites, mobile apps, web applications, and custom software. The long-term product vision includes more connected digital experiences and ambitious super-apps.

The public product shelf is intentionally honest: it does not list unreleased product names, fabricated screenshots, customer logos, testimonials, or launch dates. Add products and case studies only when their details are verified and ready to publish.

## Stack

- Next.js App Router, React, and TypeScript.
- Three.js/WebGL, dynamically loaded on the client for a scroll-driven 3D universe: shader-rendered interstellar dust, gravitational-lensing-style sky distortion, a black-hole event horizon, turbulent accretion disk, shader-driven corona, depth particles, a wormhole-like formation, and neural-constellation geometry.
- Responsive, dark editorial interface with the products section immediately following the hero, an apps-first primary CTA, a lower-priority business collaboration link, semantic DOM content, keyboard-operable navigation, reduced-motion support, and a WebGL fallback.
- Server-side inquiry endpoint at `app/api/contact/route.ts`, integrated with Resend when configured.

The 3D renderer uses the browser's display-synchronized animation loop without a fixed 60 FPS cap. It does not force a monitor to run at 120 Hz and cannot guarantee a specific frame rate on every device.

## Run locally

Requires Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Before shipping changes, run:

```bash
npm run typecheck
npm run build
```

The project currently defines `dev`, `build`, `start`, and `typecheck` scripts. Do not treat a successful build as proof of visual, accessibility, or cross-device performance testing.

## GitHub and Vercel deployment

Repository: https://github.com/banarasikumar/AppverseSIC

The Vercel project is connected to this repository and tracks the `main` branch. Pushes to the connected branch trigger Vercel builds. The configured project lists `appverse.si` and `www.appverse.si` as domain aliases; check the Vercel dashboard if domain verification or DNS behavior needs attention.

To verify a deployment:
1. Check the latest deployment in Vercel and wait for its build state to become **Ready**.
2. Open the deployment URL and test desktop and mobile navigation, the 3D experience, reduced-motion behavior, the products section, and section links.
3. Submit a test inquiry only after configuring mail delivery, then verify the email actually arrives.

## Business inquiry delivery

The form validates input on the server, checks request origin and payload size, and limits repeated submissions. When Upstash is configured, the limit is shared across serverless instances; otherwise, the in-memory fallback is best-effort and applies only within a warm instance. The form does **not** claim success when mail delivery is unavailable. The production form returns a setup error until these email variables are configured in Vercel:

- `RESEND_API_KEY` — a real API key from Resend.
- `CONTACT_TO_EMAIL` — the inbox that should receive project inquiries.
- `CONTACT_FROM_EMAIL` — a sender identity on a domain verified with Resend.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — optional but recommended for atomic, shared rate limiting across Vercel instances.

Set the email variables under **Vercel → Project → Settings → Environment Variables** for Production, and Preview if you want to test preview deployments, then redeploy. For real delivery, verify a sender domain in Resend and use a real receiving inbox. Set the two Upstash variables to enable the shared 5-request-per-15-minute limiter; without them, only best-effort process-local limits apply. Use `.env.example` as a placeholder-only reference; never commit real keys or private contact credentials. No mail delivery credentials are currently included in the repository.

## Project structure

- `app/page.tsx` — home page entry.
- `app/layout.tsx` — metadata, canonical URL, and global styles import.
- `app/globals.css` — responsive design system and section styling.
- `app/api/contact/route.ts` — validated server-side inquiry delivery.
- `components/site-experience.tsx` — navigation, story sections, product shelf, and enquiry form.
- `components/universe-canvas.tsx` — lazy-loaded Three.js scene, shaders, camera motion, and graceful fallback behavior.
- `public/` — site icon and social-sharing assets.

## Content and performance notes

- Product sections use natural, product-led copy; no public product releases are claimed until products are ready.
- The hero CTA leads to the apps section; business project requests are a separate secondary path.
- No real customer list, testimonials, awards, user metrics, or client logos are invented.
- Three.js loads on the client so the core site content remains usable if WebGL is unavailable.
- Actual frame rate depends on the browser, GPU, power mode, and display. No 120 FPS guarantee is made.
- Do not add DNS changes, domain aliases, environment secrets, or production integrations without verifying the intended configuration.
