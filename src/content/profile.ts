/**
 * Who he is, in words: the lines used on the opening screen, the About sheet
 * in the menu, the contact sheet and the case-study pages.
 *
 * Nothing here is invented. The copy is the approved deck in
 * docs/PORTFOLIO_PLAN.md (Appendix A); the credentials are the ones in his
 * own CV (scripts/cv-content.mjs). A value nobody has confirmed yet is `null`
 * and is simply not shown; each one is marked TODO(owner) with the number of
 * the open question in the plan.
 */

export type Credential = {
  /** The small label above it. */
  label: string
  /** What it is, in a few words. */
  title: string
  /** Where or who: the institution or the organiser. `null` = not confirmed yet, not shown. */
  where: string | null
  /** When. `null` = not confirmed yet, not shown. */
  when: string | null
  /** One plain line under it. */
  note?: string
}

export const profile = {
  /** The one-line descriptor on the opening screen, set as small capitals. */
  descriptor: ['Creative full-stack developer', 'Web experiences', 'Education'],
  /** The human version of the same thing: the headline of the About sheet. */
  headline: 'I build expressive interfaces and the systems behind them.',
  /**
   * The status line on the opening screen.
   * TODO(owner) D2: replace with "Open to remote frontend roles & select collaborations"? Kept as it was until then.
   */
  availability: 'Available for select work — 2026/27',
  about:
    'I’m a creative full-stack developer based in Tbilisi, Georgia. I design and build interactive websites, web applications, and the systems that make them work. From an immersive furniture showroom to a platform for Georgian digital creators and tools used in real classrooms, I enjoy taking ideas from the first sketch to a working product. I also teach web development fundamentals at university, which keeps me close to both the craft and the people learning it.',
  /** Three short proof lines, set as small capitals near the About text. */
  proof: ['Independently built, end to end', 'Live client work & active product pilots', 'Design, engineering & education'],
  credentials: [
    {
      label: 'Teaching',
      title: 'University lecturer',
      // TODO(owner) D3: the university, the exact title and the start year. Not shown until confirmed.
      where: null,
      when: null,
      note: 'Teaching web development fundamentals. Building classroom tools informed by direct student feedback.',
    },
    {
      label: 'Hackathon',
      // From his CV. TODO(owner) D4: confirm this wording and the event names.
      title: 'Winner, “AI for Businesses” hackathon',
      where: 'Georgian Chamber of Commerce and Industry',
      when: '2026',
    },
    {
      label: 'Conference',
      // From his CV. TODO(owner) D4: confirm (the plan calls it "GITEX AI Berlin 2026").
      title: 'GITEX AI Europe, participant',
      where: 'Berlin, Germany',
      when: '2026',
    },
    {
      label: 'Education',
      // From his CV.
      title: 'BSc Computer Science, now MSc student',
      where: 'Georgian Technical University',
      when: '2022 to now',
    },
  ] as Credential[],
  /** The paragraph above the ways to reach him on the contact sheet. */
  contactIntro:
    'Have an ambitious interface, a product to launch, or a team that needs a developer who understands both design and engineering? I’d love to hear about it.',
}
