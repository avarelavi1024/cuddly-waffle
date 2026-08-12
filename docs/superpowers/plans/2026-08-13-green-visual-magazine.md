# Green Visual Magazine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish `Green: From Poison to Purity` as a responsive, credited visual-research magazine without changing the presentation of other essays.

**Architecture:** Extend the small Markdown renderer with safe local-image figure syntax, pass a frontmatter-controlled visual-edition class into the essay template, and style those figures within the existing essay page. Store archival and original editorial assets locally so the static build remains self-contained.

**Tech Stack:** Node.js static site generator, native Node test runner, HTML/CSS, SVG/JPEG assets.

## Global Constraints

- Preserve the current title and all essay prose and section references.
- Apply magazine styling only when `visualEdition: true`.
- Use verified public-domain/open-access archival images or original code-native artwork.
- Do not assert arsenic content for an object without explicit institutional evidence.
- Maintain responsive layout and meaningful image alternatives.

---

### Task 1: Semantic figure support

**Files:**
- Modify: `src/markdown.js`
- Test: `tests/markdown.test.js`

**Interfaces:**
- Consumes: Markdown image syntax `![alt](images/name.ext "caption")`.
- Produces: escaped semantic `<figure class="editorial-figure"><img ...><figcaption>...</figcaption></figure>` markup for local asset paths.

- [ ] Write tests proving figure rendering, escaping and rejection of remote/unsafe paths.
- [ ] Run `node --test --test-isolation=none tests/markdown.test.js` and verify the new assertions fail because figures are unsupported.
- [ ] Implement the smallest safe figure parser and asset-path conversion.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Visual-edition template contract

**Files:**
- Modify: `src/pages/essay.js`
- Test: `tests/templates.test.js`

**Interfaces:**
- Consumes: Boolean frontmatter property `visualEdition`.
- Produces: `essay-page essay-page-visual` and `essay-body essay-body-visual` classes only for flagged essays.

- [ ] Add a template test comparing flagged and ordinary essays.
- [ ] Run the focused template test and observe failure from the missing classes.
- [ ] Add conditional escaped class names without changing ordinary output structure.
- [ ] Re-run the focused test and confirm it passes.

### Task 3: Green editorial assets and placements

**Files:**
- Create: `src/images/green-pigment-study.svg`
- Create: `src/images/green-greenwashing-study.svg`
- Create: `src/images/green-scheele.jpg`
- Create: `src/images/green-willow-bough.jpg`
- Create: `src/images/green-dress-1860.jpg`
- Modify: `content/essays/green-from-poison-to-purity.md`
- Test: `tests/content.test.js`

**Interfaces:**
- Consumes: Verified institutional downloads and the figure syntax from Task 1.
- Produces: Six paced editorial interventions with complete captions and alt text.

- [ ] Add content assertions for the visual flag, expected figure count, local assets, and credit language.
- [ ] Run the content test and verify failure because the magazine content is absent.
- [ ] Add optimized archival assets, two original SVG plates, and figure placements without deleting prose or references.
- [ ] Re-run content tests and confirm they pass.

### Task 4: Responsive magazine styling

**Files:**
- Modify: `src/styles.css`
- Test: `tests/build.test.js`

**Interfaces:**
- Consumes: `.essay-page-visual`, `.essay-body-visual`, `.editorial-figure`.
- Produces: full-bleed and asymmetric figure rhythm on desktop with a single-column mobile fallback.

- [ ] Add build assertions for scoped magazine selectors and responsive figure rules.
- [ ] Run the build test and observe failure from missing CSS.
- [ ] Implement restrained green editorial styling, captions, spacing and mobile rules.
- [ ] Re-run the build test and confirm it passes.

### Task 5: Full verification and visual review

**Files:**
- Modify only files required to correct failures discovered here.

- [ ] Run `npm test` and resolve any regression through a failing test first.
- [ ] Run `npm run build` and `npm run verify`.
- [ ] Inspect the generated Green essay at desktop and mobile widths, checking cropping, reading rhythm, captions, references and absence of horizontal overflow.
- [ ] Review the diff against the design specification and remove unrelated changes.

