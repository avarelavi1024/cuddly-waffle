# Green Colour Essay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the complete English essay *Green: From Poison to Purity* as issue 01 of *The Secret Histories of Colour*, with an accessible series label and matching editorial/social artwork.

**Architecture:** Extend the existing Markdown frontmatter loader with one optional string field, `series`, and render it in the existing essay hero without changing essays that omit it. Add the new essay as ordinary content and keep the colour-series identity inside dedicated SVG/PNG assets so the global site palette remains unchanged.

**Tech Stack:** Dependency-free Node.js ES modules, Markdown content, HTML templates, CSS, SVG, PNG, Node test runner.

## Global Constraints

- Preserve the supplied English essay in full; do not summarise or rewrite it.
- Preserve references at the end of each section and the consolidated bibliography.
- Series name: `The Secret Histories of Colour`.
- Category: `Visual Culture`.
- Status: `published`.
- The dominant colour is confined to essay artwork; do not change the global site palette.
- Site artwork is SVG; social artwork is a complete PNG of exactly 1200 × 630 pixels.
- Do not add runtime or package dependencies.

---

## File map

- `src/content.js`: parse, validate and expose optional `series` metadata.
- `src/pages/essay.js`: render the series label in the essay header when present.
- `src/styles.css`: style the series label as restrained editorial metadata.
- `content/essays/green-from-poison-to-purity.md`: complete essay and publication metadata.
- `src/images/editorial-green.svg`: responsive on-site artwork using the approved split pigment-archive system.
- `src/images/social-green.png`: 1200 × 630 social card matching the SVG.
- `tests/content.test.js`: optional-series loader and validation coverage.
- `tests/templates.test.js`: conditional series-label rendering coverage.
- `tests/build.test.js`: real publication, route, references, bibliography and asset regression coverage.

### Task 1: Optional series metadata

**Files:**
- Modify: `tests/content.test.js`
- Modify: `tests/templates.test.js`
- Modify: `src/content.js`
- Modify: `src/pages/essay.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: frontmatter field `series: "The Secret Histories of Colour"`.
- Produces: `essay.series: string`, defaulting to `""`; optional `<p class="essay-series">…</p>` in the essay hero.

- [ ] **Step 1: Write failing loader tests**

Add focused tests to `tests/content.test.js`:

```js
test("loadEssays exposes optional series metadata", async () => {
  const dir = await fixtureDir({
    "series.md": essaySource({ series: "The Secret Histories of Colour" })
  });
  test.after(() => cleanupFixture(dir));

  const [essay] = await loadEssays(dir);
  assert.equal(essay.series, "The Secret Histories of Colour");
});

