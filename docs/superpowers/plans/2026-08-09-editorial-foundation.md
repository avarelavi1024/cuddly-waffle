# Editorial Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing static essay site into a safer, professional editorial foundation for recurring English-language publications shared primarily through LinkedIn.

**Architecture:** Keep the dependency-free Node.js static generator and Markdown content model. Add strict content validation, focused rendering modules, absolute social metadata, publication-aware route generation, accessibility safeguards, and generated-output verification while preserving all currently public URLs and visual choices.

**Tech Stack:** Node.js 24, ECMAScript modules, Node test runner, HTML, CSS, client-side vanilla JavaScript, Markdown content, Vercel static deployment.

## Global Constraints

- Preserve the existing English-language identity, visual style, colour palette, Markdown workflow, GitHub repository, and Vercel deployment.
- Keep `https://ana-varela.vercel.app` as the canonical production origin.
- Preserve every currently public page and published essay URL.
- Do not add a framework, CMS, database, authentication, account system, or administrative interface.
- Keep the project dependency-free unless a later approved requirement makes a dependency necessary.
- Keep About and Contact copy unchanged unless a material punctuation, accessibility, or link defect is verified.
- A `coming-soon` essay may appear in listings but must not generate a public essay page.
- A `draft` essay must not appear anywhere in production output.
- Raw HTML in Markdown must remain escaped.
- LinkedIn images must be committed raster images with absolute production URLs.
- Each task follows red-green-refactor: add a failing test, observe the intended failure, implement the smallest complete change, run tests, then commit.

---

## File Structure

Files created by this plan:

- `src/site.js`: immutable site identity, canonical origin, navigation, and category configuration.
- `src/metadata.js`: canonical, Open Graph, Twitter/X, and article metadata rendering.
- `src/components.js`: shared header, footer, cards, page shell, and escaping helpers.
- `src/pages/home.js`: homepage renderer and open-question data.
- `src/pages/projects.js`: project archive and category renderers.
- `src/pages/essay.js`: published essay renderer.
- `src/pages/static.js`: About, Contact, and 404 renderers.
- `src/verify-output.js`: generated internal route, asset, and metadata verification.
- `src/images/favicon.svg`: browser icon using the existing palette.
- `src/images/social-default.png`: 1200x630 default social card.
- `src/images/social-willpower-food.png`: 1200x630 social card for the featured essay.
- `src/images/social-ireland-spain.png`: 1200x630 social card for the politics essay.
- `content/essay-template.md`: non-published reusable essay template.
- `tests/metadata.test.js`: metadata rendering tests.
- `tests/templates.test.js`: page structure, accessibility, and route-link tests.
- `tests/build.test.js`: production output and publication-state tests.
- `tests/verify-output.test.js`: generated-output verifier tests.
- `docs/publishing.md`: concise recurring publication workflow.

Files modified by this plan:

- `src/content.js`: schema validation, publication-state rules, and source file information.
- `src/markdown.js`: lists, block quotes, thematic breaks, and editorial reference rendering.
- `src/templates.js`: temporary compatibility re-export after renderer extraction.
- `src/build.js`: publication-aware routes, 404, sitemap, robots, and output verification.
- `src/client.js`: reduced-motion-safe question rotation.
- `src/styles.css`: keyboard focus, reduced motion, long-form typography, and 404 styling.
- `content/essays/*.md`: add explicit social-image metadata to published essays.
- `README.md`: link to the full publishing guide and document supported states.
- `package.json`: make build verification explicit in scripts.
- `tests/content.test.js`: strict schema and state coverage.
- `tests/markdown.test.js`: new editorial Markdown cases.

---

### Task 1: Strict Editorial Content Schema

**Files:**
- Modify: `src/content.js`
- Modify: `tests/content.test.js`

**Interfaces:**
- Consumes: Markdown frontmatter currently parsed by `parseFrontmatter(source)`.
- Produces: `validateEssay(data, body, file): void`, `loadEssays(contentDir): Promise<Essay[]>`, and essay objects containing `sourceFile`, `status`, and optional `socialImage`.

