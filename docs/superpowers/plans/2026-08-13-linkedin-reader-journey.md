# LinkedIn Reader Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give visitors arriving from LinkedIn an immediate professional framing, a direct route to the latest essay, and useful next actions after reading.

**Architecture:** Extend the existing server-rendered homepage and essay templates without adding dependencies or new routes. Selection logic remains inside the page renderers; the existing card, shell, link, colour, and responsive systems provide the presentation.

**Tech Stack:** Node.js ES modules, native `node:test`, static HTML generation, CSS.

## Global Constraints

- Preserve the existing paper, ink, terracotta, and teal visual system.
- Do not change imagery, About copy, Contact copy, categories, or content files.
- Do not add a newsletter, portrait, testimonials, counters, or dependencies.
- Recommend only published essays and never drafts or coming-soon entries.
- External LinkedIn links must use `target="_blank"`, `rel="noopener noreferrer"`, and accessible new-tab text.
- Narrow-screen actions must stack without horizontal overflow.

---

### Task 1: Homepage professional entry path

**Files:**
- Modify: `tests/templates.test.js`
- Modify: `src/pages/home.js`

**Interfaces:**
- Consumes: `renderHomePage(essays: Essay[]): string` and the existing featured-essay selection.
- Produces: homepage markup containing `.hero-positioning`, `.hero-latest-link`, and the selected published essay URL.

- [ ] **Step 1: Write the failing tests**

Add assertions that the homepage contains the exact positioning sentence, links “Read the latest essay” to `/essays/example-essay/`, and uses “Explore the archive” rather than “View projects” beside the latest publication. Add an empty-state assertion that the direct latest link is absent when no published essay exists.

```js
test("the homepage gives LinkedIn visitors a direct editorial entry path", () => {
  const html = renderHomePage([publishedEssay]);
  assert.match(html, /class="hero-positioning">Research-led essays on culture, design, health and the systems behind everyday life\.<\/p>/);
  assert.match(html, /class="text-link hero-latest-link" href="\/essays\/example-essay\/">Read the latest essay/);
  assert.match(html, /href="\/projects\/">Explore the archive<\/a>/);
  assert.doesNotMatch(html, />View projects<\/a>/);
});

test("the homepage omits the latest-essay action when nothing is published", () => {
  const html = renderHomePage([]);
  assert.doesNotMatch(html, /class="text-link hero-latest-link"/);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `node --test tests/templates.test.js`

Expected: FAIL because the positioning line, hero link, and archive wording are absent.

- [ ] **Step 3: Implement the homepage markup**

In `renderHomePage`, retain the current featured selection and add the exact positioning paragraph plus a conditional link:

```js
<p class="hero-positioning">Research-led essays on culture, design, health and the systems behind everyday life.</p>
${featured ? `<a class="text-link hero-latest-link" href="/essays/${escapeHtml(featured.slug)}/">Read the latest essay <span aria-hidden="true">→</span></a>` : ""}
```

Change only the latest-publication header link copy from `View projects` to `Explore the archive`.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `node --test tests/templates.test.js`

Expected: all template tests PASS.

- [ ] **Step 5: Commit the homepage behavior**

```bash
git add tests/templates.test.js src/pages/home.js
git commit -m "feat: clarify the homepage reader entry path"
```

### Task 2: Published-only essay continuation

**Files:**
- Modify: `tests/templates.test.js`
- Modify: `src/pages/essay.js`

**Interfaces:**
- Consumes: `renderEssayPage(essay: Essay, essays: Essay[]): string` and `essayCard(essay): string`.
- Produces: up to two related published essays, prioritising the current category and falling back to other categories, plus archive and LinkedIn actions.

- [ ] **Step 1: Write the failing recommendation tests**

Create same-category, other-category, coming-soon, and draft fixtures. Assert that same-category published essays appear before fallback published essays, and that draft and coming-soon titles do not appear.

```js
test("essay recommendations prefer the same category and fall back to other published work", () => {
  const sameCategory = { ...publishedEssay, slug: "same", title: "Same Category", featured: false };
  const fallback = { ...publishedEssay, slug: "fallback", title: "Published Fallback", category: "Health", featured: false };
  const comingSoon = { ...publishedEssay, slug: "soon", title: "Coming Soon Fixture", status: "coming-soon" };
  const draft = { ...publishedEssay, slug: "draft", title: "Draft Fixture", status: "draft" };
  const html = renderEssayPage(publishedEssay, [publishedEssay, fallback, comingSoon, sameCategory, draft]);
  assert.ok(html.indexOf("Same Category") < html.indexOf("Published Fallback"));
  assert.doesNotMatch(html, /Coming Soon Fixture|Draft Fixture/);
});
```

- [ ] **Step 2: Write the failing action tests**

Assert that every essay ending includes “Browse the complete archive” pointing to `/projects/` and “New essays are announced on LinkedIn” with the existing profile URL and safe external-link attributes, even when there are no recommendations.

```js
test("every essay ending offers archive and LinkedIn continuation actions", () => {
  const html = renderEssayPage(publishedEssay, [publishedEssay]);
  assert.match(html, /href="\/projects\/">Browse the complete archive<\/a>/);
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/ana-varela-vilariÃ±o-7aa95b235" target="_blank" rel="noopener noreferrer">New essays are announced on LinkedIn<span class="sr-only"> \(opens in a new tab\)<\/span><\/a>/);
  assert.match(html, /More essays will appear here soon\./);
});
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run: `node --test tests/templates.test.js`

