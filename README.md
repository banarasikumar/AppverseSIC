# AppverseSI — Apps, Software & Product Engineering

AppverseSI (Appverse Superintelligence) is an independent software company focused on creating and publishing useful applications. It also welcomes project enquiries from businesses seeking websites, mobile apps, web applications, and custom software. The long-term product vision includes more connected digital experiences and ambitious super-apps.

The public product shelf is intentionally honest: it does not list unreleased product names, fabricated screenshots, customer logos, testimonials, or launch dates. Add products and case studies only when their details are verified and ready to publish.

## Stack

- Next.js App Router, React, and TypeScript.
- Three.js/WebGL, dynamically loaded on the client for a scroll-driven 3D universe: shader-rendered interstellar dust, gravitational-lensing-style sky distortion, a black-hole event horizon, turbulent accretion disk, shader-driven corona, depth particles, a wormhole-like formation, and neural-constellation geometry.
- Responsive, dark editorial interface with the products section immediately following the hero, an apps-first primary CTA, a lower-priority business collaboration link, semantic DOM content, keyboard-operable navigation, reduced-motion support, and a WebGL fallback.
- Server-side inquiry endpoint at `app/api/contact/route.ts`, with persistent Supabase storage and a private admin inbox.

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


## Private admin inbox

The business enquiry form stores submissions in Supabase so enquiries remain available even if email delivery is not configured.

1. Create a Supabase project.
2. Run the SQL in `supabase/migrations/20261017000000_contact_messages.sql` in the Supabase SQL Editor.
3. In Vercel Project Settings → Environment Variables, add these variables to the `appverse-sic` project for Production:
   - `SUPABASE_URL`: the project URL from Supabase Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY`: the service-role key from the same settings page. This is a secret and must never be exposed in browser code or given a `NEXT_PUBLIC_` prefix.
   - `ADMIN_USERNAME`: the admin login username.
   - `ADMIN_PASSWORD`: a strong, unique admin password.
   - `ADMIN_SESSION_SECRET`: a cryptographically random secret of at least 32 characters.
4. Redeploy after saving the variables.
5. Add `admin.appverse.si` as a domain on the `appverse-sic` Vercel project. The root of that host is routed to the private admin sign-in; `appverse.si` continues to serve the public website.

The inbox uses signed, HTTP-only, secure production cookies with an eight-hour expiry. Admin APIs reject unauthenticated requests, and the contact form uses server-side validation, a honeypot, request-size limits, and rate limiting. The Supabase service-role key is used only on the server.

For local development, copy `.env.example` to `.env.local` and set values for your own Supabase project and admin credentials. Never commit `.env.local` or real keys.