test("loadEssays rejects a non-string optional series", async () => {
  const dir = await fixtureDir({ "series.md": essaySource({ series: false }) });
  test.after(() => cleanupFixture(dir));

  await assert.rejects(loadEssays(dir), /series\.md: series must be a non-empty string when provided/);
});
```

- [ ] **Step 2: Run the loader tests and verify RED**

Run: `node --test --test-isolation=none tests/content.test.js`

Expected: the exposed value is `undefined` and the boolean value is not rejected.

- [ ] **Step 3: Implement optional series loading**

In `validateEssay`, validate only when the field exists:

```js
if (Object.hasOwn(data, "series") && (typeof data.series !== "string" || !data.series.trim())) {
  throw new Error(`${file}: series must be a non-empty string when provided`);
}
```

In the object returned by `loadEssays`, add:

```js
series: data.series ?? "",
```

- [ ] **Step 4: Run the loader tests and verify GREEN**

Run: `node --test --test-isolation=none tests/content.test.js`

Expected: all content tests pass.

- [ ] **Step 5: Write failing template tests**

Add `series: "The Secret Histories of Colour"` to the shared `publishedEssay` fixture and add:

```js
test("essay pages render optional series metadata", () => {
  const html = renderEssayPage(publishedEssay, [publishedEssay]);
  assert.match(html, /<p class="essay-series">The Secret Histories of Colour<\/p>/);

  const withoutSeries = renderEssayPage({ ...publishedEssay, series: "" }, [publishedEssay]);
  assert.doesNotMatch(withoutSeries, /class="essay-series"/);
});
```

- [ ] **Step 6: Run the template test and verify RED**

Run: `node --test --test-isolation=none tests/templates.test.js`

Expected: no element with class `essay-series` exists.

- [ ] **Step 7: Render and style the series label**

In `src/pages/essay.js`, place this immediately before the existing kicker:

```js
${essay.series ? `<p class="essay-series">${escapeHtml(essay.series)}</p>` : ""}
```

In `src/styles.css`, add:

```css
.essay-series {
  margin: 0 0 10px;
  color: var(--green);
  font-size: 11px;
  letter-spacing: .14em;
  text-transform: uppercase;
}
```

- [ ] **Step 8: Run focused tests and commit**

Run: `node --test --test-isolation=none tests/content.test.js tests/templates.test.js`

Expected: all focused tests pass.

```powershell
git add src/content.js src/pages/essay.js src/styles.css tests/content.test.js tests/templates.test.js
git commit -m "feat: support editorial essay series"
```

### Task 2: Complete Green publication

**Files:**
- Create: `content/essays/green-from-poison-to-purity.md`
- Modify: `tests/build.test.js`
- Read: `C:\Users\avare\Downloads\Green_From_Poison_to_Purity_Final.pdf`

**Interfaces:**
- Consumes: the `series` field implemented in Task 1 and the supplied final PDF.
- Produces: published route `/essays/green-from-poison-to-purity/` and a complete Markdown source with local reference sections plus final bibliography.

- [ ] **Step 1: Write the failing real-content regression test**

Add to `tests/build.test.js`:

```js
test("Green is a complete published colour-series essay", async () => {
  const source = await readFile("content/essays/green-from-poison-to-purity.md", "utf8");
  const { data, body } = parseFrontmatter(source, "green-from-poison-to-purity.md");

  assert.equal(data.title, "Green: From Poison to Purity");
  assert.equal(data.series, "The Secret Histories of Colour");
  assert.equal(data.category, "Visual Culture");
  assert.equal(data.status, "published");
  assert.match(body, /## The Difficulty of Making Green/);
  assert.match(body, /## Toxic Beauty/);
  assert.match(body, /## Bibliography/);
  assert.ok((body.match(/### References/g) || []).length >= 6);
  assert.ok(body.trim().split(/\s+/).length >= 2500);
});
```

Import `parseFrontmatter` from `../src/content.js` alongside the existing imports.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test --test-isolation=none tests/build.test.js`

Expected: `ENOENT` for `content/essays/green-from-poison-to-purity.md`.

- [ ] **Step 3: Extract and transcribe the final PDF**

Use PDF text extraction as a transcription aid, then compare every section with the rendered PDF:

```powershell
pdftotext -layout 'C:\Users\avare\Downloads\Green_From_Poison_to_Purity_Final.pdf' 'tmp\green-source.txt'
```

Create the Markdown file with this exact frontmatter:

```yaml
---
title: "Green: From Poison to Purity"
subtitle: "How an unstable and poisonous pigment became a symbol of nature, health and sustainability."
date: "2026-08-10"
year: "2026"
category: "Visual Culture"
series: "The Secret Histories of Colour"
tags: ["colour", "visual culture", "design history", "green", "pigments"]
excerpt: "How green moved from unstable and poisonous pigments to one of contemporary culture's strongest symbols of nature, health and sustainability."
image: "images/editorial-green.svg"
socialImage: "images/social-green.png"
curated: true
featured: true
status: "published"
---
```

Use the PDF’s section order: Abstract, Research Question, Introduction, Green and the Natural World, The Difficulty of Making Green, Toxic Beauty, Desire/Fashion/Decoration, Modern Reinvention, The Paradox of Green, Final Reflection, Key Takeaways, Pull Quotes and Bibliography. Under every source-bearing section, retain its own `### References` list before the next `##` heading.

- [ ] **Step 4: Perform text-integrity checks**

Run:

```powershell
rg -n "^## |^### References|^### Pull Quotes|^## Bibliography" content/essays/green-from-poison-to-purity.md
```

Expected: headings follow the PDF order, at least six local References headings are present, and Bibliography is last.

- [ ] **Step 5: Run the content regression test**

Run: `node --test --test-isolation=none tests/build.test.js`

Expected: the new real-content assertions pass; the build fixture may still fail because artwork does not exist until Task 3.

- [ ] **Step 6: Commit the publication source and test**

```powershell
git add content/essays/green-from-poison-to-purity.md tests/build.test.js
git commit -m "content: add Green colour history essay"
```

### Task 3: Approved pigment-archive artwork

**Files:**
- Create: `src/images/editorial-green.svg`
- Create: `src/images/social-green.png`
- Modify: `tests/build.test.js`

**Interfaces:**
- Consumes: the asset paths declared in Task 2.
- Produces: responsive SVG artwork and a complete 1200 × 630 social raster.

- [ ] **Step 1: Add failing asset assertions**

Extend the Green regression test:

```js
assert.equal(await exists("src/images/editorial-green.svg"), true);
assert.equal(await exists("src/images/social-green.png"), true);
```

Add `social-green.png` to the existing list in the `social cards are 1200 by 630 raster images` test.

- [ ] **Step 2: Run the asset tests and verify RED**

Run: `node --test --test-isolation=none tests/build.test.js`

Expected: the artwork existence or social-card list assertion fails.

- [ ] **Step 3: Create the responsive SVG**

Create `src/images/editorial-green.svg` with `viewBox="0 0 1200 774"`, accessible `<title>` text, and the approved geometry:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 774" role="img" aria-labelledby="title">
  <title id="title">Green: From Poison to Purity, pigment archive cover</title>
  <rect width="1200" height="774" fill="#f4f1ea"/>
  <rect width="700" height="774" fill="#355b42"/>
  <line x1="54" y1="82" x2="646" y2="82" stroke="#f4f1ea" stroke-opacity=".7"/>
  <rect x="754" y="124" width="392" height="360" fill="#243f2e"/>
  <rect x="754" y="500" width="392" height="96" fill="#6f6b37"/>
  <rect x="754" y="612" width="392" height="96" fill="#a8b99b"/>
  <g fill="#f4f1ea">
    <text x="54" y="66" font-family="Arial, sans-serif" font-size="15" letter-spacing="2">THE SECRET HISTORIES OF COLOUR</text>
    <text x="620" y="66" text-anchor="end" font-family="Arial, sans-serif" font-size="15">01</text>
    <text x="54" y="326" font-family="Georgia, serif" font-size="26" font-style="italic">A visual essay</text>
    <text x="54" y="405" font-family="Georgia, serif" font-size="86">Green</text>
    <text x="54" y="460" font-family="Georgia, serif" font-size="39">From Poison to Purity</text>
    <text x="54" y="714" font-family="Arial, sans-serif" font-size="15" letter-spacing="2">ANA VARELA · VISUAL CULTURE</text>
  </g>
  <text x="754" y="82" fill="#725344" font-family="Arial, sans-serif" font-size="15" letter-spacing="2">PIGMENT ARCHIVE</text>
  <text x="774" y="458" fill="#f4f1ea" font-family="Arial, sans-serif" font-size="13" letter-spacing="2">POISON</text>
  <text x="1126" y="690" text-anchor="end" fill="#243f2e" font-family="Arial, sans-serif" font-size="13" letter-spacing="2">PURITY</text>
</svg>
```

Use Georgia with serif fallback for title text and Arial with sans-serif fallback for metadata. Keep every text baseline at least 54 px from the outer edge.

- [ ] **Step 4: Produce the matching social PNG**

Create a temporary standalone 1200 × 630 SVG variant using the same colours, copy and geometry, then rasterise it with the locally available headless browser at exactly 1200 × 630. Save only the final raster as `src/images/social-green.png`; do not commit the temporary source.

Verify dimensions from the PNG header:

```powershell
node -e "const fs=require('fs');const b=fs.readFileSync('src/images/social-green.png');console.log(b.readUInt32BE(16),b.readUInt32BE(20))"
```

Expected: `1200 630`.

- [ ] **Step 5: Run build and asset tests**

Run:

```powershell
node --test --test-isolation=none tests/build.test.js
node src/build.js
node src/verify-output.js dist
```

Expected: all commands exit 0; the route and both assets exist in `dist`.

- [ ] **Step 6: Visually inspect both assets**

Open `src/images/editorial-green.svg` and `src/images/social-green.png` at original detail. Confirm the title field is green, the top divider is visible, three swatches are distinct, no text is clipped, and contrast remains legible.

- [ ] **Step 7: Commit artwork**

```powershell
git add src/images/editorial-green.svg src/images/social-green.png tests/build.test.js
git commit -m "feat: add Green pigment archive artwork"
```

### Task 4: Full publication verification

**Files:**
- Verify: `content/essays/green-from-poison-to-purity.md`
- Verify: `dist/essays/green-from-poison-to-purity/index.html`

**Interfaces:**
- Consumes: all outputs from Tasks 1–3.
- Produces: evidence that the publication is safe to add to the existing draft PR.

- [ ] **Step 1: Run the full automated suite**

Run: `npm test`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Build and verify production output**

Run:

```powershell
npm run build
npm run verify
```

Expected: both commands exit 0.

- [ ] **Step 3: Inspect generated publication semantics**

Run:

```powershell
rg -n "The Secret Histories of Colour|Green: From Poison to Purity|References|Bibliography|social-green.png" dist/essays/green-from-poison-to-purity/index.html
```

Expected: series, title, local references, final bibliography and social image metadata are all present.

- [ ] **Step 4: Review desktop and mobile output**

Serve `dist`, inspect the home card and essay route at approximately 1440 px and 390 px widths, and confirm no horizontal overflow, clipped art or heading collisions.

- [ ] **Step 5: Record verification without committing generated output**

Run `git status --short` and confirm `dist/` and `tmp/` are not staged. If no source corrections were needed, this task creates no commit.
