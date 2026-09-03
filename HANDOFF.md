# Project status - Babak Baghaei personal site

Last updated: 2026-09-02

## Run

```bash
cd "C:/Users/BABAK/OneDrive/Desktop/babak 01/mainframe" && npm run dev -- --port 5180
```

`npm run build` kills the dev server; restart it afterwards.

## Stack

Vite 7 + React 19 + TypeScript + Tailwind v4 + shadcn structure (`components.json`,
`@/` alias to `src/`). English only. No backend.

## Page order

```
Header (fixed)        About - Experience - Contact
PortraitHero          mouse-tracked clip + role labels, one screen tall
About                 condensed lead + Read more, then Capabilities (always
                      shown, three columns), portrait flush inside the frame,
                      sticky and capped at a screenful
Experience            career rail, **oldest first**, headings only; one
                      continuous track with a violet line drawn down it by
                      scroll, each step appearing as the line reaches it
Credentials           4 certificates + the trading certificate itself
StackedCircularFooter id="contact" - this IS the contact section
```

## Where the content lives

| file | holds |
|---|---|
| `src/content/site.ts` | nav, socials, contact email + form endpoint, logo |
| `src/content/about.ts` | About lead, the Read more paragraphs, the portrait |
| `src/lib/hyphenate.ts` | soft-hyphen break points for the justified About copy |
| `src/content/resume.ts` | career roles (**oldest first**), skill groups, certificates, cert image |
| `src/content/labels.ts` | hero role labels + measured face landmarks |

## Open questions for Babak

1. **Career dates for the two new strands.** Markets shows `2022 - Present`,
   derived from "close to four years" in his own bio. Web work shows `Present`
   with no start year at all. Both need confirming.
2. **Date overlap.** Borj-e Saat (Aug 2022 - Feb 2023) sits inside the Mizban
   post (May 2020 - Jun 2026). Concurrent, secondment, or a date to correct?
3. **Is the Mizban role over?** The CV ends it Jun 2026; today is Sep 2026.
4. **English proficiency level** - the CV shows bars, not words.
5. **Official English names** for the two institutions (currently translated).
6. **Phone** (+98 936 580 6951 on the CV) - on the site or not?
7. **Contact form activation** - see below. Still not done.
8. **A second Samadi Capital certificate exists** on disk and is not on the
   site: *Certificate of Completion - Financial Intelligence Program*,
   `SCA-FI-2026-000013`, awarded 20 Feb 2024, also independently verifiable.
   Add it to `CERTIFICATES` or leave it out?
9. **The BA is off the page.** `EDUCATION` is still in `resume.ts` but nothing
   renders it, per his instruction to keep certificates only.

## Contact form - one manual step outstanding

Posts to FormSubmit, relaying to `babakbaghaee7@gmail.com`. **It does not
deliver until the address is activated**: the first submission triggers an
activation email to that inbox; click the link once. Send yourself a test.

Note the spelling: `baghaee` (from the CV), not `baqaei`. That was corrected
across the site on 2026-09-02.

## Things that were learned the hard way - do not undo

- **`Reveal` tests only the top edge.** It used to also require `r.bottom > 0`,
  which meant anything scrolled *past* between two checks never revealed: one
  long jump took the element from below the trigger line to above the viewport
  in a single scroll event and it stayed at `opacity: 0` for good. Caught on the
  career rail - all five steps scrolled past, all still invisible at the foot of
  the page. Do not put that clause back.
- **The About copy is justified only because of `src/lib/hyphenate.ts`.**
  Justified text stretches the spaces by whatever the word that did not fit left
  behind; measured here that reached **19px against a 4px natural space**.
  Chrome's own `hyphens: auto` does not close it (it will not hyphenate into a
  final line at all), and neither do `hyphenate-limit-chars` or
  `text-wrap: pretty` - all three were measured. Soft hyphens from real en-US
  patterns bring the worst case to ~9px at every column width from 600 to 900px.
  Take the soft hyphens away and the loose lines come straight back.
- **The footer clip is blended, not laid over - `mix-blend-screen`.** This is
  what removed the seam, after three fades failed to. A plain 50% layer *halves*
  whatever is beneath it, and the page beneath the footer is not black: the
  fixed radial gradient is violet toward the bottom of the viewport, about luma
  40, so a plain 50% clip darkened it by ~20 the instant the footer began. That
  step is the horizontal line. Screen can only *add* light, and the clip's top
  fifth measures luma 0-0.4 (ten bands per frame, measured off the file), so at
  the footer's top edge it adds nothing and the page runs straight through.
  `object-top` keeps that dark end at the boundary.
