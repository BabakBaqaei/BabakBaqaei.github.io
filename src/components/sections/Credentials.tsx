import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { CERTIFICATE_IMAGES, CERTIFICATES, type Credential } from "@/content/resume";

/** Small diagonal arrow for outbound links. */
function Outbound() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M5 11 11 5M6 5h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CredentialCard({ item }: { item: Credential }) {
  return (
    <li className="glass group flex h-full flex-col rounded-2xl p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-violet/40">
      <span className="font-mono text-[0.66rem] tracking-[0.16em] text-violet uppercase">{item.date}</span>
      <p className="mt-3 text-[1rem] leading-snug font-medium">{item.title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">{item.issuer}</p>
    </li>
  );
}

/**
 * The two Samadi Capital certificates as documents, side by side in glass
 * frames - the only credentials a stranger can verify, so they are shown, not
 * described - and the rest as a grid of glass cards beneath.
 *
 * The documents are cream on a near-black page, so they sit a little back
 * (opacity 0.9) inside their frame and come up to full strength on hover,
 * rather than glaring at full brightness against everything around them.
 */
export function Credentials() {
  const others = CERTIFICATES.filter((c) => !c.verify);

  return (
    <Section id="credentials" label="Certificates">
      <div style={{ fontFamily: "var(--font-heading)" }}>
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {CERTIFICATE_IMAGES.map((doc, i) => (
            <Reveal key={doc.src} delay={i * 90}>
              <figure className="glass group rounded-[22px] p-2.5 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_-24px_rgba(169,139,255,0.45)]">
                <a
                  href={doc.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Verify: ${doc.title}`}
                  className="block overflow-hidden rounded-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
                >
                  <img
                    src={doc.src}
                    alt={doc.alt}
                    width={1800}
                    height={1273}
                    decoding="async"
                    className="w-full opacity-90 transition-[opacity,transform] duration-700 group-hover:scale-[1.015] group-hover:opacity-100"
                  />
                </a>
                <figcaption className="flex items-center justify-between gap-4 px-2.5 pt-3.5 pb-1.5">
                  <span>
                    <span className="block text-[0.98rem] font-medium">{doc.title}</span>
                    <span className="mt-0.5 block text-xs text-foreground/55">{doc.caption}</span>
                  </span>
                  <a
                    href={doc.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-violet/30 bg-violet/10 px-3 py-1.5 text-xs text-violet transition-colors hover:bg-violet/20"
                  >
                    Verify <Outbound />
                  </a>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 md:mt-8 lg:grid-cols-3">
            {others.map((item) => (
              <CredentialCard key={item.title + item.date} item={item} />
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
