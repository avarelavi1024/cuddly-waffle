# Contact Editorial Letter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Contact as a serious cream-paper editorial letter while preserving the existing paragraph, LinkedIn destination and email address exactly.

**Architecture:** Replace the current dark compact panel with semantic header, copy and link-list elements inside the existing static page renderer. Scope the visual treatment to Contact-specific classes so About, essays, navigation and the global palette remain unchanged.

**Tech Stack:** Dependency-free Node.js HTML templates, responsive CSS, Node test runner.

## Global Constraints

- Preserve the existing Contact paragraph, LinkedIn URL and email address exactly.
- Use `Contact` as the only new visible heading; do not add promotional wording.
- Use the existing cream paper and ink variables.
- Links appear in two columns on wide screens and stack on mobile.
- Preserve safe new-window markup, keyboard focus visibility and accessible hidden text.
- Do not change About copy, footer copy, global navigation or the global colour palette.
- Do not add runtime or package dependencies.

---

## File map

- `src/pages/static.js`: semantic Contact markup and exact preserved content.
- `src/styles.css`: letter-like layout, rules, typography, links and responsive stacking.
- `tests/templates.test.js`: structural, copy-preservation and accessibility regression tests.

### Task 1: Semantic editorial-letter markup

**Files:**
- Modify: `tests/templates.test.js`
- Modify: `src/pages/static.js`

**Interfaces:**
- Consumes: existing `renderContactPage()` API with no arguments.
- Produces: `.contact-letter`, `.contact-letter-header`, `.contact-letter-copy` and `.contact-letter-links` markup while retaining the exact destinations.

- [ ] **Step 1: Write failing Contact structure tests**

Keep the existing safe LinkedIn test and add:

```js
test("Contact renders the approved editorial-letter structure and exact copy", () => {
  const html = renderContactPage();

  assert.match(html, /<main class="contact-page"/);
  assert.match(html, /<article class="contact-letter">/);
  assert.match(html, /<h1>Contact<\/h1>/);
  assert.match(html, /If something here made you think, connect ideas or see a topic differently, I’d be glad to hear from you\. Reach out through LinkedIn or email below\./);
  assert.match(html, /class="contact-letter-links"/);
  assert.match(html, /LinkedIn: www\.linkedin\.com\/in\/ana-varela-vilariño-7aa95b235/);
  assert.match(html, /Email: avarelavi@gmail\.com/);
  assert.match(html, /href="mailto:avarelavi@gmail\.com"/);
  assert.doesNotMatch(html, /Let’s talk|A note from Ana/);
});
```

- [ ] **Step 2: Run the template tests and verify RED**

Run: `node --test --test-isolation=none tests/templates.test.js`

Expected: the new class names and heading are missing.

- [ ] **Step 3: Replace the Contact markup**

Change only the `body` passed by `renderContactPage()`:

```js
body: `<main class="contact-page">
  <article class="contact-letter">
    <header class="contact-letter-header">
      <span>Ana Varela</span>
      <span>Contact</span>
    </header>
    <div class="contact-letter-copy">
      <p class="contact-letter-label">Contact</p>
      <h1>Contact</h1>
      <p>If something here made you think, connect ideas or see a topic differently, I’d be glad to hear from you. Reach out through LinkedIn or email below.</p>
      <div class="contact-letter-links">
        <a href="https://www.linkedin.com/in/ana-varela-vilariño-7aa95b235" target="_blank" rel="noopener noreferrer"><span>LinkedIn: www.linkedin.com/in/ana-varela-vilariño-7aa95b235</span><span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>
        <a href="mailto:avarelavi@gmail.com"><span>Email: avarelavi@gmail.com</span><span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </article>
</main>`
```

The destinations, paragraph, visible LinkedIn URL and visible email address remain byte-for-byte equivalent to the current content.

- [ ] **Step 4: Run template tests and verify GREEN**

Run: `node --test --test-isolation=none tests/templates.test.js`

Expected: all template tests pass, including the existing independent LinkedIn safety assertion after updating it to match the nested visible label.

- [ ] **Step 5: Commit semantic markup**

```powershell
git add src/pages/static.js tests/templates.test.js
git commit -m "refactor: structure Contact as editorial letter"
```

### Task 2: Cream editorial styling and responsive links

**Files:**
- Modify: `src/styles.css`
- Modify: `tests/templates.test.js`

**Interfaces:**
- Consumes: Task 1 class names.
- Produces: cream Contact canvas, narrow letter column, upper rule, restrained links, keyboard focus and mobile stacking.

