import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadEssays, parseFrontmatter, readingTime } from "../src/content.js";

function essaySource(overrides = {}, body = "A substantive published essay body contains enough words to meet the editorial schema requirements during isolated fixture tests.") {
  const data = {
    title: "Example Essay",
    subtitle: "A subtitle",
    date: "2026-02-01",
    year: "2026",
    category: "Culture",
    tags: ["culture"],
    excerpt: "An excerpt",
    image: "example.svg",
    status: "published",
    ...overrides
  };

  return `---\n${Object.entries(data)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? `[${value.map((item) => `\"${item}\"`).join(", ")}]` : typeof value === "string" ? `\"${value}\"` : value}`)
    .join("\n")}\n---\n\n${body}`;
}

async function fixtureDir(files) {
  const dir = join(process.cwd(), `.tmp-content-test-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  await mkdir(dir, { recursive: true });
  await Promise.all(Object.entries(files).map(([file, source]) => writeFile(join(dir, file), source)));
  return dir;
}

async function cleanupFixture(dir) {
  await rm(dir, { recursive: true, force: true });
}

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
  const dir = await fixtureDir({
    "older-essay.md": essaySource({ title: "Older", subtitle: "Sub", date: "2026-01-01", category: "Culture", tags: ["a"], excerpt: "Older excerpt", image: "old.svg", curated: false, featured: false }, "Older body contains more than twenty words so it remains valid under the strict editorial schema while preserving the loader sorting behavior assertion."),
    "newer-essay.md": essaySource({ title: "Newer", subtitle: "Sub", category: "Cities", tags: ["b"], excerpt: "Newer excerpt", image: "new.svg", curated: true, featured: true }, "Newer body contains more than twenty words so it remains valid under the strict editorial schema while preserving this loader behavior assertion." )
  });
  test.after(() => cleanupFixture(dir));

  const essays = await loadEssays(dir);
  assert.equal(essays[0].slug, "newer-essay");
  assert.equal(essays[0].title, "Newer");
  assert.equal(essays[0].bodyHtml, "<p>Newer body contains more than twenty words so it remains valid under the strict editorial schema while preserving this loader behavior assertion.</p>");
});

test("loadEssays rejects unsupported publication states with the filename", async () => {
  const dir = await fixtureDir({
    "invalid.md": essaySource({ status: "private" }, "This fixture contains more than twenty words so publication-body validation cannot hide the intended unsupported-status failure from this focused test case.")
  });
  test.after(() => cleanupFixture(dir));
  await assert.rejects(loadEssays(dir), /invalid\.md: status must be published, coming-soon, or draft/);
});

test("loadEssays rejects inconsistent date and year", async () => {
  const dir = await fixtureDir({
    "wrong-year.md": essaySource({ date: "2026-02-01", year: "2025" }, "This fixture contains more than twenty words so publication-body validation cannot hide the intended year-mismatch failure from this focused test case.")
  });
  test.after(() => cleanupFixture(dir));
  await assert.rejects(loadEssays(dir), /wrong-year\.md: year must match date/);
});

test("loadEssays allows exactly one featured published essay", async () => {
  const dir = await fixtureDir({
    "one.md": essaySource({ featured: true }, "This first published fixture contains enough words to satisfy the substantive-body rule while testing duplicate featured publications in isolation today."),
    "two.md": essaySource({ title: "Two", featured: true }, "This second published fixture also contains enough words to satisfy the substantive-body rule while testing duplicate featured publications in isolation today.")
  });
  test.after(() => cleanupFixture(dir));
  await assert.rejects(loadEssays(dir), /Only one published essay may be featured/);
});

test("loadEssays preserves draft records for build-time filtering", async () => {
  const dir = await fixtureDir({
    "draft.md": essaySource({ status: "draft" }, "Draft body that is not public.")
  });
  test.after(() => cleanupFixture(dir));
  const [essay] = await loadEssays(dir);
  assert.equal(essay.status, "draft");
  assert.match(essay.sourceFile, /draft\.md$/);
});
