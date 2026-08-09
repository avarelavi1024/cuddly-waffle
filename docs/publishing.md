# Publishing an essay

Use this checklist for every essay. The build reads Markdown only from `content/essays`; `content/essay-template.md` is a safe, non-public starting point and cannot be published from its current location.

## 1. Create the draft

Copy `content/essay-template.md` to `content/essays/<slug>.md`. The filename becomes the public URL, so use lowercase words separated by hyphens: `content/essays/example-essay.md` becomes `/essays/example-essay/` when published.

Complete these required frontmatter fields:

- `title`, `subtitle`, `excerpt`: reader-facing text used by pages and metadata.
- `date`: a real date in `YYYY-MM-DD` format.
- `year`: the four-digit year from `date`; the two values must match.
- `category`: the archive category name.
- `tags`: an array, such as `["culture", "society"]`.
- `image`: an editorial image path under `src/images`.
- `status`: exactly `draft`, `coming-soon`, or `published`.

Optional fields control presentation:

- `socialImage`: a share-card PNG under `src/images`. If omitted, the site uses the default social image.
- `curated`: reserved for future presentation controls; it is loaded today but does not change the generated site.
- `featured`: set to `true` for the featured published essay. At most one published essay may be featured.

Published essay bodies must contain at least 20 words. The page renderer creates the single `#` title from frontmatter, so begin the Markdown body with prose or a `##` section. Use `##` for sections and `###` for subsections such as References.

## 2. Choose the publication status

| Status | Public listings | Essay route | Sitemap |
| --- | --- | --- | --- |
| `draft` | Hidden | Not generated | Excluded |
| `coming-soon` | Shown as a disabled upcoming item | Not generated | Excluded |
| `published` | Shown with a working link | Generated at `/essays/<slug>/` | Included |

Start new work as `draft`. Use `coming-soon` only when the title should appear publicly before the essay is readable. Change to `published` only after the content, metadata, images, and local review are complete.

## 3. Add images

Put image files in `src/images` and refer to them as `images/<filename>` in frontmatter. Paths may use normalized subdirectories beneath `images/`, but schemes, traversal segments, backslashes, quotes and control characters are rejected. Editorial page images may be SVG. Social images must be PNG files exactly 1200 by 630 pixels; use a specific `socialImage` for an essay or rely on `images/social-default.png`.

Do not point frontmatter at files outside `src/images`. Before replacing `dist`, the production build checks the editorial and optional social image for every essay, including drafts and coming-soon entries, then copies `src/images` recursively. A missing file reports the source Markdown file and frontmatter field without deleting the previous output.

## 4. Test and build locally

From the project root, run:

```bash
npm test
npm run build
npm run verify
```

`npm test` validates content, templates, client behavior, metadata, builds, and the output verifier. `npm run build` recreates `dist` from scratch and automatically verifies it before succeeding. `npm run verify` reruns verification against the current `dist` directory.

The verifier reports all findings in one deterministic error: broken internal routes, missing local assets, non-absolute canonical or Open Graph image URLs, missing required metadata, and any essay route that lacks published-article metadata. Fix every finding and rerun all three commands.

## 5. Review the generated site

Run `npm run dev`, then inspect the local site at both 1280 x 800 and 390 x 844. Review:

- `/`
- `/projects/`
- every published `/essays/<slug>/` route
- `/about/`
- `/contact/`
- `/404.html`

Confirm that draft titles never appear, coming-soon items cannot be opened, and existing links still resolve. Check text wrapping, images, spacing, navigation, and overflow at both widths. Traverse every interactive element using the keyboard, confirm the focus indicator remains visible, enable reduced motion in the operating system and confirm automatic motion stops, and check the browser console and rendered document for errors.

## 6. Commit, push, and confirm Vercel

Review `git diff` and `git status`, then commit the essay, images, and any intentional supporting changes. Push the branch only when the publishing workflow has been authorized. Do not refresh social caches for an unreviewed or undeployed page.

After Vercel reports a successful production deployment, verify the live essay and these production outputs:

- the page canonical URL is absolute and matches its live URL;
- the `og:image` URL opens the intended 1200 x 630 PNG;
- `/sitemap.xml` includes published routes only;
- `/robots.txt` points to the production sitemap;
- a deliberately missing URL displays the custom 404 page.

Finally, paste each newly published essay URL into [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) to refresh its preview. Confirm the title, description, and image there before sharing the link.
