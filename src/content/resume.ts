/**
 * Career, skills and credentials.
 *
 * Hospitality entries come from the CV (MyResume-186), translated.
 *
 * TODO with Babak:
 *   - Markets start year is derived from "close to four years" in his own bio.
 *     Web work has no date at all yet — both need confirming.
 *   - Borj-e Saat (Aug 2022 - Feb 2023) falls inside the Mizban post
 *     (May 2020 - Jun 2026). Concurrent, a secondment, or a date to fix?
 *   - Institution names are translations; confirm official English forms.
 *   - English proficiency level: the CV shows bars, not words.
 */

export type Role = {
  title: string;
  place: string;
  meta?: string;
  period: string;
  /** Room counts and headcount. Not rendered - the Experience rail was cut back
      to headings, and About already carries these numbers in prose. */
  scale: string[];
};

/**
 * Oldest first - the order the Experience rail reads in, so a straight
 * `.map()` climbs the career instead of walking back down it.
 *
 * Sorted by start date, which is why Borj-e Saat sits *inside* the Mizban span
 * rather than after it. That overlap is on the CV and still needs confirming.
 */
export const ROLES: Role[] = [
  {
    title: "Front Desk Agent",
    place: "Mizban Hotel, Babolsar",
    meta: "Five star",
    period: "Mar 2019 - May 2020",
    scale: ["224 rooms"],
  },
  {
    title: "Assistant General Manager & Operations Manager",
    place: "Mizban Hotel, Babolsar",
    meta: "Five star",
    period: "May 2020 - Jun 2026",
    scale: ["224 rooms", "80-150 staff"],
  },
  {
    title: "Operations Manager",
    place: "Borj-e Saat Hotel, Babolsar",
    meta: "Three star / pre-opening",
    period: "Aug 2022 - Feb 2023",
    scale: ["64 rooms", "40 staff"],
  },
  {
    title: "Financial Markets Analyst & Trader",
    place: "Independent",
    meta: "Crypto & blockchain",
    period: "2022 - Present",
    scale: ["4 years", "150+ journaled trades"],
  },
  {
    title: "Web Designer & Developer",
    place: "Independent",
    meta: "Vibe coding",
    period: "Present",
    scale: ["AI-assisted", "UI/UX"],
  },
];

export type SkillGroup = { title: string; items: string[] };

export const SKILLS: SkillGroup[] = [
  {
    title: "Hospitality operations",
    items: [
      "Hotel management",
      "Front desk & reservations",
      "Harris PMS",
      "Service quality control",
      "Guest relations",
      "Hotel marketing",
    ],
  },
  {
    title: "Financial markets",
    items: [
      "Technical analysis",
      "Trend & market structure",
      "Risk & capital management",
      "Trade journaling",
      "Market sentiment",
      "Crypto & blockchain",
    ],
  },
  {
    title: "Web & AI",
    items: [
      "Vibe coding",
      "UI/UX design",
      "AI-assisted development",
      "Responsive front-end",
      "Brand identity",
      "Motion & interaction",
    ],
  },
];

export type Credential = {
  title: string;
  issuer: string;
  date: string;
  note?: string;
  verify?: { label: string; href: string };
};

/**
 * Kept, but no longer rendered: the credentials section was cut back to
 * certificates alone. Restore it here rather than re-translating the CV if the
 * degree is ever wanted back on the page.
 */
export const EDUCATION: Credential[] = [
  {
    title: "BA, English Language Teaching",
    issuer: "Mazandaran University of Science and Technology, Babolsar",
    date: "Sep 2012 - Jun 2016",
  },
];

export const CERTIFICATES: Credential[] = [
  {
    title: "Certificate of Trading Proficiency",
    issuer: "Samadi Capital Academy - Professional Trading Mentorship",
    date: "Jul 2026",
    note: "Awarded for disciplined, documented execution across at least 150 journaled trades under direct mentorship.",
    verify: {
      label: "SCA-TR-2026-000001",
      href: "https://samadicapital.com/verify/SCA-TR-2026-000001",
    },
  },
  {
    title: "Professional Conduct and Business Etiquette",
    issuer: "Mizban University of Applied Science and Technology",
    date: "Jun 2024",
  },
  {
    title: "Hotel Management",
    issuer: "Mazandaran Technical and Vocational Training Organization",
    date: "Jun 2022",
  },
  {
    title: "Front Desk Agent",
    issuer: "Mazandaran Technical and Vocational Training Organization",
    date: "Jun 2022",
  },
];

/**
 * The trading certificate itself, shown beside the list. It is the only
 * credential on the page a stranger can check independently, so it is the one
 * worth showing rather than describing.
 */
export const CERTIFICATE_IMAGE = {
  src: "/images/certificate-trading.webp",
  alt: "Certificate of Trading Proficiency awarded to Babak Baghaei by Samadi Capital Academy on 13 July 2026, certificate ID SCA-TR-2026-000001.",
  href: "https://samadicapital.com/verify/SCA-TR-2026-000001",
};
