import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadEssays, parseFrontmatter, readingTime } from "../src/content.js";

test("parseFrontmatter extracts metadata and body", () => {
  const parsed = parseFrontmatter(`---
title: "Example Essay"
tags: ["culture", "cities"]
curated: true
---

Body text`);

  assert.equal(parsed.data.title, "Example Essay");
  assert.deepEqual(parsed.data.tags, ["culture", "cities"]);
  assert.equal(parsed.data.curated, true);
  assert.equal(parsed.body.trim(), "Body text");
});

test("readingTime returns at least one minute", () => {
  assert.equal(readingTime("short text"), "1 min read");
});

test("loadEssays sorts newest first and derives slug", async () => {
  const dir = join(process.cwd(), ".tmp-content-test");
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "older-essay.md"), `---
title: "Older"
subtitle: "Sub"
date: "2026-01-01"
year: "2026"
category: "Culture"
tags: ["a"]
excerpt: "Older excerpt"
image: "old.svg"
curated: false
featured: false
---
Older body`);
  await writeFile(join(dir, "newer-essay.md"), `---
title: "Newer"
subtitle: "Sub"
date: "2026-02-01"
year: "2026"
category: "Cities"
tags: ["b"]
excerpt: "Newer excerpt"
image: "new.svg"
curated: true
featured: true
---
Newer body`);

  const essays = await loadEssays(dir);
  assert.equal(essays[0].slug, "newer-essay");
  assert.equal(essays[0].title, "Newer");
  assert.equal(essays[0].bodyHtml, "<p>Newer body</p>");
  await rm(dir, { recursive: true, force: true });
});
