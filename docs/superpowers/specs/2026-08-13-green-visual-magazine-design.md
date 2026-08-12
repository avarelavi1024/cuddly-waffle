# Green Visual Magazine Design

## Direction

Transform only `Green: From Poison to Purity` into a restrained visual-research magazine while preserving its title, complete English essay text, per-section references, green cover identity, and the rest of the site's established visual system.

## Editorial system

- Use archival images only when their source and reuse status can be documented.
- Pair each archival image with a compact caption containing work, date, institution and rights note.
- Use original code-native editorial plates for pigment and contemporary greenwashing, avoiding unattributed stock imagery.
- Alternate full-width plates, asymmetric image-and-note arrangements and quiet pull quotes; never interrupt every paragraph.
- Keep the reading column comfortable and all figures responsive. On small screens, visual pairs become a single column.
- Do not claim a depicted dress or wallpaper contains arsenic unless its collection record confirms testing.

## Content model

Markdown gains an explicit figure directive:

`![alt text](local-image-path "caption")`

The renderer emits semantic `figure`, `img`, and `figcaption` markup. The Green essay receives a dedicated `visualEdition: true` frontmatter flag so magazine styling does not alter older essays.

## Visual sequence

1. Existing green series cover and title.
2. Original pigment study plate near the material history sections.
3. Public-domain Scheele portrait near the arsenical pigment section.
4. Public-domain historical wallpaper specimen near the domestic interior discussion.
5. Public-domain nineteenth-century green silk dress near fashion and desire.
6. Original abstract greenwashing plate near the contemporary reinvention section.

## Accessibility and performance

- Every image has meaningful alt text; decorative marks remain CSS/SVG details.
- Captions remain readable without hover.
- Local image assets are optimized and copied by the existing build.
- Figures never create horizontal scrolling or sticky secondary panes.

