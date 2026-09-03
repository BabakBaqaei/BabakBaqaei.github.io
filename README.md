# Personal site — Babak Baghaei

React 19 + TypeScript + Vite + Tailwind v4, shadcn structure. English only for now.

```bash
npm install
npm run dev      # this repo's launch config uses port 5180
npm run build    # tsc --noEmit && vite build
npm run preview
```

## Where the words go

**There is no copy on the site yet — that was the brief.** Every text position is
a visible `ContentSlot` saying what belongs there, rather than filler that would
hide how much room each block actually has.

Two files hold everything you will edit:

| file | holds |
|---|---|
| `src/content/site.ts` | nav items, social URLs, contact email, year |
| `src/content/labels.ts` | the two hero role labels + the measured face landmarks |

## Footer background clip

`public/video/footer.mp4` sits behind the footer at 50% opacity.

Two things about it are deliberate:

**It is 1.23MB, down from 14MB.** The source was 3828x2164; re-encoded to 1920
wide, x264 `-preset slow -crf 26`, audio stripped, `+faststart`. A 91% cut with
no visible difference at 50% opacity behind a scrim. ffmpeg was installed for
the transcode and removed again — it is not a project dependency.

**It is still not loaded on page load.** The element has no `src` until the
footer comes within a screen of the viewport, so visitors who never scroll that
far never download it. Proximity is measured with `getBoundingClientRect`,
watched on scroll *and* on a 400ms diffed poll — arriving straight at `#contact`
moves the element into view without firing a scroll event, and without the poll
the clip would never attach. The poll stops the moment it hits. `Reveal` carries
the same guard for the same reason.

**50% opacity alone was not enough.** The clip averages luma 17, but its
brightest patch — the sunlit limb of the Earth — measures 192, compositing to
102 and dropping footer text to **2.1:1**. That band drifts as the clip loops,
so text would fade in and out of legibility. A 45% scrim over the clip holds the
composite at luma 61, and footer text was lifted off `muted-foreground`.
Measured against the brightest frame: tagline **8.8:1**, copyright **6.4:1**,
form labels **9.8:1**.

Worth compressing: re-encoded at 1080p this file would be roughly 1–2MB with no
visible difference at 50% opacity behind a scrim.

## About images

Three photographs in `public/images/`, one per discipline, paired in
`src/content/about.ts` so the text and its image never drift apart.

Sources were 2.3–2.4MB each; resized to 1100px wide and re-encoded as
progressive JPEG at q82, which brought them to 132–167KB with no visible loss.
All three are cropped to one 4:5 box via `object-cover`, with a per-image
`position` focal point, so the rhythm stays even although the originals have
different proportions. The sides alternate down the page.

They are **not** `loading="lazy"` on purpose: lazy loading leans on the same
viewport machinery that has already been seen to never fire in embedded
webviews, and 460KB total is not worth the risk of an image never appearing.

## Contact form — one manual step

The footer form posts to **FormSubmit**, which relays messages to
`CONTACT_EMAIL` with no account and no server of ours.

**It does not deliver until the address is activated.** The first submission
makes FormSubmit email `babakbaqaei7@gmail.com` an activation link; click it
once and every message after that arrives normally. Send yourself one test to
trigger it.

Worth knowing: messages pass through formsubmit.co, so a third party handles
them in transit. To move to another provider (Formspree, Web3Forms, EmailJS, or
your own endpoint) change `CONTACT_ENDPOINT` in `src/content/site.ts` — the form
posts plain JSON and only expects JSON back.

Verified without sending anything, by intercepting `fetch`: the request goes to
`https://formsubmit.co/ajax/babakbaqaei7@gmail.com` as a POST carrying
`{name, email, message, _subject, _captcha}`. Success swaps the form for a
confirmation; failure keeps the form, re-enables the button and shows the
address so a message is never silently lost.

## Logo

`public/brand/` holds two cuts of the BB monogram, both with the background
removed from the supplied JPEG:

| file | use |
|---|---|
| `logo-bb.png` | original ink `#32373E` — for light surfaces, and what the header shows over the portrait |
| `logo-bb-light.png` | white — for the dark page and the footer badge |

Background removal was done by luminance rather than a colour key: alpha is how
far each pixel travels from the paper level toward the ink level, so antialiased
edges keep their softness instead of going jagged. The empty margin is trimmed
so the mark fills its own box, and `LogoMark` sizes from height with width
following the file ratio, so it can never be stretched.

`Icons` from the registry is gone — the monogram replaced the placeholder slash
mark in both header and footer.

## Structure

```
Header (fixed)          About  ·  Experience  ·  Contact
PortraitHero            mouse-tracked clip + role labels, one screen tall
About                   three blocks, one per discipline
Experience              career rail, newest first
Capabilities            skills grouped by discipline
Credentials             degree + certificates
StackedCircularFooter   id="contact" — this *is* the contact section
```

