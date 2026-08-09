# Editorial Foundation Design

## Objective

Strengthen Ana Varela Vilariño's personal editorial website as a professional, maintainable archive for essays shared primarily through LinkedIn. Preserve the existing English-language identity, visual style, colour palette, static Markdown workflow, public URLs, GitHub repository, and Vercel deployment.

The project should remain simple to operate: Ana provides a finished essay or draft, the essay is added as Markdown, the site is verified, and a push to GitHub triggers the Vercel deployment.

## Scope

This work improves the editorial foundation without migrating frameworks or introducing a CMS, database, authentication, accounts, or an administrative interface.

The existing About and Contact copy remains unchanged unless verification finds a material punctuation, accessibility, or link defect. Existing public essay URLs must remain stable because they may already have been shared on LinkedIn.

## Publishing Model

Each essay remains a Markdown file in `content/essays`. Its frontmatter provides the structured information required by the site:

- title and subtitle;
- publication date and year;
- category and tags;
- homepage/archive excerpt;
- editorial image;
- featured and curated flags;
- publication status.

The supported publication states will have explicit behaviour:

- `published`: included in listings, category pages, metadata, sitemap, and a public essay route;
- `coming-soon`: shown as an upcoming item where appropriate but without a generated public essay page;
- `draft`: excluded from all public pages and production outputs.

The build must fail with a clear, actionable message when required metadata is missing, malformed, inconsistent, or refers to a missing asset. Dates determine chronological ordering, while an explicit featured flag determines the lead item on the homepage.

A reusable essay template and concise publishing guide will document the accepted metadata, structure, references, and publication steps.

## Markdown and Long-Form Content

The Markdown renderer will continue to escape raw HTML. It will be expanded only for editorial constructs needed by the essays:

- ordered and unordered lists;
- block quotations;
- thematic breaks;
- links and emphasis;
- section headings;
- reference sections.

The implementation should remain intentionally small and testable. It must not evolve into a general-purpose Markdown engine unless a future essay requires additional syntax.

## Code Structure

The current large template module will be separated by responsibility while preserving generated markup and URLs:

- site configuration and canonical production URL;
- shared page shell, header, footer, and reusable cards;
- homepage, project, category, essay, About, Contact, and error-page renderers;
- social and document metadata;
- editorial content loading and validation;
- build orchestration and asset generation.

Module boundaries should expose small functions with explicit inputs. Content loading must not depend on page templates, and metadata generation must not duplicate publishing rules.

## Professional Presentation and LinkedIn Sharing

Every public page will include complete, absolute metadata based on `https://ana-varela.vercel.app`:

- canonical URL;
- Open Graph title, description, URL, type, and image;
- Twitter/X card metadata;
- author and article publication data where applicable.

LinkedIn sharing will use raster social images with suitable dimensions rather than relative SVG references. The site will have a default social image, while published essays may specify an essay-specific social image. If an essay does not provide one, the default is used.

A favicon and minimal browser identity assets will be added without changing the visual language. A themed 404 page will provide routes back to the homepage and project archive.

Basic `sitemap.xml` and `robots.txt` outputs will be generated as professional infrastructure. Only canonical published pages will enter the sitemap; drafts, coming-soon routes, and duplicate archive aliases will not.

## Accessibility and Responsive Behaviour

The current desktop and mobile compositions and selected colours remain intact. Improvements are limited to details that increase robustness:

- meaningful alternative text where an image communicates content, and empty alternative text where it is decorative;
- visible keyboard focus states;
- semantic heading and landmark order;
- accessible labels for interactive controls;
- adequate touch targets on mobile;
- `prefers-reduced-motion` support for the thematic marquee and rotating questions;
- typography and spacing corrections for long essays where verification identifies a concrete issue.

The thematic marquee remains part of the design. With reduced motion enabled it becomes a static, horizontally scrollable list. Automatic question rotation stops, while the manual Rotate control remains available.

## Build and Data Flow

The production flow remains:

1. Read Markdown files and site configuration.
2. Parse and validate frontmatter and content.
3. Select only content allowed for each public surface.
4. Render pages and metadata.
5. Copy images and browser assets.
6. Generate `sitemap.xml` and `robots.txt`.
7. Verify the generated output.
8. Let Vercel publish `dist` after a GitHub push.

The build writes to a fresh `dist` directory so stale pages from drafts or removed content cannot survive between builds.

## Error Handling

Validation errors must identify the source Markdown file, invalid field, and expected correction. The build must stop instead of publishing partial output when:

- required frontmatter is absent;
- an unsupported status is used;
- dates or years disagree;
- slugs or routes collide;
- a referenced image is missing;
- multiple essays are marked as featured;
- a published essay has no substantive body.

An empty category is valid and renders its existing empty state. A published essay without related content is also valid and keeps the current fallback message.

## Verification

Automated tests will cover:

- frontmatter parsing and validation;
- all supported publication states;
- chronological and featured selection;
- Markdown constructs and raw HTML escaping;
- suppression of draft and coming-soon essay routes;
- canonical and social metadata;
- sitemap membership;
- missing internal assets and broken generated internal links;
- preservation of current public routes.

Before changes are considered complete, the production build and full test suite must pass. The generated homepage, project archive, one category, one published essay, About, Contact, and the 404 page must be checked at desktop and mobile widths. LinkedIn metadata must use absolute URLs and raster images.

## Ongoing Essay Workflow

For each future publication:

1. Add or update the Markdown essay using the documented template.
2. Add its editorial image and optional social image.
3. Mark it `draft`, `coming-soon`, or `published` as intended.
4. Run validation, tests, and the production build.
5. Review the generated essay in desktop and mobile layouts.
6. Commit and push the publication to GitHub.
7. Confirm the Vercel deployment and shared-page metadata.

This workflow keeps each new essay a small, predictable update while the site remains a coherent long-term editorial archive.
