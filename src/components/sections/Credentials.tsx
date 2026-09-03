import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { CERTIFICATE_IMAGE, CERTIFICATES, type Credential } from "@/content/resume";

function Row({ item }: { item: Credential }) {
  return (
    <li className="grid gap-1 border-t border-border py-5 md:grid-cols-[1fr_auto] md:items-baseline md:gap-6">
      <div>
        <p className="text-[1.02rem] font-medium">{item.title}</p>
        <p className="mt-1 text-sm text-foreground/65">{item.issuer}</p>
        {item.note ? (
          <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-foreground/55">
            {item.note}
          </p>
        ) : null}
        {item.verify ? (
          <a
            href={item.verify.href}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs tracking-wide text-violet underline underline-offset-4 transition-opacity hover:opacity-75"
          >
            Verify - {item.verify.label}
          </a>
        ) : null}
      </div>
      <p className="text-sm whitespace-nowrap text-violet md:text-right">
        {item.date}
      </p>
    </li>
  );
}

/**
 * Certificates as a plain list on the left, with the trading certificate itself
 * facing them on the right.
 *
 * A list rather than cards: these are facts to be scanned, and a grid of boxes
 * would give each one more visual weight than it earns. The one document that
 * can be verified independently is shown as the artefact it is — a checkable
 * credential is worth far more than a claimed result — and the two columns are
 * centred against each other so neither hangs below the other.
 */
export function Credentials() {
  return (
    <Section id="credentials" label="Certificates">
      <div
        className="grid gap-10 md:grid-cols-[1fr_minmax(0,46%)] md:items-center md:gap-14"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <Reveal>
          <ul>
            {CERTIFICATES.map((item) => (
              <Row key={item.title + item.date} item={item} />
            ))}
          </ul>
        </Reveal>

        <Reveal delay={90}>
          {/* The document is cream on a near-black page, so it is framed and
              held slightly back rather than dropped in at full strength, which
              would glare against everything around it. No drop shadow: black on
              near-black is not depth, it is a smudge. */}
          <figure className="group">
            <a
              href={CERTIFICATE_IMAGE.href}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-xl ring-1 ring-border transition-transform duration-500 hover:scale-[1.02]"
            >
              <img
                src={CERTIFICATE_IMAGE.src}
                alt={CERTIFICATE_IMAGE.alt}
                width={1800}
                height={1273}
                loading="lazy"
                decoding="async"
                className="w-full opacity-90 transition-opacity duration-500 group-hover:opacity-100"
              />
            </a>
            <figcaption className="mt-3 text-xs tracking-wide text-foreground/50">
              Samadi Capital Academy &middot; issued 13 July 2026
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}
