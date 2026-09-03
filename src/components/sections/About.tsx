"use client";

import { useState } from "react";
import { Container, SectionHead } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { SKILLS } from "@/content/resume";
import { softHyphenate } from "@/lib/hyphenate";
import {
  ABOUT_IMAGE,
  ABOUT_LEAD,
  ABOUT_MORE,
  CAPABILITIES_LABEL,
  READ_LESS,
  READ_MORE,
} from "@/content/about";

/**
 * The three skill groups, side by side.
 *
 * They sit under the Read more button and stay there whether it is open or
 * shut: closed, the lead paragraph alone left a tall empty column beside the
 * portrait, and this is the material that belongs in it.
 *
 * Three columns inside a 60%-wide text column is tight, so the type is set
 * smaller here than anywhere else on the page and the gaps are pulled in — the
 * alternative was a third group dropping onto its own row, which reads as a
 * mistake rather than a layout.
 */
function Capabilities() {
  return (
    <div className="mt-10 border-t border-border pt-8">
      <h3 className="text-[0.7rem] font-semibold tracking-[0.22em] text-violet uppercase">
        {CAPABILITIES_LABEL}
      </h3>

      <div className="mt-6 grid gap-x-5 gap-y-7 sm:grid-cols-3">
        {SKILLS.map((group) => (
          <div key={group.title}>
            <p className="text-[0.6rem] leading-[1.5] font-semibold tracking-[0.14em] text-foreground/55 uppercase">
              {group.title}
            </p>
            <ul className="mt-3 grid gap-1.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-1.5 text-[0.78rem] leading-[1.45] text-foreground/80"
                >
                  <span
                    aria-hidden
                    className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full bg-violet/70"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Text left, portrait hard against the right edge of the page.
 *
 * The section deliberately does not sit inside the usual Container: the image
 * has to reach the edge, so the grid runs full width and the text column
 * carries the container's own left inset instead
 * (max(page padding, half the leftover space beside a 72rem column)).
 *
 * "The edge" is the shine frame, not the viewport — the figure keeps a margin
 * wider than the frame's own inset so the picture stops just inside the rule
 * instead of running under it.
 *
 * The copy is justified, which it can only afford to be because of
 * `softHyphenate` - see that file for the measurements. The measure is wider
 * than it was (76ch rather than 62) for the same reason: more words on a line
 * means more gaps to share the slack between, and less stretch in each one.
 *
 * The row is `items-stretch` and the image is `h-full object-cover`, so opening
 * Read more grows the image with the column rather than leaving it stranded at
 * a fixed height while the text runs past it. That is also why the expanded
 * paragraphs are kept short.
 */
export function About() {
  const [open, setOpen] = useState(false);

  return (
    <section id="about" className="scroll-mt-24 py-[clamp(5rem,11vw,10rem)]">
      <Container>
        <SectionHead label="About" />
      </Container>

      <div
        className="grid items-stretch gap-10 md:grid-cols-[1fr_minmax(0,40%)] md:gap-12"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <div className="order-2 px-5 md:order-none md:pe-0 md:ps-[max(2rem,calc((100vw-72rem)/2+2rem))]">
          <Reveal>
            <p className="max-w-[76ch] hyphens-auto text-justify text-[clamp(1.02rem,1.35vw,1.2rem)] leading-[1.8] font-light text-foreground">
              {softHyphenate(ABOUT_LEAD)}
            </p>

            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="about-more"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm text-foreground/85 transition-colors duration-200 hover:border-violet hover:text-violet"
            >
              {open ? READ_LESS : READ_MORE}
              <span
                aria-hidden
                className="text-violet transition-transform duration-300"
                style={{ transform: open ? "rotate(180deg)" : "none" }}
              >
                &darr;
              </span>
            </button>

            <div
              id="about-more"
              hidden={!open}
              className="mt-8 grid gap-6 border-t border-border pt-8"
            >
              {ABOUT_MORE.map((paragraph, i) => (
                <p
                  key={i}
                  className="max-w-[76ch] hyphens-auto text-justify text-[1.0rem] leading-[1.8] font-light text-foreground/80"
                >
                  {softHyphenate(paragraph)}
                </p>
              ))}
            </div>

            <Capabilities />
          </Reveal>
        </div>

        <Reveal delay={120} className="order-1 md:order-none">
          {/* Grows with the column, but capped at a screenful and made sticky.
              Left uncapped it reached 506x1490 when Read more was open - a 0.34
              ratio that shaves the subject down to a strip. Capped, it fills the
              closed row exactly and then rides alongside the longer text. */}
          <figure className="me-3 h-full md:sticky md:top-24 md:me-4 md:h-[min(100%,calc(100svh-7rem))]">
            <img
              src={ABOUT_IMAGE.src}
              alt={ABOUT_IMAGE.alt}
              decoding="async"
              className="h-full min-h-[22rem] w-full rounded-2xl object-cover md:[mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.4)_10%,#000_32%)]"
              style={{ objectPosition: ABOUT_IMAGE.position }}
            />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