- **Nothing may isolate that video.** `mix-blend-mode` blends within the nearest
  stacking context, and stacking contexts are easy to create by accident - a
  `z-index` on the wrapper did it, and so would `isolation: isolate` on the
  footer. Both were removed; the footer's content column carries `relative`
  instead so it still paints above the clip. Isolate it and the blend silently
  degrades to the plain 50% overlay this replaced - no error, just the line back.
- **The footer scrim starts at zero.** It exists only to hold text off the
  sunlit limb of the Earth (55-80% down the frame), so it ramps in over the
  empty upper half with a smoothstep and is 0 at the top edge, where it would
  otherwise reintroduce exactly the step the blend just removed.
- **No `IntersectionObserver`, no `loading="lazy"`.** In embedded webviews the
  observer can never fire, leaving content stuck at `opacity: 0` and images
  never loading. `Reveal` and `FooterVideo` measure with
  `getBoundingClientRect` on scroll **plus a diffed poll** - the poll covers
  deep links and programmatic scrolls, which fire no scroll event.
- **No `100vh` / `100dvh` for full-screen boxes.** A pane can resize without
  ever firing `resize`; measured 673x794 -> 1200x500 -> 900x1000 in silence.
  `useViewportSize` observes with a `ResizeObserver` + poll and publishes
  `--app-vw` / `--app-vh`.
- **`history.scrollRestoration = "manual"`** in `main.tsx`. Without it a reload
  drops you mid-page with the hero scrolled away, which reads as a missing hero.
- **Header is `fixed`, not `sticky`.** Sticky occupies a row in the flow and
  pushed the full-height hero down by its own height.
- **Hero landmarks are measured, not guessed.** `EYE_Y 0.34`,
  `HEAD_LEFT 0.344`, `HEAD_RIGHT 0.623`. The turn window was `2.35 / 3.55 /
  4.45s` in the original take; the shipped clip is cut to it, so the marks are
  now `0 / 1.2 / 2.1`. Re-measure if the clip is replaced.
- **The hero clip is all-intra on purpose.** Every frame is a keyframe. A normal
  long-GOP file has to decode forward from the previous keyframe on every mouse
  move: measured in-page, seeks averaged **110ms (max 138ms)** on the old file
  against **11ms** on this one. That was the head lagging the cursor. If the
  clip is ever re-encoded, keep `-g 1 -keyint_min 1 -sc_threshold 0` or the lag
  comes straight back.
- **The footer seam is masked, not painted over.** Covering the top of the clip
  with a gradient of `--color-background` leaves a visible band, because the page
  behind is a *radial* gradient and that flat colour only matches it dead centre.
  `FooterVideo` masks its own container instead, so the real page shows through.
  Footer padding (`pt-36 md:pt-52`) is set to clear the 13rem fade - that is why
  the logo starts exactly where it does.
- **The footer clip needs its scrim.** At 50% opacity alone, the bright limb of
  the Earth drops footer text to 2.1:1. The 45% scrim holds it at 8.8:1.
- **The in-app browser pane is unreliable for screenshots** - it returns black
  frames or zoomed crops while the DOM is fine. Verify layout with
  `getBoundingClientRect`, not with pictures.

## Assets

| file | note |
|---|---|
| `public/video/hero.mp4` | 1920x1080, 20fps, 2.15s, **all-intra**, no audio, 1.53MB. Cut from the 6s original to the turn window and re-encoded for instant seeking (SSIM 0.991 against source). |
| `unused-media/hero-original-6s.mp4` | the untrimmed 6s take, kept for re-measuring |
| `public/video/footer.mp4` | 1.23MB, transcoded from a 14MB 4K source |
| `public/brand/logo-bb.png` | ink monogram, for light surfaces (header over hero) |
| `public/brand/logo-bb-light.png` | white monogram, for the dark page |
| `public/images/about-hospitality.jpg` | the only About image still used |
| `public/images/about-markets.jpg` | unused since About was condensed |
| `public/images/about-code.jpg` | unused since About was condensed |
| `public/images/certificate-trading.webp` | 1800px wide, 87KB, from `Desktop/ax/SamadiCapital-Certificate-SCA-TR-2026-000001.png` |
