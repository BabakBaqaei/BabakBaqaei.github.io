# Project status - Babak Baghaei personal site

## Live

**https://babakbaqaei.github.io** - hosted on GitHub Pages, repo
`BabakBaqaei/BabakBaqaei.github.io` (a user-site repo, so it serves at the root
and no Vite `base` path is needed).

Deploys automatically: every push to `main` runs `.github/workflows/deploy.yml`,
which builds with Vite on GitHub's runners and publishes `dist/` to Pages. No
local deploy step, and nothing to run by hand.

Netlify was tried first and abandoned: the account was auto-suspended at signup
("Your account has been suspended"), the usual outcome for the author's region.
GitHub already hosts the repo without issue and the build runs on GitHub's own
infrastructure, so Pages sidesteps that entirely.


Last updated: 2026-10-13

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
PortraitHero          split portrait, cursor slides the seam + role labels
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
  `HEAD_LEFT 0.344`, `HEAD_RIGHT 0.623`. The stills are frames of the same
  take, so these still hold. Re-measure if the stills come from a new shoot.
- **The hero is one frame split by a sliding seam** (`HeroLayers.tsx`,
  rebuilt 2026-10-13 to match the reference Babak gave, `Desktop/ax/111.mp4`).
  Illustration left of a vertical seam, photograph right of it; the cursor
  slides the seam *across a head that never moves* (toward the right the photo
  takes the face, toward the left the illustration does) and the eyes on each
  side turn to follow it. Rest = seam on the nose line, both halves at the lens.
  A first attempt stacked three *different* frames (head turned left / front /
  right) and wiped between them; heads did not line up, so slivers of a turned
  head floated beside the face. Do not go back to multiple poses.
- **Everything is frame 31 (1.25s) of `unused-media/hero-original-6s.mp4`.**
  Photo, illustration and every gaze step differ only inside the eye strip
  `x 840-1096, y 308-404` (verified by pixel diff), so nothing else can ever
  show a seam.
- **The gaze is the real iris, moved** - `tools/hero-gaze.py`. Every
  sideways-gaze frame in the take is motion-blurred (eye Laplacian variance
  45-90 vs 633 on frame 31), so eyes are not borrowed from other frames. A 1-D
  horizontal warp inside each eye opening slides the iris intact, stretches
  the sclera on one side, and fades out above/below so lids and brows stay.
  Pixels outside the warp are copied bit-exact - the spline otherwise rounds
  some by 1, enough to flip thresholds in the illustration.
- **Eye sprites, not cross-fades.** `photo-eyes.webp` / `fantasy-eyes.webp` are
  9 rows (gaze 0..8px) of just the eye strip; the step follows the seam
  (`GAZE_FULL_AT 0.55`), so the eyes slide instead of ghosting.
- **The illustration is the reference's look, computed** -
  `tools/hero-illustrate.py`, seed 9. Head (skin + hair) only; clothes stay
  photographic. Paper white base, dry-brush strokes in the reference palette
  (teal `#93BEC0`, mustard `#E2B055`, blush `#E8B9AC`, coral `#C94A3F`, sampled
  off the recording) with bristle gaps at the edges and a drying tail, paint
  flecks, solid black ink from the frame's own darks on top, the whites of the
  eyes kept paper so the gaze reads, and dry strokes on the wall behind the
  frame-left shoulder. No generated face anywhere.
- **The photo half is graded like the reference's** - `tools/hero-grade.py`,
  applied to the photo, every photo gaze step, and the photographic parts of
  the illustration (backdrop arg of `hero-illustrate.py`, so the seam stays
  invisible on wall and suit). Measured on the reference's real half: skin
  saturation 40 (ours was 75), skin mean RGB 185/170/155 (ours 193/153/137,
  pinker), darks at true black (ours bottomed out at L 59). Grade: saturation
  x0.40, warm shift +1/+1/-7, levels on luminance only 52->0 / 224->255,
  gamma 0.96. Result: saturation 42, skin 186/170/155, hair at ink black.
  Ink and masks are still computed from the *ungraded* frame.
- **Seam travel is measured.** Head spans x 0.382-0.613; the illustration
  differs from the photo only within x 0.209-0.614. `TOWARD_PHOTO` crosses the
  face over 88% of the travel and then clears the wall splashes; full reveal at
  `FADE_AT` (0.8), the same point the opposite label is gone.
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
| `public/images/hero/photo.webp` | frame 31, the photograph half, 75KB |
| `public/images/hero/fantasy.webp` | frame 31 illustrated, 88KB |
| `public/images/hero/photo-eyes.webp` / `fantasy-eyes.webp` | 256x864 sprites, 9 gaze steps each |
| `unused-media/hero-allintra-2s.mp4` | the retired scrubbed hero clip (all-intra), kept in case the video hero returns |
| `unused-media/hero-original-6s.mp4` | the untrimmed 6s take, kept for re-measuring |
| `public/video/footer.mp4` | 1.23MB, transcoded from a 14MB 4K source |
| `public/brand/logo-bb.png` | ink monogram, for light surfaces (header over hero) |
| `public/brand/logo-bb-light.png` | white monogram, for the dark page |
| `public/images/about-hospitality.jpg` | the only About image still used |
| `public/images/about-markets.jpg` | unused since About was condensed |
| `public/images/about-code.jpg` | unused since About was condensed |
| `public/images/certificate-trading.webp` | 1800px wide, 87KB, from `Desktop/ax/SamadiCapital-Certificate-SCA-TR-2026-000001.png` |