Expected: FAIL because fallback recommendations and continuation actions are absent.

- [ ] **Step 4: Implement the recommendation selection**

Filter all candidates to `status === "published"` and exclude the current slug. Build `sameCategory` and `fallback` lists, then take the first two unique entries:

```js
const publishedCandidates = essays.filter((item) => item.slug !== essay.slug && item.status === "published");
const sameCategory = publishedCandidates.filter((item) => item.category === essay.category);
const fallback = publishedCandidates.filter((item) => item.category !== essay.category);
const related = [...sameCategory, ...fallback].slice(0, 2);
```

- [ ] **Step 5: Implement the continuation actions**

Append this markup inside the related-reading aside, after cards or the empty state:

```js
<nav class="related-actions" aria-label="Continue exploring">
  <a class="text-link" href="/projects/">Browse the complete archive</a>
  <a class="text-link" href="https://www.linkedin.com/in/ana-varela-vilariÃ±o-7aa95b235" target="_blank" rel="noopener noreferrer">New essays are announced on LinkedIn<span class="sr-only"> (opens in a new tab)</span></a>
</nav>
```

- [ ] **Step 6: Run the focused tests and verify GREEN**

Run: `node --test tests/templates.test.js`

Expected: all template tests PASS.

- [ ] **Step 7: Commit the essay continuation behavior**

```bash
git add tests/templates.test.js src/pages/essay.js
git commit -m "feat: add useful essay continuation paths"
```

### Task 3: Editorial styling and responsive layout

**Files:**
- Modify: `tests/templates.test.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `.hero-positioning`, `.hero-latest-link`, and `.related-actions` markup from Tasks 1 and 2.
- Produces: restrained editorial hierarchy and stacked narrow-screen continuation links.

- [ ] **Step 1: Write the failing stylesheet test**

```js
test("reader journey actions use restrained responsive editorial styling", async () => {
  const css = await readFile("src/styles.css", "utf8");
  assert.match(css, /\.hero-positioning\s*\{[^}]*font-size:/s);
  assert.match(css, /\.hero-latest-link\s*\{[^}]*display:\s*inline-flex/s);
  assert.match(css, /\.related-actions\s*\{[^}]*border-top:\s*1px solid/s);
  assert.match(css, /@media[\s\S]*?\.related-actions\s*\{[^}]*align-items:\s*flex-start/s);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/templates.test.js`

Expected: FAIL because the new selectors do not exist.

- [ ] **Step 3: Add minimal desktop and mobile styles**

Add rules beside the existing hero and related-reading rules. Use existing CSS variables and typography. Set the positioning line to a smaller editorial scale than the main introduction, render the hero action as an inline text link, and give `.related-actions` a subtle top rule, spacing, and a flexible column layout. In the existing mobile media query, align the action links to the start and preserve wrapping.

```css
.hero-positioning { font-size: 0.82rem; letter-spacing: 0.04em; }
.hero-latest-link { display: inline-flex; margin-top: 1rem; }
.related-actions { border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 0.75rem; margin-top: 2rem; padding-top: 1.25rem; }
```

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `node --test tests/templates.test.js`

Expected: all template and stylesheet tests PASS.

- [ ] **Step 5: Commit the visual treatment**

```bash
git add tests/templates.test.js src/styles.css
git commit -m "style: refine reader journey actions"
```

### Task 4: Full verification and visual QA

**Files:**
- Verify: `tests/*.test.js`
- Verify generated output: `dist/index.html`, `dist/essays/green-from-poison-to-purity/index.html`

**Interfaces:**
- Consumes: all implementation from Tasks 1–3.
- Produces: a verified production build and visual evidence at desktop and mobile sizes.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test`

Expected: exit code 0 with no failed tests.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: exit code 0 and regenerated static output.

- [ ] **Step 3: Verify generated semantics**

Run the repository's output verifier from `package.json` if it is separate from the build. Confirm the homepage contains the direct latest-essay link and the Green page contains the archive and LinkedIn actions.

- [ ] **Step 4: Inspect desktop output**

Serve `dist`, open the homepage and Green essay at 1440 × 1000, and verify hierarchy, spacing, link visibility, no overlap, and no horizontal overflow.

- [ ] **Step 5: Inspect mobile output**

Inspect the same pages at 390 × 844. Verify the hero additions remain compact and the essay continuation actions stack and wrap cleanly.

- [ ] **Step 6: Review the final diff**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors and only intended source, test, generated-output, and documentation changes.

- [ ] **Step 7: Commit generated output if tracked**

```bash
git add dist
git commit -m "build: refresh the published reader journey"
```

Skip this commit only if `git status --short dist` confirms that build output is not tracked or unchanged.