- [ ] **Step 1: Add failing validation and publication-state tests**

Add tests that create isolated Markdown fixtures and assert exact failures:

```js
test("loadEssays rejects unsupported publication states with the filename", async () => {
  const dir = await fixtureDir({
    "invalid.md": essaySource({ status: "private" }, "This fixture contains more than twenty words so publication-body validation cannot hide the intended unsupported-status failure from this focused test case.")
  });
  await assert.rejects(loadEssays(dir), /invalid\.md: status must be published, coming-soon, or draft/);
});

test("loadEssays rejects inconsistent date and year", async () => {
  const dir = await fixtureDir({
    "wrong-year.md": essaySource({ date: "2026-02-01", year: "2025" }, "This fixture contains more than twenty words so publication-body validation cannot hide the intended year-mismatch failure from this focused test case.")
  });
  await assert.rejects(loadEssays(dir), /wrong-year\.md: year must match date/);
});

test("loadEssays allows exactly one featured published essay", async () => {
  const dir = await fixtureDir({
    "one.md": essaySource({ featured: true }, "This first published fixture contains enough words to satisfy the substantive-body rule while testing duplicate featured publications in isolation."),
    "two.md": essaySource({ title: "Two", featured: true }, "This second published fixture also contains enough words to satisfy the substantive-body rule while testing duplicate featured publications in isolation.")
  });
  await assert.rejects(loadEssays(dir), /Only one published essay may be featured/);
});

test("loadEssays preserves draft records for build-time filtering", async () => {
  const dir = await fixtureDir({
    "draft.md": essaySource({ status: "draft" }, "Draft body that is not public.")
  });
  const [essay] = await loadEssays(dir);
  assert.equal(essay.status, "draft");
  assert.match(essay.sourceFile, /draft\.md$/);
});
```

Create local test helpers `essaySource(overrides, body)`, `fixtureDir(files)`, and `cleanupFixture(dir)` in `tests/content.test.js`; every fixture must be removed with `t.after()`.

- [ ] **Step 2: Run the content tests and verify failure**

Run:

```powershell
& $node --test --test-isolation=none tests/content.test.js
```

Expected: FAIL because unsupported states, year mismatches, duplicate featured essays, and `sourceFile` are not validated.

- [ ] **Step 3: Implement the schema and actionable errors**

In `src/content.js`, add:

```js
const REQUIRED_FIELDS = ["title", "subtitle", "date", "year", "category", "excerpt", "image", "status"];
const STATUSES = new Set(["published", "coming-soon", "draft"]);

export function validateEssay(data, body, file) {
  for (const field of REQUIRED_FIELDS) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      throw new Error(`${file}: ${field} is required`);
    }
  }
  if (!STATUSES.has(data.status)) {
    throw new Error(`${file}: status must be published, coming-soon, or draft`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(`${data.date}T00:00:00Z`))) {
    throw new Error(`${file}: date must use YYYY-MM-DD`);
  }
  if (data.year !== data.date.slice(0, 4)) {
    throw new Error(`${file}: year must match date`);
  }
  if (!Array.isArray(data.tags)) {
    throw new Error(`${file}: tags must be an array`);
  }
  if (data.status === "published" && body.trim().split(/\s+/).length < 20) {
    throw new Error(`${file}: published essays require a substantive body`);
  }
}
```

Call `validateEssay(data, body, file)` before constructing each essay. Add `sourceFile: join(contentDir, file)` and `socialImage: data.socialImage || ""`. After loading, reject more than one essay where `status === "published" && featured === true`.

- [ ] **Step 4: Run all tests**

Run:

```powershell
& $node --test --test-isolation=none tests/*.test.js
```

Expected: all tests PASS.

- [ ] **Step 5: Commit the schema**

```powershell
git add src/content.js tests/content.test.js
git commit -m "feat: validate editorial content schema"
```

---

