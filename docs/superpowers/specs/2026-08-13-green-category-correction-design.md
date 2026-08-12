# Green Category and Labelling Correction Design

## Purpose

Correct misleading draft-oriented language in *Green: From Poison to Purity* and give its category a clearer, broader name for future essays about art, design, colour, images and material culture.

## Approved changes

- Remove the phrase **“A visual essay”** from the Green editorial cover. The resulting spacing will be rebalanced without changing the cover's established pigment-archive identity.
- Remove the complete **“Pull Quotes for the Visual Essay”** section from the published essay. These quotations are production notes rather than part of the finished text, and the useful quotations already appear within the essay.
- Rename **“Visual Culture”** to **“Art, Design & Visual Culture”** throughout the public category system.
- Update Green's category metadata and relevant tags to use the new wording.
- Preserve the category slug `/categories/visual-culture/` and existing image paths so published links remain valid.

## Content boundaries

The essay's main body, section references, consolidated bibliography, title, subtitle, series name, publication date and URL remain unchanged. No visual material is added, and the colour-series identity remains intact.

## Interface impact

The new category name appears wherever category metadata is rendered: category navigation, category cards, the Projects page, the category page, essay metadata and the Green cover's author/category line. Layout must continue to fit at desktop and mobile widths despite the longer label.

## Validation

- No public Green page or cover contains “visual essay” or “Pull Quotes for the Visual Essay”.
- The public name is consistently “Art, Design & Visual Culture”.
- The existing `/categories/visual-culture/` route continues to work.
- The Green essay retains all substantive sections, section-level references and consolidated bibliography.
- Automated tests, build and generated-output verification pass.
- Visual inspection confirms the longer category label and revised cover do not clip or crowd the layout.
