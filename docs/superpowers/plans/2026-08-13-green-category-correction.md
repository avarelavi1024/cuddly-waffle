# Green Category and Labelling Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove misleading visual-essay production language from Green and rename its category to Art, Design & Visual Culture without changing public URLs.

**Architecture:** Update the essay frontmatter/body, the stable category definition and the Green SVG cover behind their existing paths. Extend current content/template tests to make the wording, category name and preserved route explicit.

**Tech Stack:** Markdown frontmatter, static JavaScript templates, SVG, Node.js test runner.

## Global Constraints

- Preserve `/categories/visual-culture/` and all existing image and essay URLs.
- Preserve the main essay, section sources, consolidated bibliography and colour-series identity.
- Remove every public claim that Green is a visual essay.
- Use the public category name `Art, Design & Visual Culture` consistently.
- Add no dependencies and make no unrelated visual changes.

---

### Task 1: Define the correction contract

**Files:**
- Modify: `tests/build.test.js`
- Modify: `tests/templates.test.js`

**Interfaces:**
- Consumes: Green frontmatter/body, `categoryThemes`, `renderHomePage` and `renderCategoryPage`.
- Produces: regression coverage for wording, category naming and stable routing.

- [ ] Add assertions that Green uses category `Art, Design & Visual Culture`, contains no `Pull Quotes for the Visual Essay`, and still contains its bibliography and section sources.
- [ ] Add assertions that the category named `Art, Design & Visual Culture` retains slug `visual-culture`, maps the new category value and renders at `/categories/visual-culture/`.
- [ ] Assert that `src/images/editorial-green.svg` contains neither `A visual essay` nor `VISUAL CULTURE`, and does contain `ART, DESIGN &amp; VISUAL CULTURE`.
- [ ] Run `node --test --test-isolation=none tests/build.test.js tests/templates.test.js` and confirm failure on the old wording/category.
- [ ] Commit with `test: define Green category correction`.

### Task 2: Correct content, category and cover

**Files:**
- Modify: `content/essays/green-from-poison-to-purity.md`
- Modify: `src/site.js`
- Modify: `src/images/editorial-green.svg`
- Test: `tests/build.test.js`
- Test: `tests/templates.test.js`

**Interfaces:**
- Consumes: the stable slugs and paths protected by Task 1.
- Produces: corrected public metadata, body and cover.

- [ ] Change Green frontmatter category to `Art, Design & Visual Culture` and replace the `visual culture` tag with `art, design and visual culture`.
- [ ] Delete the entire block from `## Pull Quotes for the Visual Essay` through its six quotations, leaving `## Consolidated Bibliography` immediately after Key Takeaways.
- [ ] Rename the `Visual Culture` theme to `Art, Design & Visual Culture`, update its `categories` array to the same value and broaden its description to cover art, design, colour, images and material culture; retain slug `visual-culture`.
- [ ] Remove the `A visual essay` text element from the SVG, shift the title group upward to balance the empty space, and change the footer to `ANA VARELA · ART, DESIGN &amp; VISUAL CULTURE` at a size that fits within the left field.
- [ ] Run the focused tests and confirm they pass.
- [ ] Commit with `fix: correct Green labelling and category`.

### Task 3: Verify publication output

**Files:**
- Modify only if verification exposes a defect: files from Tasks 1–2.

**Interfaces:**
- Consumes: corrected source.
- Produces: build-ready change suitable for a PR.

- [ ] Run `npm test`; expect zero failures.
- [ ] Run `npm run build`; expect exit code 0.
- [ ] Run `npm run verify`; expect no broken routes or assets.
- [ ] Inspect Green, the homepage category label and `/categories/visual-culture/` at desktop and mobile widths; confirm no clipping and no visual-essay label.
- [ ] Run `git diff --check` and `git status --short`; remove no user-owned files.
