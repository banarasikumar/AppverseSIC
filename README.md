# AppverseSI — A New Universe of Software

An immersive, responsive Next.js experience for Appverse.si (Appverse Superintelligence), built around a real-time Three.js/WebGL particle universe.

## Experience architecture

- Real-time 3D core with reflective materials, layered orbital rings, a shader-driven spiral particle field, near-field particles, and depth stars.
- Pointer-reactive scene movement on desktop and touch/pointer interaction on mobile.
- Display-synchronized `WebGLRenderer.setAnimationLoop` with no hard-coded 60 FPS cap. Actual refresh rate remains browser/device dependent; this code cannot force a display to run at 120 Hz.
- Responsive particle budgets and capped device pixel ratio to help balance visual quality and performance on mobile.
- Pause/resume control, tab-visibility pause, reduced-motion support, and a fallback background if WebGL is unavailable.
- Brand story, development-stage areas, business services, and validated contact form.

## Run locally

Requires Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run typecheck` and `npm run build` for local checks.

## Deploy to Vercel

1. Open https://vercel.com/new and import `banarasikumar/AppverseSIC` from GitHub.
2. Keep the detected Next.js framework settings and deploy.
3. Test the temporary `vercel.app` preview before connecting the custom domain.
4. When ready, add `appverse.si` in Vercel project Settings → Domains and follow Vercel's exact DNS instructions.

A successful push to the connected repository will trigger automatic deployments once the repository is linked to a Vercel project. See [Vercel's Git deployment docs](https://vercel.com/docs/git).

## Business inquiry form

The site can deploy without email delivery configured, but the form will show a setup message until these Vercel environment variables are added:

- `RESEND_API_KEY` — API key from Resend.
- `CONTACT_TO_EMAIL` — inbox for inquiries.
- `CONTACT_FROM_EMAIL` — sender identity on a domain verified in Resend.

Set the values under Vercel → Project → Settings → Environment Variables, redeploy, and test the form. Never commit real secrets. `.env.example` contains placeholders only.

## Notes

- Three.js is loaded client-side; the page keeps usable text and navigation if WebGL fails or is unavailable.
- Visual quality and frame rate depend on the visitor's GPU, browser, power mode, and display. No 120 FPS guarantee is made.
- Product areas are marked in development. No unreleased product names or dates are invented.
