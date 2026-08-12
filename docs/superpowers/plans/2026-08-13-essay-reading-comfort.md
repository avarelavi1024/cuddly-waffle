# Essay Reading Comfort Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make long desktop essays easier to read and make the “Read next” column move naturally with the page.

**Architecture:** Change only the existing essay CSS rules and protect the approved behaviour with stylesheet regression tests. Preserve all templates, content, colours, headings, cards, and mobile typography.

**Tech Stack:** CSS, Node.js ES modules, native `node:test`.

## Global Constraints

- Remove sticky behaviour from `.related` at desktop widths.
- Use `clamp(18px, 1.35vw, 20px)` for desktop essay body text.
- Use `clamp(14px, 1.1vw, 16px)` for ordinary essay ordered lists and bibliography references.
- Preserve the existing `13–15px` “Sources for this section” scale.
- Keep the mobile essay body at 18px.
- Do not change titles, block quotes, content, colours, cards, homepage, About, or Contact.

---

### Task 1: Natural related-reading scroll

**Files:**
- Modify: `tests/templates.test.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: the existing `.related` aside rendered by `renderEssayPage`.
- Produces: a normal-flow related-reading column with top alignment and no sticky offset.

- [ ] **Step 1: Write the failing regression test**

Extend the existing reader-journey stylesheet test with assertions that `.related` uses `position: static` and does not contain a `top` offset in its base rule.

```js
const relatedRule = css.match(/\.related\s*\{([^}]*)\}/)?.[1] ?? "";
assert.match(relatedRule, /position:\s*static/);
assert.doesNotMatch(relatedRule, /\btop\s*:/);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-isolation=none tests/templates.test.js`

Expected: FAIL because the base `.related` rule currently uses `position: sticky` and `top: 88px`.

- [ ] **Step 3: Implement the minimal behaviour change**

Replace the base rule with:

```css
.related {
  position: static;
  align-self: start;
}
```

Remove the now-redundant mobile `.related { position: static; }` override.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test --test-isolation=none tests/templates.test.js`

Expected: all template tests PASS.

- [ ] **Step 5: Commit the behaviour fix**

```bash
git add tests/templates.test.js src/styles.css
git commit -m "fix: let related essays scroll naturally"
```

### Task 2: Balanced desktop reading scale

**Files:**
- Modify: `tests/templates.test.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: existing `.essay-body`, `.essay-body ol`, `.essay-body h3 + ol`, and mobile media-query rules.
- Produces: approved desktop font scales while retaining the current mobile body size.

- [ ] **Step 1: Write the failing typography test**

Add explicit assertions for the approved body and ordinary-list scales, the retained sources scale, and the retained mobile size.

```js
assert.match(css, /\.essay-body\s*\{[^}]*font-size:\s*clamp\(18px,\s*1\.35vw,\s*20px\)/s);
assert.match(css, /\.essay-body ol\s*\{[^}]*font-size:\s*clamp\(14px,\s*1\.1vw,\s*16px\)/s);
assert.match(css, /\.essay-body h3 \+ ol\s*\{[^}]*font-size:\s*clamp\(13px,\s*1\.15vw,\s*15px\)/s);
assert.match(css, /@media \(max-width:\s*600px\)[\s\S]*?\.essay-body\s*\{[^}]*font-size:\s*18px/s);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-isolation=none tests/templates.test.js`

Expected: FAIL because desktop body text currently reaches 23px and ordinary lists reach 19px.

- [ ] **Step 3: Implement the approved scales**

Change only these two declarations:

```css
.essay-body {
  font-size: clamp(18px, 1.35vw, 20px);
}

.essay-body ol {
  font-size: clamp(14px, 1.1vw, 16px);
}
```

Do not change `.essay-body h3 + ol` or the mobile `.essay-body` rule.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test --test-isolation=none tests/templates.test.js`

Expected: all template tests PASS.

- [ ] **Step 5: Commit the typography change**

```bash
git add tests/templates.test.js src/styles.css
git commit -m "style: balance long-form essay typography"
```

### Task 3: Full verification and Pull Request update

**Files:**
- Verify: `tests/*.test.js`
- Verify generated output: `dist/essays/green-from-poison-to-purity/index.html`

**Interfaces:**
- Consumes: Tasks 1 and 2.
- Produces: verified commits pushed to the existing `codex/linkedin-reader-journey` Pull Request branch.

- [ ] **Step 1: Run the complete suite**

Run: `node --test --test-isolation=none tests/*.test.js`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Build and verify generated output**

Run: `node src/build.js` followed by `node src/verify-output.js dist`.

Expected: both commands exit 0.

- [ ] **Step 3: Inspect desktop and laptop views**

Serve `dist` and inspect Green at 1440 × 1000 and 1024 × 768. Confirm that body text is visibly calmer, “Read next” moves with the page, and the column remains top-aligned.

- [ ] **Step 4: Inspect mobile preservation**

Inspect Green at 390 × 844. Confirm that body text remains 18px and the single-column layout is unchanged.

- [ ] **Step 5: Review and push**

Run `git diff --check`, confirm a clean worktree, and push `codex/linkedin-reader-journey` so Pull Request #5 and its Vercel preview update.
