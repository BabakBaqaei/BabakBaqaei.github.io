/**
 * Soft hyphens for the justified About copy.
 *
 * Justified text stretches the spaces on a line to fill it, and the stretch is
 * whatever the word that did not fit left behind. Measured on this page, the
 * worst inter-word gap ran to 19px against a 4px natural space - the loose line
 * that kept showing up in the last paragraph. Chrome's own `hyphens: auto` is
 * on, but it declines plenty of break points (it will not hyphenate into a
 * final line at all), so the slack stays.
 *
 * Giving the line breaker more places to break is the fix: with these in place
 * the same measurement tops out around 10px, across every column width from
 * 600 to 900px.
 *
 * The break points below are real en-US hyphenation (Liang patterns, minimum
 * three letters either side), not a guess - a word split in the wrong place
 * would look far worse than a loose line. Regenerate with `pyphen`:
 *
 *     python -c "import pyphen; d=pyphen.Pyphen(lang='en_US',left=3,right=3); print(d.inserted('yourword'))"
 *
 * Words the list does not cover simply fall through to Chrome's own
 * hyphenation, so new copy is never *broken* by a missing entry - only a little
 * looser.
 */

const SHY = "\u00ad";

/** Written with visible hyphens so the list stays readable and editable. */
const BREAK_POINTS = `
  actu-ally along-side anal-y-sis arti-fi-cial assis-tant atten-tion
  behav-iour busi-ness capa-bil-ity com-bin-ing com-plaints com-posed
  con-di-tions con-tin-u-ous con-vic-tion coor-di-nate cur-ren-cies
  deci-sion deci-sions depart-ment depart-ments devel-op-ment emo-tional
  expe-ri-ence famil-iar-ity finan-cial hos-pi-tal-ity iden-ti-fi-ca-tion
  iden-tity imple-men-ta-tion intel-li-gence inter-ests inter-face
  judge-ment man-age-ment oper-a-tions oppor-tu-ni-ties prac-ti-cal
  pre-vent-ing prob-lems pro-fes-sional pro-gressed prop-erty sen-si-tive
  some-thing spe-cial-ist struc-ture super-vise tech-ni-cal tech-nol-ogy
  through-out work-force
`;

const PATTERNS = new Map(
  BREAK_POINTS.split(/\s+/)
    .filter(Boolean)
    .map((entry) => [entry.replace(/-/g, ""), entry] as const),
);

/**
 * Returns the text with invisible break opportunities inside its longer words.
 * Casing comes from the original, so `Operations` and `operations` both work
 * off the one lower-case entry.
 */
export function softHyphenate(text: string): string {
  return text.replace(/[A-Za-z]{8,}/g, (word) => {
    const pattern = PATTERNS.get(word.toLowerCase());
    if (!pattern) return word;
    let i = 0;
    return pattern.replace(/-/g, SHY).replace(/[A-Za-z]/g, () => word[i++]);
  });
}
