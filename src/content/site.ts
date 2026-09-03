/**
 * Every string the site renders lives here.
 */

export type NavItem = { label: string; href: string };

export const NAV: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export type Social = "linkedin" | "twitter" | "telegram" | "instagram";

export const SOCIALS: { network: Social; href: string }[] = [
  {
    network: "linkedin",
    href: "https://www.linkedin.com/in/babak-baghaei-30155b421/",
  },
  { network: "twitter", href: "https://x.com/Babak_Baqaei" },
  { network: "telegram", href: "https://t.me/babakbaghaei_1994" },
  { network: "instagram", href: "https://instagram.com/babak_baqaei" },
];

export const FOOTER_LINE =
  "Get in touch with me via social media or send me an email.";

/**
 * Where the contact form posts.
 *
 * This is FormSubmit's opaque alias for the destination inbox, issued after the
 * form was activated - deliberately NOT the address itself, so the real email
 * never appears in this public source or in the built bundle where scrapers
 * would harvest it. FormSubmit maps the alias to the inbox on its side.
 *
 * To move to another provider (Formspree, Web3Forms, EmailJS, your own
 * endpoint), change this one URL: the form posts plain JSON and expects JSON
 * back.
 */
export const CONTACT_ENDPOINT =
  "https://formsubmit.co/ajax/772b1d4426ecf299456360f4a431c21d";

/** Personal mark. `light` is the white cut, for use on the dark page. */
export const LOGO = {
  src: "/brand/logo-bb-light.png",
  original: "/brand/logo-bb.png",
  alt: "Babak Baghaei",
  ratio: 1024 / 806,
};

export const YEAR = new Date().getFullYear();
