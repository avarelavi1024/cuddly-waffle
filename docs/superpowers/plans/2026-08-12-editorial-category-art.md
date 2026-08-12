# Editorial Category Art Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the seven category illustrations with a coherent editorial-archive system of bespoke poetic symbols and refine their card/header presentation without redesigning unrelated pages.

**Architecture:** Keep `categoryThemes` and all current image URLs unchanged, replacing the SVG contents behind those stable interfaces. Add focused source-contract tests for the shared SVG grammar and CSS interaction requirements, then restyle the existing `.category-tile` and `.category-title` surfaces using the site's current tokens.

**Tech Stack:** Node.js test runner, static JavaScript templates, CSS, repository-native SVG.

## Global Constraints

- Preserve navigation, category structure, page copy and the existing global colour palette.
- Each category uses a cream field, restrained colour block, fine rule, number, archival label and one bespoke poetic symbol.
- Use no more than two or three prominent colours per category composition.
- Keep *The Secret Histories of Colour* visibly special through pigment-led covers while retaining related numbering and editorial restraint.
- Keep artwork as repository-native SVG; add no remote assets, runtime libraries or image-generation dependencies.
- Preserve the existing category data model and image URLs.
- Keep category names as real interface text rather than embedding the only meaningful label inside artwork.
- Support desktop, tablet, mobile, keyboard focus and reduced-motion preferences.
- Limit code changes to category artwork, category tiles, category-page headers and their responsive/interaction states.

---

## File Structure

- `src/images/editorial-politics.svg`: politics/identity archive composition and divided-profile symbol.
- `src/images/editorial-myths.svg`: mythologies archive composition and fragmented sun/vessel symbol.
- `src/images/editorial-cities.svg`: cities archive composition and irregular architectural-grid symbol.
- `src/images/editorial-visual-culture.svg`: visual-culture archive composition and nested frame/eye symbol.
- `src/images/editorial-nutrition.svg`: health archive composition and balanced organic-rhythm symbol; the existing URL remains unchanged for compatibility.
- `src/images/editorial-business.svg`: business archive composition and ordered network symbol.
- `src/images/editorial-open-questions.svg`: open-questions archive composition and incomplete path/aperture symbol.
- `src/styles.css`: shared category-card/header presentation, focus, hover, responsive and reduced-motion behaviour.
- `tests/templates.test.js`: stable category image mappings and rendered semantic-text assertions.
- `tests/category-art.test.js`: SVG system and stylesheet source-contract tests.

### Task 1: Lock the category artwork contract

**Files:**
- Create: `tests/category-art.test.js`
- Modify: `tests/templates.test.js`

**Interfaces:**
- Consumes: `categoryThemes: Array<{name: string, slug: string, image: string}>` from `src/site.js` through `src/templates.js`.
- Produces: regression coverage for seven stable SVG URLs, shared SVG structure and visible category text.

- [ ] **Step 1: Add a failing stable-mapping test to `tests/templates.test.js`**

```js
test("category themes retain the seven stable editorial artwork paths", () => {
  assert.deepEqual(
    categoryThemes.map(({ slug, image }) => [slug, image]),
    [
      ["politics", "/images/editorial-politics.svg"],
      ["mythologies", "/images/editorial-myths.svg"],
      ["cities", "/images/editorial-cities.svg"],
      ["visual-culture", "/images/editorial-visual-culture.svg"],
      ["health", "/images/editorial-nutrition.svg"],
      ["business", "/images/editorial-business.svg"],
      ["open-questions", "/images/editorial-open-questions.svg"]
    ]
  );

  const html = renderHomePage([publishedEssay]);
  for (const theme of categoryThemes) {
    assert.match(html, new RegExp(`<span>${theme.name.replace("&", "&amp;")}<\\/span>`));
  }
});
```

- [ ] **Step 2: Create `tests/category-art.test.js` with failing shared-system assertions**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const artworks = [
  ["editorial-politics.svg", "01", "POWER / MEMORY", "category-symbol category-symbol-politics"],
  ["editorial-myths.svg", "02", "SYMBOL / RETELLING", "category-symbol category-symbol-mythologies"],
  ["editorial-cities.svg", "03", "SPACE / BELONGING", "category-symbol category-symbol-cities"],
  ["editorial-visual-culture.svg", "04", "IMAGE / MEDIATION", "category-symbol category-symbol-visual-culture"],
  ["editorial-nutrition.svg", "05", "BODY / BALANCE", "category-symbol category-symbol-health"],
  ["editorial-business.svg", "06", "WORK / SYSTEMS", "category-symbol category-symbol-business"],
  ["editorial-open-questions.svg", "07", "IDEAS / IN PROGRESS", "category-symbol category-symbol-open-questions"]
];