Experience, Capabilities and Credentials are all driven by
`src/content/resume.ts`, translated from the CV PDF. That file carries the
Persian-to-Gregorian date conversions and a TODO list of what still needs
confirming.

There is no separate Contact section. The social links and the email form live
in the footer, so a Contact section above it would only have repeated them; the
header's Contact link targets the footer's `id="contact"`, and `scroll-mt-16`
lands it just under the fixed header.

`PageFrame` and `RadialBackground` are fixed overlays covering the whole
document.

## The three components from the brief

| component | kept | changed, and why |
|---|---|---|
| `tailwind-css-background-snippet` | the gradient verbatim: `radial-gradient(125% 125% at 50% 10%, #000 40%, #63e 100%)` | split out a `RadialBackground` layer — the site needs it behind scrolling sections, not as one standalone screen |
| `shine-border` | component unchanged | mounted as a **fixed** frame (`PageFrame`), since a border around a scrolling document would run off screen. A faint constant ring sits under it: alone, the shine is only visible where the highlight currently is, which reads as a flicker rather than a frame |
| `stacked-circular-footer` | layout unchanged | `bg-transparent` instead of `bg-background`, so the radial runs unbroken into the footer; nav pulled from `site.ts`; form disabled until an address exists |
| `header-1` | scroll-reactive backdrop, mobile portal menu | Sign In / Get Started and the foreign wordmark dropped as instructed; nav is About / Portfolio / Contact. **`fixed` instead of `sticky`** — a sticky header still occupies a row in the flow, which pushed the full-height hero down by its own height and cropped the portrait |

Registry files that the snippets referenced but did not ship — `use-scroll`,
`menu-toggle-icon` — are written here. `icons.tsx` is trimmed to the one mark
the site renders instead of a dozen unused brand logos. lucide v1 has no brand
icons, so the footer's four are drawn in `brand-icons.tsx` to lucide's own
convention.

## Tailwind v4 note

The brief's `tailwind.config.js` snippet for the shine animation has no
equivalent file here — v4 configures in CSS. The keyframes, `bg-shine-size` and
`animate-shine` live in `src/index.css`. `bg-shine-size` is declared with
`@utility` on purpose: the component references it as a string, so it would
otherwise be tree-shaken away.

## Colour

Everything is keyed to the one fixed decision in the brief, the `#000 → #63e`
gradient. Contrast measured against the page background:

| token | value | ratio |
|---|---|---|
| foreground | `#F4F3F7` | 18.9:1 |
| muted-foreground | `#9D99B5` | 7.3:1 |
| violet (type) | `#A98BFF` | 7.5:1 |
| primary | `#6633EE` | 3.1:1 — **fill only, never body text** |

## Head tracking

See `src/content/labels.ts` and `src/hooks/useFaceLayout.ts`. Landmarks were
measured off the clip, not guessed:

| landmark | normalised | how |
|---|---|---|
| `EYE_Y` | 0.34 | guide line drawn over the frame, checked against the pupils |
| `HEAD_LEFT` | 0.344 | widest head extent inside the eye band, unioned over the turn poses |
| `HEAD_RIGHT` | 0.623 | same |

Clip time comes from the cursor's absolute X across a measured window
(2.35s fully left → 3.55s facing camera → 4.45s fully right), so the head points
at the cursor instead of drifting. Label opacity is driven by the same position
through CSS variables. Re-measure the landmarks if the clip is replaced.

On desktop the labels sit on the eye line in the clear space beside the head,
type auto-fitted to whichever gutter is tighter. Below `md` the head fills the
frame, so they drop to the foot of the portrait and invert to white over the
scrim.

## Viewport sizing — do not replace with `vh`

`--app-vw` / `--app-vh` are measured in JS (`useViewportSize`). Inside an
embedded webview the pane can resize **without the page ever receiving a
`resize` event** — measured: 673x794 → 1200x500 → 900x1000 with every listener
silent, which left a frozen strip of the old layout along the bottom. So the
size is observed with a `ResizeObserver` plus a diffed 250ms poll, not listened
for.

## Scroll restoration is off

`main.tsx` sets `history.scrollRestoration = "manual"` and scrolls to top when
there is no hash. Browsers otherwise restore the previous scroll position on
reload, and with a full-screen hero that drops you into the middle of the page
with the portrait scrolled off the top — which reads as if the hero had been
removed. Anchor links are untouched: a URL with a hash still jumps.

## Reveal on scroll

`ui/reveal.tsx` measures with `getBoundingClientRect` on scroll rather than
using an `IntersectionObserver`: in embedded webviews the observer can simply
never fire, and content starting at `opacity: 0` would then stay invisible.
