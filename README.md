# OnePact

A sports photo personalization tunnel: a guest uploads a photo and turns it into
a "wow", print-ready sports poster. This repository is the **front-end
prototype** — a polished, English, click-through experience of the full 6-step
flow that *feels real*, with the backend (payment + render engine) stubbed
behind clean seams for the next internal step.

## Running it

```bash
npm install      # first time only
npm run dev      # start the dev server → http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
npm run lint     # run ESLint
```

Tip: the app is **mobile-first**. In your browser's dev tools, switch to a phone
viewport (e.g. iPhone) for the intended experience.

## The flow

A welcome screen, then a strict linear 6-step tunnel (no login, guest-only):

1. **Design Selection** — choose sport → club → poster template
2. **Photo Upload + Photo Coach** — real in-browser quality checks (resolution,
   lighting, sharpness, face) with specific inline feedback
3. **Generation + Preview** — simulated staged render, then an animated reveal of
   your photo composited onto the chosen poster
4. **Checkout** — email, name, phone, shipping address
5. **Review** — confirm everything, then "Confirm & pay" (simulated)
6. **Confirmed** — success screen with order number + email notice

## Tech stack

- **Vite + React + TypeScript** — fast SPA, no backend needed yet
- **Tailwind CSS v4 + custom shadcn-style UI** — `src/components/ui/`
- **Zustand** — the linear tunnel state machine (`src/store/useFlowStore.ts`)
- **react-hook-form + zod** — checkout form validation
- **framer-motion** — step transitions and reveals

## Project structure

```
src/
  components/        Shared UI: Header, StepIndicator, StepScreen, PosterArt, ui/
  data/              Mock catalog: sports, clubs, templates (swap for an API later)
  store/             useFlowStore — single source of truth for the tunnel
  features/
    welcome/         Landing screen
    design/          Step 1 — sport → club → template sub-flow
    upload/          Step 2 — upload + Photo Coach (canvas quality checks)
    generate/        Step 3 — simulated render + canvas poster compositor
    checkout/        Steps 4–6 — form, review, confirmed
  types/             Shared domain types and constants (price, steps)
```

## Backend seams (the next internal step)

Two clearly-marked seams keep the prototype's UI ready for the real backend
without rework:

- **Render engine** — `src/features/generate/posterComposite.ts` currently
  composites the poster on a client canvas. In production this becomes a
  server-side render job (queue + workers) that the client polls; the
  Promise-returning contract stays the same.
- **Payment** — `src/features/checkout/OrderConfirmation.tsx` simulates the
  Stripe round-trip. In production it creates a Stripe Checkout Session and
  redirects to the hosted page.

## Deliberately out of scope (for now)

Real AI rendering, Stripe payment, server job queue/polling, WordPress B2B entry
redirect, accounts/login (the flow is permanently guest), client branding, and
French / multi-language. Copy is structured so it can be localized later.

## Customizing the brand color

The accent color (placeholder electric blue `#2563EB`) is a single token. Edit
`--primary` in `src/index.css` to rebrand.