### Task 2: Editorial Markdown Constructs

**Files:**
- Modify: `src/markdown.js`
- Modify: `tests/markdown.test.js`

**Interfaces:**
- Consumes: Markdown body strings passed to `markdownToHtml(markdown)`.
- Produces: escaped HTML supporting headings, paragraphs, emphasis, links, ordered lists, unordered lists, block quotes, and thematic breaks.

- [ ] **Step 1: Add failing Markdown tests**

```js
test("markdownToHtml renders editorial block elements", () => {
  const html = markdownToHtml(`> A quoted claim.\n\n- First source\n- Second source\n\n1. First step\n2. Second step\n\n---`);
  assert.equal(html, `<blockquote><p>A quoted claim.</p></blockquote>
<ul>
<li>First source</li>
<li>Second source</li>
</ul>
<ol>
<li>First step</li>
<li>Second step</li>
</ol>
<hr>`);
});

test("markdownToHtml escapes HTML inside lists and block quotes", () => {
  const html = markdownToHtml(`- <img src=x onerror=alert(1)>\n\n> <script>alert(1)</script>`);
  assert.doesNotMatch(html, /<img|<script>/);
  assert.match(html, /&lt;img/);
  assert.match(html, /&lt;script/);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```powershell
& $node --test --test-isolation=none tests/markdown.test.js
```

Expected: FAIL because the renderer treats these blocks as paragraphs.

- [ ] **Step 3: Implement a block parser without weakening escaping**

Refactor `markdownToHtml` to scan normalized lines and flush paragraph/list buffers. Apply the existing inline renderer only after escaping. Recognize:

```js
const unorderedItem = line.match(/^[-*] (.+)$/);
const orderedItem = line.match(/^\d+\. (.+)$/);
const quote = line.match(/^> (.+)$/);
const thematicBreak = /^ {0,3}([-*_])(?: *\1){2,} *$/.test(line);
```

Consecutive items of the same kind form one list. Consecutive quote lines form one `<blockquote><p>...</p></blockquote>`. Do not support nested lists in this iteration.

- [ ] **Step 4: Run Markdown and full test suites**

```powershell
& $node --test --test-isolation=none tests/markdown.test.js
& $node --test --test-isolation=none tests/*.test.js
```

Expected: all tests PASS and raw HTML remains escaped.

- [ ] **Step 5: Commit Markdown support**

```powershell
git add src/markdown.js tests/markdown.test.js
git commit -m "feat: support editorial markdown blocks"
```

---

### Task 3: Site Configuration and Absolute Metadata

**Files:**
- Create: `src/site.js`
- Create: `src/metadata.js`
- Create: `tests/metadata.test.js`
- Modify: `content/essays/why-do-we-talk-about-willpower-food.md`
- Modify: `content/essays/ireland-and-spain-political-culture.md`

**Interfaces:**
- Produces: `site`, `categoryThemes`, `absoluteUrl(path)`, and `renderMetadata({ title, description, path, image, type, article })`.
- `article` shape: `{ publishedTime: string, section: string, tags: string[] }`.

- [ ] **Step 1: Add failing metadata tests**

```js
test("renderMetadata emits absolute canonical and social URLs", () => {
  const html = renderMetadata({
    title: "Example Essay",
    description: "Example description.",
    path: "/essays/example/",
    image: "/images/social-example.png",
    type: "article",
    article: { publishedTime: "2026-08-09", section: "Culture", tags: ["culture"] }
  });
  assert.match(html, /rel="canonical" href="https:\/\/ana-varela\.vercel\.app\/essays\/example\/"/);
  assert.match(html, /property="og:image" content="https:\/\/ana-varela\.vercel\.app\/images\/social-example\.png"/);
  assert.match(html, /property="article:published_time" content="2026-08-09"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
});

test("absoluteUrl normalizes root-relative paths", () => {
  assert.equal(absoluteUrl("/about/"), "https://ana-varela.vercel.app/about/");
});
```

- [ ] **Step 2: Run the metadata tests and verify failure**

```powershell
& $node --test --test-isolation=none tests/metadata.test.js
```

Expected: FAIL because `src/site.js` and `src/metadata.js` do not exist.

- [ ] **Step 3: Implement immutable site configuration**

Move the existing site and category data from `src/templates.js` into `src/site.js` and export:

```js
export const site = Object.freeze({
  name: "Ana Varela Vilariño",
  title: "Mini Theses",
  description: "Cultural analysis, visual research and everyday questions shaped into concise essays.",
  origin: "https://ana-varela.vercel.app",
  defaultSocialImage: "/images/social-default.png"
});

export function absoluteUrl(path) {
  return new URL(path, `${site.origin}/`).href;
}
```

Export the unchanged category array as `categoryThemes`.

- [ ] **Step 4: Implement escaped metadata rendering**

In `src/metadata.js`, generate canonical, description, Open Graph, and Twitter/X tags. Use `escapeHtml` for every dynamic attribute. Add article tags only when `type === "article"` and `article` is supplied.

Add these fields to the two published essay frontmatters:

```yaml
socialImage: "images/social-willpower-food.png"
```

and:

```yaml
socialImage: "images/social-ireland-spain.png"
```

- [ ] **Step 5: Run tests and commit**

```powershell
& $node --test --test-isolation=none tests/*.test.js
git add src/site.js src/metadata.js tests/metadata.test.js content/essays/*.md
git commit -m "feat: add canonical social metadata"
```

Expected: all tests PASS.

---

### Task 4: Focused Page and Component Modules

**Files:**
- Create: `src/components.js`
- Create: `src/pages/home.js`
- Create: `src/pages/projects.js`
- Create: `src/pages/essay.js`
- Create: `src/pages/static.js`
- Create: `tests/templates.test.js`
- Modify: `src/templates.js`

**Interfaces:**
- Consumes: `site`, `categoryThemes`, `renderMetadata`, and `Essay[]`.
- Produces: existing renderer names plus `renderNotFoundPage()`; `src/templates.js` re-exports them for build compatibility.

- [ ] **Step 1: Add page contract tests before moving code**

```js
test("published essay pages expose article metadata and useful image alt text", () => {
  const html = renderEssayPage(publishedEssay, [publishedEssay]);
  assert.match(html, /property="og:type" content="article"/);
  assert.match(html, /<img[^>]+alt="Editorial illustration for Example Essay"/);
});

test("the 404 page preserves the site identity and recovery links", () => {
  const html = renderNotFoundPage();
  assert.match(html, /<h1>Page not found<\/h1>/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/projects\/"/);
});

test("every page shell contains one main landmark and visible skip link", () => {
  const html = renderAboutPage();
  assert.equal((html.match(/<main/g) || []).length, 1);
  assert.match(html, /<a class="skip-link" href="#main-content">Skip to content<\/a>/);
  assert.match(html, /<main[^>]*id="main-content"/);
});
```

- [ ] **Step 2: Run tests and verify failure**

```powershell
& $node --test --test-isolation=none tests/templates.test.js
```

Expected: FAIL because the 404 renderer, metadata integration, skip link, and modules do not exist.

- [ ] **Step 3: Extract shared components without redesigning markup**

Move `pageShell`, `essayCard`, `smallEssayCard`, `archiveRow`, header, and footer into `src/components.js`. Change `pageShell` to accept `{ title, description, path, body, image, type, article }`, call `renderMetadata`, insert the skip link, and ensure the supplied `<main>` has `id="main-content"`.

- [ ] **Step 4: Extract page renderers by responsibility**

Move renderers without changing copy:

- homepage and open-question data to `src/pages/home.js`;
- projects, archive alias, categories, and open questions to `src/pages/projects.js`;
- essay page to `src/pages/essay.js`;
- About, Contact, and the new 404 page to `src/pages/static.js`.

For published essay pages pass:

```js
article: {
  publishedTime: essay.date,
  section: essay.category,
  tags: essay.tags
}
```

Use `Editorial illustration for ${essay.title}` for informative hero images and `alt=""` for decorative category/card images.

- [ ] **Step 5: Replace `src/templates.js` with compatibility exports**

```js
export { categoryThemes } from "./site.js";
export { renderHomePage } from "./pages/home.js";
export { renderArchivePage, renderProjectsPage, renderCategoryPage } from "./pages/projects.js";
export { renderEssayPage } from "./pages/essay.js";
export { renderAboutPage, renderContactPage, renderNotFoundPage } from "./pages/static.js";
```

- [ ] **Step 6: Run tests and compare a clean build**

```powershell
& $node --test --test-isolation=none tests/*.test.js
& $node src/build.js
```

Expected: tests PASS and current routes still build.

- [ ] **Step 7: Commit the module extraction**

```powershell
git add src/components.js src/pages src/templates.js tests/templates.test.js
git commit -m "refactor: separate editorial page renderers"
```

---

### Task 5: Publication-Aware Build, Sitemap, Robots, and 404

**Files:**
- Modify: `src/build.js`
- Create: `tests/build.test.js`
- Modify: `vercel.json`

**Interfaces:**
- Consumes: validated `Essay[]`, page renderers, and `site.origin`.
- Produces: `build({ contentDir, outputDir }): Promise<void>`, `dist/404.html`, `dist/sitemap.xml`, `dist/robots.txt`, and only permitted essay routes.

- [ ] **Step 1: Add failing integration tests with temporary output**

Export `build` without automatically running it when imported. Test a fixture containing one published, one coming-soon, and one draft essay:

```js
test("build generates only published essay routes", async (t) => {
  const { contentDir, outputDir } = await buildFixture(t);
  await build({ contentDir, outputDir });
  assert.equal(await exists(join(outputDir, "essays/published/index.html")), true);
  assert.equal(await exists(join(outputDir, "essays/upcoming/index.html")), false);
  assert.equal(await exists(join(outputDir, "essays/draft/index.html")), false);
});

test("sitemap contains canonical public routes only", async (t) => {
  const { contentDir, outputDir } = await buildFixture(t);
  await build({ contentDir, outputDir });
  const sitemap = await readFile(join(outputDir, "sitemap.xml"), "utf8");
  assert.match(sitemap, /https:\/\/ana-varela\.vercel\.app\/essays\/published\//);
  assert.doesNotMatch(sitemap, /upcoming|draft|\/archive\//);
});
```

The fixture helper copies required CSS, client JS, and referenced images into a temporary source root so tests do not depend on production output.

- [ ] **Step 2: Run build tests and verify failure**

```powershell
& $node --test --test-isolation=none tests/build.test.js
```

Expected: FAIL because all essay routes are currently generated and `build` is not configurable.

- [ ] **Step 3: Make build paths injectable and filter each public surface**

Implement:

```js
export async function build({
  contentDir = "content/essays",
  outputDir = "dist"
} = {}) {
  const essays = await loadEssays(contentDir);
  const visibleEssays = essays.filter((essay) => essay.status !== "draft");
  const publishedEssays = essays.filter((essay) => essay.status === "published");

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  await writePage(join(outputDir, "index.html"), renderHomePage(visibleEssays));
  await writePage(join(outputDir, "projects/index.html"), renderProjectsPage(visibleEssays));
  for (const essay of publishedEssays) {
    await writePage(join(outputDir, "essays", essay.slug, "index.html"), renderEssayPage(essay, publishedEssays));
  }
}
```

Define:

```js
const visibleEssays = essays.filter((essay) => essay.status !== "draft");
const publishedEssays = essays.filter((essay) => essay.status === "published");
```

Use `visibleEssays` for listings and category pages. Generate individual essay pages only from `publishedEssays`.

- [ ] **Step 4: Generate canonical infrastructure files**

Write `404.html` using `renderNotFoundPage()`. Generate XML from the root, Projects, About, Contact, category routes, and published essays; exclude `/archive/` because it duplicates Projects. Escape XML values. Generate:

```text
User-agent: *
Allow: /
Sitemap: https://ana-varela.vercel.app/sitemap.xml
```

Update `vercel.json` with a clean-URL 404 rewrite only if Vercel's static `404.html` behaviour does not serve the page during deployment verification; do not add speculative rewrites.

- [ ] **Step 5: Run tests and production build**

```powershell
& $node --test --test-isolation=none tests/*.test.js
& $node src/build.js
```

Expected: all tests PASS; no `dist/essays/<coming-soon>/` directories exist.

- [ ] **Step 6: Commit build rules**

```powershell
git add src/build.js tests/build.test.js vercel.json
git commit -m "feat: enforce public publication routes"
```

---

### Task 6: Raster Social Cards and Browser Identity

**Files:**
- Create: `src/images/social-default.png`
- Create: `src/images/social-willpower-food.png`
- Create: `src/images/social-ireland-spain.png`
- Create: `src/images/favicon.svg`
- Modify: `src/build.js`
- Modify: `tests/build.test.js`

**Interfaces:**
- Consumes: existing SVG editorial artwork and the established cream, dark brown, teal, terracotta, pink, and olive palette.
- Produces: committed 1200x630 PNG cards copied to `/images/` and one favicon linked by the page shell.

- [ ] **Step 1: Add failing asset assertions**

Add a PNG-header/dimension reader in `tests/build.test.js` using `readFile`. PNG width and height are big-endian unsigned integers at byte offsets 16 and 20:

```js
test("social cards are 1200 by 630 raster images", async () => {
  for (const name of ["social-default.png", "social-willpower-food.png", "social-ireland-spain.png"]) {
    const bytes = await readFile(join("src/images", name));
    assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG");
    assert.equal(bytes.readUInt32BE(16), 1200);
    assert.equal(bytes.readUInt32BE(20), 630);
  }
});
```

- [ ] **Step 2: Run the asset test and verify failure**

```powershell
& $node --test --test-isolation=none tests/build.test.js
```

Expected: FAIL with missing PNG files.

- [ ] **Step 3: Create the three social cards from existing visual assets**

Use the existing illustrations as the visual source. Compose each card at exactly 1200x630 with generous safe margins, high-contrast English title text, `Ana Varela Vilariño`, and `Mini Theses`. Keep the preselected palette and editorial typography; introduce no new colours. The default card uses the site name and archive description. Essay cards use the exact published titles.

Save raster outputs at the three specified paths. Create `favicon.svg` as a simple AV monogram or abstract mark using only existing colours.

- [ ] **Step 4: Link and copy browser assets**

Add `<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">` in the shared page shell. The existing image-copy loop should copy all four assets; add an assertion that the production output contains each one.

- [ ] **Step 5: Run tests and inspect metadata output**

```powershell
& $node --test --test-isolation=none tests/*.test.js
& $node src/build.js
rg -n "og:image|rel=\"icon\"" dist/index.html dist/essays/*/index.html
```

Expected: tests PASS; Open Graph images are absolute `.png` URLs and the favicon is present.

- [ ] **Step 6: Commit visual assets**

```powershell
git add src/images src/components.js src/build.js tests/build.test.js
git commit -m "feat: add LinkedIn sharing assets"
```

---

### Task 7: Accessibility, Reduced Motion, and Long-Form Resilience

**Files:**
- Modify: `src/client.js`
- Modify: `src/styles.css`
- Modify: `tests/templates.test.js`

**Interfaces:**
- Consumes: existing marquee, question rotation, navigation, cards, and essay markup.
- Produces: keyboard-visible controls, skip navigation, reduced-motion behaviour, robust long-form layout, and unchanged default animation for users without the preference.

- [ ] **Step 1: Add failing structural accessibility tests**

```js
test("question rotation exposes an accessible live region without forcing announcements", () => {
  const html = renderHomePage(essays);
  assert.match(html, /class="question-list"[^>]+data-question-list/);
  assert.match(html, /aria-label="Show another set of questions"/);
});

