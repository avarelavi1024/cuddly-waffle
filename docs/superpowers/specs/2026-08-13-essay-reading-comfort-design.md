# Essay Reading Comfort Design

## Purpose

Make long essays more comfortable to read on desktop while preserving the established editorial identity, headline scale, homepage, and mobile presentation.

## Root cause

The desktop `.related` column uses `position: sticky` with a fixed top offset. This keeps “Read next” visually pinned while the main article scrolls and delays the column's natural movement until its containing grid reaches the end. The essay body also scales to a maximum of 23px, which feels oversized during sustained desktop reading.

## Related-reading behaviour

Remove sticky positioning from `.related` at all desktop widths. The column remains aligned to the top of the essay grid but moves naturally with the document from the beginning. Its cards, actions, spacing, and visual styling remain unchanged.

## Desktop typography

Use a balanced editorial scale for the essay body:

- Paragraph text and ordinary list content use `clamp(18px, 1.35vw, 20px)` with the existing generous line height.
- Bibliography and reference lists use `clamp(14px, 1.1vw, 16px)`.
- The smaller “Sources for this section” lists retain their current `13–15px` scale because they are already suitably restrained.
- Essay titles, section headings, block quotes, homepage text, cards, About, and Contact remain unchanged.

The existing mobile rule keeps essay body text at 18px, so the mobile reading experience does not become smaller.

## Verification

Add regression tests that reject sticky positioning for `.related` and assert the approved desktop body and reference scales. Run the full automated suite and production build, then inspect a long essay at desktop, laptop, and mobile widths. Confirm that “Read next” moves with the document and that text remains readable without horizontal overflow.

## Out of scope

No layout restructuring, content edits, title resizing, colour changes, card redesign, homepage changes, or mobile typography reduction.
