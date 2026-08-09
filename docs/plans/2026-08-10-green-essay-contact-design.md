# Green Essay and Contact Redesign

## Goal

Publish **Green: From Poison to Purity** as the first entry in a repeatable colour-essay series, and redesign Contact so it feels serious, calm and editorial while preserving its wording and links.

## Editorial structure

- Title: **Green: From Poison to Purity**
- Series: **The Secret Histories of Colour**
- Category: **Visual Culture**
- Status: published
- Source: `Green_From_Poison_to_Purity_Final.pdf`
- Preserve the English essay in full rather than summarising or rewriting it.
- Preserve the references attached to each section and retain the consolidated bibliography at the end.
- Use tags covering colour, visual culture, design history, green and pigments.
- Add optional `series` metadata to the essay content model and display it in the essay header. Essays without a series remain unchanged.

## Colour-series visual system

The selected direction combines the structure of **Pigment archive** with the upper rule of **Colour field**.

- A repeatable split composition becomes the visual system for the series.
- The title field takes the subject colour; for this essay it uses a deep editorial green.
- A fine upper rule carries the series name and issue number.
- Three tonal swatches evoke the historical movement from poisonous pigment to contemporary natural symbolism.
- The neutral paper colour, serif typography and restrained metadata connect the cover to the existing site.
- Future colour essays reuse the composition while changing the dominant field and swatches.
- Produce a responsive editorial SVG for site cards and a matching 1200 × 630 PNG for social sharing.
- The colour treatment belongs to the essay artwork only; the global site palette remains unchanged.

## Contact redesign

Use the approved **Editorial letter** direction.

- Replace the dark contact panel with the same cream paper background used by the rest of the site.
- Preserve the existing paragraph, LinkedIn URL and email address exactly.
- Use `Contact` as the page heading; do not introduce new promotional wording.
- Set the content in a narrow, letter-like column with generous vertical whitespace.
- Add a quiet upper rule and understated metadata treatment to create an editorial hierarchy.
- Present LinkedIn and Email as restrained text links with clear hover and keyboard-focus states.
- Show links in two columns on wider screens and stack them on mobile.
- Preserve semantic HTML, accessible link descriptions and the existing site navigation/footer.

## Integration

- The new published essay appears in the latest-publication flow, archive and Visual Culture category using the existing content-driven build.
- The essay gets canonical, Open Graph and social metadata through the existing page generator.
- The work stays on the current draft-PR branch so the existing Vercel preview updates before production is changed.

## Verification

- Add focused tests for series metadata, the new essay route/content, image assets and Contact markup.
- Run the full automated test suite and production build.
- Verify generated HTML contains the complete essay structure, per-section references, bibliography and correct metadata.
- Visually inspect Contact and the essay at desktop and mobile widths, including focus states and link behaviour.
- Inspect the SVG and social PNG for cropping, contrast and legibility.
