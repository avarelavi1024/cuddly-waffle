# Editorial Category Art Design

## Purpose

Refine the site's category artwork so the homepage feels coherent, elegant, serious and personal. The new system combines the structured character of an editorial archive with poetic symbols that give every section a distinct identity.

This is a contained visual evolution. It does not change the navigation, category structure, page copy or global colour palette.

## Art direction

The selected direction is **Editorial Archive + Poetic Symbols**.

Every category composition will share:

- a cream editorial field;
- a restrained block of colour drawn from the existing palette;
- a fine rule, category number and concise archival label;
- one simple, bespoke symbol representing the category;
- generous negative space;
- no more than two or three prominent colours;
- consistent proportions, line weight, typography and metadata placement.

The work should feel authored rather than decorative. Symbols may be suggestive rather than literal, but each must remain recognisable when displayed at card size.

## Category symbols

1. **Politics & Identity:** two profiles or opposing fields divided by a line, expressing identity, tension and public narratives.
2. **Mythologies:** a fragmented sun and vessel-like form, expressing inherited symbols and reinterpretation.
3. **Cities:** an irregular architectural grid, expressing urban structure, movement and belonging.
4. **Visual Culture:** a frame or eye containing another frame, expressing images, observation and visual mediation.
5. **Health:** balanced circles connected by a rhythmic organic line, expressing bodies, behaviour and equilibrium.
6. **Business:** an ordered network of nodes and connections, expressing systems, work and organisation.
7. **Open Questions:** an incomplete path or open aperture, expressing ideas that have not yet reached a conclusion.

The symbols must be visually distinct without becoming seven unrelated illustration styles.

## Relationship to the colour series

*The Secret Histories of Colour* remains a special subcollection inside Visual Culture. Its covers will continue to use pigment swatches and make the subject colour dominant.

The series will share the new system's editorial rules, numbering, metadata and typographic restraint, but it will not reuse the general Visual Culture symbol as its main image. This preserves a recognisable family while allowing each colour essay to develop its own chromatic identity.

## Application in the interface

The new artwork replaces the current abstract category SVGs wherever those assets appear, including the homepage category grid and category-page headers.

The category grid will become lighter and less capsule-like:

- cards use the shared editorial artwork rather than a dark overlay treatment;
- category names remain clearly readable and do not compete with the symbols;
- the artwork and title feel like one composed editorial unit;
- hover and keyboard-focus states remain clear but restrained;
- hover motion is limited to a subtle scale or symbol displacement, with no conspicuous rotation;
- the dark site section may remain as a contrasting field, but it must not overpower the artwork.

No unrelated sections are redesigned as part of this work.

## Colour and typography

The existing global palette is retained: cream, ink, terracotta, deep teal, dusty rose, olive and ochre. Each category receives a stable accent combination using at most three prominent colours.

Serif typography carries category names and expressive editorial hierarchy. Small sans-serif capitals carry numbering and archival metadata. The new system must reuse the site's existing font stack and design tokens rather than introduce a new visual language.

## Responsive behaviour

Artwork must remain legible and balanced at desktop, tablet and mobile widths. Symbols, numbers and labels must not be clipped when the card ratio changes. At narrow widths, compositions may simplify or reposition details, but they must preserve the same identity and reading order.

All decorative SVGs use suitable accessible treatment. Category names remain real text in the interface and are never conveyed only inside an image. Focus indicators meet the existing keyboard interaction standard.

## Technical boundaries

- Keep the artwork as repository-native SVG assets.
- Reuse the existing category data model and image paths where practical.
- Limit CSS changes to the category artwork, category tiles, relevant headers and their responsive/interaction states.
- Preserve existing routes and content rendering.
- Do not add image-generation dependencies, remote assets or new runtime libraries.

## Validation

The implementation is complete when:

- all seven category artworks follow the shared system and have distinct symbols;
- the colour-series treatment remains visibly special but related;
- category cards and headers display correctly at desktop and mobile widths;
- hover, focus and reduced-motion behaviour are appropriate;
- labels remain readable and symbols are not clipped;
- existing automated tests and the production build pass;
- visual comparison confirms that the revised homepage is calmer, more coherent and more editorial than the current version.
