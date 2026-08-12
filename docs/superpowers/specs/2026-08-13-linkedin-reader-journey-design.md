# LinkedIn Reader Journey Design

## Purpose

Help a first-time visitor arriving from LinkedIn understand Ana's editorial point of view, reach the newest publication immediately, and have a clear next step after finishing an essay. Preserve the existing serious, personal editorial identity.

## Homepage

Keep the current hero structure, palette, typography, category marquee, and introductory copy. Add a short positioning line beneath the introduction:

> Research-led essays on culture, design, health and the systems behind everyday life.

Add a restrained text link immediately after it:

> Read the latest essay →

The link is rendered only when a published featured or latest essay exists. It points directly to that essay. Rename the link beside “Latest publication” from “View projects” to “Explore the archive” so that its destination and purpose are clear.

## Essay ending

Retain the existing “Read next” area but turn it into a useful editorial continuation. Prefer up to two published essays in the same category. If no same-category essay exists, fill the available positions with other published essays. Draft and coming-soon entries never appear as recommendations.

Below the recommendations, add two restrained actions:

- “Browse the complete archive” linking to `/projects/`.
- “New essays are announced on LinkedIn” linking to Ana's existing LinkedIn profile in a new tab with safe external-link attributes and accessible new-tab text.

If there are no other published essays, show the existing empty-state message while still rendering both actions. This avoids a dead end even at the beginning of a new series.

## Visual treatment

Use the established paper, ink, terracotta, and teal system. The hero additions should read as editorial metadata and a text link, not as prominent marketing buttons. The essay actions should sit inside the current related-reading block with a subtle top rule and responsive wrapping. No new imagery or colour tokens are introduced.

## Accessibility and responsive behaviour

All actions remain normal links with visible focus styles inherited from the site. The external LinkedIn link includes `target="_blank"`, `rel="noopener noreferrer"`, and screen-reader text noting that it opens in a new tab. On narrow screens, the actions stack without creating horizontal overflow.

## Verification

Template tests will verify the exact positioning copy, correct latest-essay URL, archive wording, published-only fallback recommendations, and safe LinkedIn markup. Stylesheet tests will verify the responsive action layout. The full automated suite and production build must pass, followed by desktop and mobile visual inspection of the generated site.

## Out of scope

No newsletter, portrait, testimonials, counters, new categories, palette changes, image redesign, About copy changes, or Contact copy changes.