test("external links provide an accessible new-window hint", () => {
  const html = renderContactPage();
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /<span class="sr-only"> \(opens in a new tab\)<\/span>/);
});
```

- [ ] **Step 2: Run template tests and verify failure**

```powershell
& $node --test --test-isolation=none tests/templates.test.js
```

Expected: FAIL because the new labels and hidden hint are absent.

- [ ] **Step 3: Implement semantic markup corrections**

Add the explicit Rotate label, `noopener noreferrer`, and visually hidden new-tab text. Keep decorative SVGs at `alt=""`; use informative alternative text only for essay hero images.

- [ ] **Step 4: Make client behaviour respect reduced motion**

In `src/client.js`:

```js
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let questionTimer;

function syncQuestionTimer() {
  window.clearInterval(questionTimer);
  if (!reduceMotion.matches && questionItems.length > 3) {
    questionTimer = window.setInterval(advanceQuestions, 24000);
  }
}

reduceMotion.addEventListener?.("change", syncQuestionTimer);
syncQuestionTimer();
```

The manual Rotate button continues to call `advanceQuestions` in both modes.

- [ ] **Step 5: Add focused CSS improvements**

Add:

```css
.skip-link { position: fixed; left: 1rem; top: 1rem; transform: translateY(-200%); z-index: 100; }
.skip-link:focus { transform: translateY(0); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
:where(a, button, summary):focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }
.essay-body { overflow-wrap: anywhere; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; }
  .theme-track { animation: none; width: max-content; }
  .theme-marquee { overflow-x: auto; }
}
```

Use the actual existing custom-property name for the focus colour; do not introduce a new colour. Preserve current dimensions unless a measured overflow or touch target smaller than 44x44 pixels is found.

- [ ] **Step 6: Run tests and perform responsive checks**

```powershell
& $node --test --test-isolation=none tests/*.test.js
& $node src/build.js
```

Inspect homepage, Projects, one essay, About, Contact, and 404 at 1280x800 and 390x844. Verify no horizontal document overflow, keyboard focus visibility, and stopped automatic motion under reduced-motion emulation.

- [ ] **Step 7: Commit accessibility improvements**

```powershell
git add src/client.js src/styles.css src/components.js src/pages tests/templates.test.js
git commit -m "feat: improve accessibility and reduced motion"
```

---

### Task 8: Generated-Output Verification and Publishing Documentation

**Files:**
- Create: `src/verify-output.js`
- Create: `tests/verify-output.test.js`
- Create: `content/essay-template.md`
- Create: `docs/publishing.md`
- Modify: `src/build.js`
- Modify: `package.json`
- Modify: `README.md`

**Interfaces:**
- Produces: `verifyOutput(outputDir): Promise<void>` and documented commands `npm test`, `npm run build`, and `npm run verify`.
- Verification throws one aggregated error listing every broken internal route, missing local asset, non-absolute canonical/social URL, or public draft/upcoming essay route.

- [ ] **Step 1: Add failing verifier tests**

```js
test("verifyOutput reports broken internal routes and missing assets together", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `<a href="/missing/"><img src="/images/missing.png" alt=""></a>`
  });
  await assert.rejects(
    verifyOutput(outputDir),
    /Broken route: \/missing\/[\s\S]*Missing asset: \/images\/missing\.png/
  );
});

test("verifyOutput accepts a complete canonical page", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `<link rel="canonical" href="https://ana-varela.vercel.app/"><meta property="og:image" content="https://ana-varela.vercel.app/images/social-default.png"><img src="/images/social-default.png" alt="">`,
    "images/social-default.png": validPngFixture
  });
  await assert.doesNotReject(verifyOutput(outputDir));
});
```

- [ ] **Step 2: Run verifier tests and verify failure**

```powershell
& $node --test --test-isolation=none tests/verify-output.test.js
```

Expected: FAIL because `verifyOutput` does not exist.

- [ ] **Step 3: Implement generated-output verification**

Recursively inspect generated `.html` files. Extract root-relative `href` and `src` attributes with a small parser suitable for generated, trusted HTML. Map `/path/` to `<outputDir>/path/index.html` and file-like paths to their exact file. Skip `mailto:`, `http:`, `https:`, fragment-only links, and the deliberately external LinkedIn URL. Aggregate findings, sort them for deterministic tests, and throw once after the scan.

Require each HTML document to contain one absolute canonical URL and one absolute Open Graph image URL. Permit `404.html` to omit canonical metadata because it is not an indexable page.

- [ ] **Step 4: Integrate verification into build scripts**

Export a standalone CLI path from `src/verify-output.js` and update `package.json`:

```json
{
  "scripts": {
    "build": "node src/build.js",
    "dev": "node src/dev-server.js",
    "test": "node --test --test-isolation=none tests/*.test.js",
    "verify": "node src/verify-output.js dist"
  }
}
```

Call `verifyOutput(outputDir)` as the final step of the production build so Vercel stops on invalid output.

- [ ] **Step 5: Add the reusable essay template**

Create `content/essay-template.md` with complete non-public example frontmatter:

```markdown
---
title: "Essay title"
subtitle: "One-sentence subtitle"
date: "2026-08-09"
year: "2026"
category: "Culture"
tags: ["culture", "society"]
excerpt: "A concise description for cards and shared links."
image: "images/editorial-example.svg"
socialImage: "images/social-example.png"
curated: false
featured: false
status: "draft"
---

# Essay title

Opening paragraph.

## First section

Essay text.

### References

- [Source title](https://example.com)
```

The loader reads only `content/essays`, so the template can never be published accidentally.

- [ ] **Step 6: Document the recurring workflow**

In `docs/publishing.md`, document exact status behaviour, required fields, image paths, local commands, desktop/mobile review, commit/push, Vercel confirmation, and LinkedIn Post Inspector refresh. Update `README.md` to link to this guide rather than duplicating it.

- [ ] **Step 7: Run final automated verification**

```powershell
& $node --test --test-isolation=none tests/*.test.js
& $node src/build.js
& $node src/verify-output.js dist
git diff --check
git status --short
```

Expected: all tests PASS, build succeeds, verifier produces no findings, diff check is clean, and only intended files are modified.

- [ ] **Step 8: Perform final visual and deployment checks**

Serve `dist` locally and inspect:

- `/` at 1280x800 and 390x844;
- `/projects/` at both widths;
- both published essay routes at both widths;
- `/about/`, `/contact/`, and `/404.html`;
- keyboard traversal and focus visibility;
- reduced-motion behaviour;
- document and console errors.

After the branch is pushed and Vercel deploys, confirm the production canonical URL, social PNG, sitemap, robots file, and a deliberately missing route. Do not publish or refresh LinkedIn caches until the user authorizes the push/deployment workflow.

- [ ] **Step 9: Commit verification and documentation**

```powershell
git add src/verify-output.js tests/verify-output.test.js content/essay-template.md docs/publishing.md README.md package.json src/build.js
git commit -m "docs: standardize essay publishing workflow"
```

---

## Completion Criteria

- All Node tests pass with `--test-isolation=none` in the Codex environment.
- `node src/build.js` creates a verified `dist` directory from scratch.
- Only published essays have public essay routes.
- Drafts are absent from all output; coming-soon items have no essay route.
- Existing public URLs continue to resolve.
- Every indexable page has an absolute canonical URL and absolute raster Open Graph image.
- Social PNGs are exactly 1200x630.
- Sitemap and robots files contain only intended canonical pages.
- Homepage, archive, essays, About, Contact, and 404 pass desktop and mobile visual review.
- Keyboard focus and reduced-motion behaviour are verified.
- The publishing guide is sufficient to add the next essay without changing application code.
