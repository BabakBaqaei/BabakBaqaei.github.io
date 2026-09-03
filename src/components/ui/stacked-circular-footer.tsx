import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import { ContactForm } from "@/components/ui/contact-form";
import { FooterVideo } from "@/components/ui/footer-video";
import {
  InstagramIcon,
  LinkedinIcon,
  TelegramIcon,
  TwitterIcon,
} from "@/components/ui/brand-icons";
import { FOOTER_LINE, SOCIALS, YEAR, type Social } from "@/content/site";

type IconComponent = React.ComponentType<{ className?: string }>;

const NETWORK: Record<Social, { icon: IconComponent; label: string }> = {
  linkedin: { icon: LinkedinIcon, label: "LinkedIn" },
  twitter: { icon: TwitterIcon, label: "X" },
  telegram: { icon: TelegramIcon, label: "Telegram" },
  instagram: { icon: InstagramIcon, label: "Instagram" },
};

/**
 * The footer *is* the contact section — hence `id="contact"`, which the header
 * link targets. Social links and the email form are here, so a separate Contact
 * section above would only have repeated them.
 *
 * It paints no background of its own, so the page's radial gradient runs
 * unbroken into it, and the ambient clip sits between that and the content.
 *
 * Deliberately **not** `isolate`: the clip uses `mix-blend-screen` to blend with
 * the page behind the footer, and isolating this element would cut it off from
 * exactly the backdrop it needs to blend with. See `FooterVideo`.
 */
function StackedCircularFooter() {
  return (
    <footer
      id="contact"
      className="relative scroll-mt-16 overflow-hidden bg-transparent pt-20 pb-10 md:pt-24"
    >
      <FooterVideo />
      <div className="relative mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="flex flex-col items-center">
          <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-primary/15 ring-1 ring-border">
            <LogoMark height={30} />
          </div>

          {/* Wide enough to hold the sentence on one line; it still wraps on a
              phone, where one line is not possible at a readable size. */}
          <p className="mb-6 max-w-2xl text-center text-balance text-foreground/90">
            {FOOTER_LINE}
          </p>

          <div className="mb-10 flex space-x-3">
            {SOCIALS.map(({ network, href }) => {
              const { icon: Icon, label } = NETWORK[network];
              return (
                <Button
                  key={network}
                  asChild
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-transparent"
                >
                  <a href={href} target="_blank" rel="noreferrer">
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{label}</span>
                  </a>
                </Button>
              );
            })}
          </div>

          <div className="w-full max-w-3xl">
            <ContactForm />
          </div>

          <p className="mt-10 text-center text-sm text-foreground/70">
            &copy; {YEAR}
          </p>
        </div>
      </div>
    </footer>
  );
}

export { StackedCircularFooter };