- [ ] **Step 1: Add a failing stylesheet regression test**

Use the existing `readFile` import and add:

```js
test("Contact stylesheet uses the paper palette and mobile link stacking", async () => {
  const css = await readFile("src/styles.css", "utf8");

  assert.match(css, /\.contact-page\s*\{[^}]*background:\s*var\(--paper\)/s);
  assert.match(css, /\.contact-letter-links\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media[^}]+max-width:\s*[^)]+\)[\s\S]*?\.contact-letter-links\s*\{[^}]*grid-template-columns:\s*1fr/s);
});
```

- [ ] **Step 2: Run the template tests and verify RED**

Run: `node --test --test-isolation=none tests/templates.test.js`

Expected: the approved Contact CSS rules are absent.

- [ ] **Step 3: Replace obsolete dark Contact rules**

Remove the `.compact-contact`, `.contact-original`, dark Contact footer overrides and unused dark `.contact-hero`/`.contact-grid` rules. Add the approved scoped rules:

```css
.contact-page {
  min-height: 70vh;
  background: var(--paper);
  color: var(--ink);
}

.contact-letter {
  max-width: 980px;
  margin: 0 auto;
}

.contact-letter-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-size: 11px;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.contact-letter-copy {
  max-width: 640px;
  margin: clamp(64px, 10vw, 112px) auto 0;
}

.contact-letter-label {
  margin: 0 0 12px;
  color: var(--muted);
  font-family: var(--serif);
  font-style: italic;
}

.contact-letter-copy h1 {
  margin: 0 0 clamp(28px, 4vw, 44px);
  font-size: clamp(52px, 8vw, 92px);
  font-weight: 400;
  letter-spacing: -.04em;
  line-height: .95;
}

.contact-letter-copy > p:last-of-type {
  margin: 0 0 clamp(36px, 6vw, 56px);
  color: var(--muted);
  font-family: var(--serif);
  font-size: clamp(18px, 2vw, 22px);
  line-height: 1.65;
}

.contact-letter-links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(18px, 4vw, 32px);
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

.contact-letter-links a {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 0 0 9px;
  border-bottom: 1px solid var(--ink);
  color: var(--ink);
  font-size: 11px;
  letter-spacing: .12em;
  text-decoration: none;
  text-transform: uppercase;
}

.contact-letter-links a:hover {
  color: var(--red);
  border-bottom-color: var(--red);
}
```

Inside the existing narrow-screen media query, add:

```css
.contact-letter-header {
  gap: 24px;
}

.contact-letter-links {
  grid-template-columns: 1fr;
}
```

Do not replace the project’s shared `:focus-visible` treatment; ensure `.contact-letter-links a:focus-visible` is included if the shared selector list is explicit.

- [ ] **Step 4: Run focused tests and build**

Run:

```powershell
node --test --test-isolation=none tests/templates.test.js
node src/build.js
node src/verify-output.js dist
```

Expected: all commands exit 0.

- [ ] **Step 5: Inspect desktop, mobile and keyboard states**

Serve `dist` and inspect `/contact/` at approximately 1440 px and 390 px widths. Confirm the page uses cream paper, the copy remains narrow and readable, links stack at mobile width, no URL overflows, and Tab reveals a visible focus state on both links.

- [ ] **Step 6: Commit Contact styling**

```powershell
git add src/styles.css tests/templates.test.js
git commit -m "style: give Contact an editorial letter layout"
```

### Task 3: Contact regression verification

**Files:**
- Verify: `dist/contact/index.html`
- Verify: `src/pages/static.js`
- Verify: `src/styles.css`

**Interfaces:**
- Consumes: Tasks 1–2.
- Produces: evidence that Contact is ready for the existing draft PR.

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Rebuild and verify output**

Run:

```powershell
npm run build
npm run verify
```

Expected: both commands exit 0.

- [ ] **Step 3: Check exact generated content**

Run:

```powershell
rg -n "<h1>Contact</h1>|If something here made you think|linkedin.com/in/ana-varela|mailto:avarelavi@gmail.com" dist/contact/index.html
```

Expected: all four expressions match and no old `.compact-contact` or `.contact-original` markup remains.

- [ ] **Step 4: Confirm scope**

Run `git diff HEAD~2 -- src/pages/static.js src/styles.css tests/templates.test.js` and confirm About copy, footer copy, navigation and shared palette variables are untouched.

- [ ] **Step 5: Record verification without committing generated output**

Run `git status --short`; confirm `dist/` and temporary visual-review files are not staged. If no source corrections were needed, this task creates no commit.