test("category SVGs share the approved archive grammar and unique symbolic hooks", async () => {
  for (const [file, number, label, symbolClass] of artworks) {
    const svg = await readFile(`src/images/${file}`, "utf8");
    assert.match(svg, /viewBox="0 0 1200 900"/);
    assert.match(svg, /class="category-field"/);
    assert.match(svg, /class="category-rule"/);
    assert.match(svg, new RegExp(`>${number}<`));
    assert.match(svg, new RegExp(`>${label}<`));
    assert.match(svg, new RegExp(`class="${symbolClass}"`));
    assert.ok((svg.match(/#[0-9a-fA-F]{6}/g) || []).length <= 12);
  }
});
```

- [ ] **Step 3: Run the focused tests and verify the artwork test fails**

Run: `node --test --test-isolation=none tests/category-art.test.js tests/templates.test.js`

Expected: the mapping and visible-text test passes; the SVG grammar test fails because the current assets do not yet contain `category-field`, `category-rule`, numbered metadata and unique symbol hooks.

- [ ] **Step 4: Commit the contract tests**

```bash
git add tests/category-art.test.js tests/templates.test.js
git commit -m "test: define editorial category artwork contract"
```

### Task 2: Build the seven SVG compositions

**Files:**
- Modify: `src/images/editorial-politics.svg`
- Modify: `src/images/editorial-myths.svg`
- Modify: `src/images/editorial-cities.svg`
- Modify: `src/images/editorial-visual-culture.svg`
- Modify: `src/images/editorial-nutrition.svg`
- Modify: `src/images/editorial-business.svg`
- Modify: `src/images/editorial-open-questions.svg`
- Test: `tests/category-art.test.js`

**Interfaces:**
- Consumes: the exact file paths and SVG class/metadata contract defined in Task 1.
- Produces: seven self-contained `1200 × 900` SVGs usable by existing `<img>` elements.

- [ ] **Step 1: Establish the shared composition in every SVG**

Use this structure in each file, substituting the exact number, label, accessible title/description, accent colours and symbol paths listed below:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-labelledby="title description">
  <title id="title">Category name editorial artwork</title>
  <desc id="description">Concise description of the category-specific symbol.</desc>
  <rect class="category-field" width="1200" height="900" fill="#f4f1ea"/>
  <rect x="0" y="0" width="684" height="900" fill="#0d4d4f"/>
  <line class="category-rule" x1="72" y1="112" x2="1128" y2="112" stroke="#a24e34" stroke-width="2"/>
  <text x="72" y="78" fill="#f4f1ea" font-family="Arial, sans-serif" font-size="18" letter-spacing="3">LABEL</text>
  <text x="1128" y="78" text-anchor="end" fill="#211714" font-family="Arial, sans-serif" font-size="18">01</text>
  <g class="category-symbol category-symbol-slug">…symbol geometry…</g>
</svg>
```

The large left block may change between deep teal, ink and a muted category accent, but cream remains the unifying field and terracotta remains the fine-rule accent.

- [ ] **Step 2: Draw the seven category symbols with the agreed identities**

Use these exact symbolic concepts and hooks:

- `category-symbol-politics`: two opposing profile contours with one vertical dividing line; label `POWER / MEMORY`; number `01`; deep teal, cream and terracotta.
- `category-symbol-mythologies`: fragmented circular sun above a simplified vessel; label `SYMBOL / RETELLING`; number `02`; olive, cream and ochre.
- `category-symbol-cities`: three unequal architectural frames crossed by one route line; label `SPACE / BELONGING`; number `03`; deep teal, cream and dusty rose.
- `category-symbol-visual-culture`: an eye-like outer almond containing two offset rectangular frames; label `IMAGE / MEDIATION`; number `04`; ink, cream and terracotta.
- `category-symbol-health`: two balanced circles joined by one flowing line; label `BODY / BALANCE`; number `05`; olive, cream and dusty rose.
- `category-symbol-business`: five nodes connected in an ordered asymmetric network; label `WORK / SYSTEMS`; number `06`; deep teal, cream and ochre.
- `category-symbol-open-questions`: an incomplete circular aperture continued by an open path; label `IDEAS / IN PROGRESS`; number `07`; ink, cream and terracotta.

Keep strokes at least `8` SVG units and metadata at least `18` SVG units so the compositions survive card-size rendering. Keep every meaningful mark within an inner safe area of `72` SVG units.

- [ ] **Step 3: Run the focused artwork test**

Run: `node --test --test-isolation=none tests/category-art.test.js`

Expected: PASS for all seven SVGs.

- [ ] **Step 4: Render and inspect an asset contact sheet**

Open a temporary HTML contact sheet that displays all seven source SVGs at both `320 × 240` and `160 × 120`. Verify that every symbol remains distinguishable, no text or line is clipped, colours are limited and the seven pieces read as one family. Adjust SVG geometry until those checks pass.

- [ ] **Step 5: Commit the finished artwork family**

```bash
git add src/images/editorial-politics.svg src/images/editorial-myths.svg src/images/editorial-cities.svg src/images/editorial-visual-culture.svg src/images/editorial-nutrition.svg src/images/editorial-business.svg src/images/editorial-open-questions.svg
git commit -m "feat: create poetic editorial category artwork"
```

### Task 3: Refine category cards and headers

**Files:**
- Modify: `src/styles.css:393-434`
- Modify: `src/styles.css:485-496`
- Modify: `src/styles.css:924-960`
- Modify: `src/styles.css:1045-1065`
- Modify: `src/styles.css:1154-1175`
- Test: `tests/category-art.test.js`

**Interfaces:**
- Consumes: existing `.category-grid`, `.category-tile`, `.category-title` HTML and the 4:3 SVG output from Task 2.
- Produces: calm card/header layout with readable titles, visible focus and motion-safe interaction.

- [ ] **Step 1: Add failing stylesheet contract tests to `tests/category-art.test.js`**

```js
test("category cards use the light editorial treatment and restrained interaction", async () => {
  const css = await readFile("src/styles.css", "utf8");
  assert.match(css, /\.category-tile\s*\{[^}]*background:\s*var\(--paper\)[^}]*border-top:\s*1px solid var\(--ink\)/s);
  assert.match(css, /\.category-tile img\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3[^}]*object-fit:\s*cover/s);
  assert.match(css, /\.category-tile span\s*\{[^}]*position:\s*relative[^}]*color:\s*var\(--ink\)/s);
  assert.doesNotMatch(css, /\.category-tile:hover img[^{]*\{[^}]*rotate\(/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.category-tile img\s*\{[^}]*transition:\s*none/s);
});

test("category page artwork preserves its editorial ratio responsively", async () => {
  const css = await readFile("src/styles.css", "utf8");
  assert.match(css, /\.category-title img\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3[^}]*object-fit:\s*cover/s);
  assert.match(css, /@media[^}]*max-width:\s*720px[\s\S]*?\.category-title\s*\{[^}]*grid-template-columns:\s*1fr/s);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test --test-isolation=none tests/category-art.test.js`

Expected: FAIL because the current cards use `var(--night)`, absolutely overlay the title and rotate artwork on hover.

- [ ] **Step 3: Implement the light editorial card layout**

Update the existing selectors so each `.category-tile` is a two-row editorial unit:

```css
.category-tile {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 0;
  overflow: visible;
  background: var(--paper);
  color: var(--ink);
  border-top: 1px solid var(--ink);
}

.category-tile img {
  position: relative;
  inset: auto;
  z-index: auto;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  opacity: 1;
  transition: transform .35s ease;
}

.category-tile span {
  position: relative;
  inset: auto;
  padding: 14px 0 4px;
  color: var(--ink);
  font-family: var(--serif);
  font-size: clamp(24px, 2.5vw, 38px);
  line-height: 1.02;
}

.category-tile:hover img,
.category-tile:focus-visible img {
  transform: scale(1.018);
  opacity: 1;
}

.category-tile:hover,
.category-tile:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 5px;
}
```

Remove superseded absolute positioning, dark backgrounds and rotation rules instead of layering duplicate declarations.

- [ ] **Step 4: Refine category-page headers and responsive states**

Keep the current two-column desktop layout, add `object-fit: cover` to `.category-title img`, and preserve its `4 / 3` ratio. At the existing mobile breakpoint, retain `grid-template-columns: 1fr`, keep artwork after the heading in source order and reduce only spacing—not type below existing site minimums.

Add this rule inside the existing reduced-motion media query:

```css
.category-tile img {
  transition: none;
}

.category-tile:hover img,
.category-tile:focus-visible img {
  transform: none;
}
```

- [ ] **Step 5: Run focused tests**

Run: `node --test --test-isolation=none tests/category-art.test.js tests/templates.test.js`

Expected: PASS.

- [ ] **Step 6: Commit the presentation changes**

```bash
git add src/styles.css tests/category-art.test.js
git commit -m "style: refine editorial category presentation"
```

### Task 4: Full verification and visual QA

**Files:**
- Modify only if verification exposes a defect: the files listed in Tasks 1–3.

**Interfaces:**
- Consumes: completed SVG and CSS implementation.
- Produces: verified build output ready for review and publication.

- [ ] **Step 1: Run the complete automated test suite**

Run: `npm test`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Build and verify generated output**

Run: `npm run build`

Expected: exit code `0` and a complete `dist` directory.

Run: `npm run verify`

Expected: output verification succeeds with no broken routes or missing assets.

- [ ] **Step 3: Inspect the generated site at desktop and mobile widths**

Serve `dist`, then inspect the homepage, `/projects/`, and at least two representative category pages at approximately `1440`, `768` and `390` CSS pixels. Confirm:

- all seven symbols are visually distinct and belong to the same family;
- category names remain real, readable text;
- cards no longer appear as heavy dark capsules;
- no SVG metadata or symbols are clipped;
- category headers keep a balanced 4:3 composition;
- keyboard focus is visible;
- hover movement is subtle and contains no rotation;
- reduced-motion disables image movement;
- the Green essay cover remains unchanged and visibly special.

- [ ] **Step 4: Run a final source and worktree review**

Run: `git diff --check`

Expected: no whitespace errors.

Run: `git status --short`

Expected: no unintended generated or temporary files. If visual QA required fixes, rerun `npm test`, `npm run build` and `npm run verify`, then commit only the intentional source/test changes with a focused message.
