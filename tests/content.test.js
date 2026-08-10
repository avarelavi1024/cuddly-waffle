import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as contentModule from "../src/content.js";

const { loadEssays, parseFrontmatter, readingTime } = contentModule;

function essaySource(overrides = {}, body = "A substantive published essay body contains enough words to meet the editorial schema requirements during isolated fixture tests and keeps every focused validation branch independent from the body-length rule.") {
  const data = {
    title: "Example Essay",
    subtitle: "A subtitle",
    date: "2026-02-01",
    year: "2026",
    category: "Culture",
    tags: ["culture"],
    excerpt: "An excerpt",
    image: "images/editorial-example.svg",
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
    "older-essay.md": essaySource({ title: "Older", subtitle: "Sub", date: "2026-01-01", category: "Culture", tags: ["a"], excerpt: "Older excerpt", image: "images/old.svg", curated: false, featured: false }, "Older body contains more than twenty words so it remains valid under the strict editorial schema while preserving the loader sorting behavior assertion."),
    "newer-essay.md": essaySource({ title: "Newer", subtitle: "Sub", category: "Cities", tags: ["b"], excerpt: "Newer excerpt", image: "images/new.svg", curated: true, featured: true }, "Newer body contains more than twenty words so it remains valid under the strict editorial schema while preserving this loader behavior assertion." )
  });
  test.after(() => cleanupFixture(dir));

  const essays = await loadEssays(dir);
  assert.equal(essays[0].slug, "newer-essay");
  assert.equal(essays[0].title, "Newer");
  assert.equal(essays[0].image, "/images/new.svg");
  assert.equal(essays[0].bodyHtml, "<p>Newer body contains more than twenty words so it remains valid under the strict editorial schema while preserving this loader behavior assertion.</p>");
});

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

test("loadEssays rejects impossible calendar dates", async () => {
  const dir = await fixtureDir({
    "impossible-date.md": essaySource({ date: "2026-02-31" })
  });
  test.after(() => cleanupFixture(dir));
  await assert.rejects(loadEssays(dir), /impossible-date\.md: date must be a real calendar date in YYYY-MM-DD format/);
});

test("loadEssays rejects quoted boolean flags instead of coercing them", async () => {
  for (const field of ["curated", "featured"]) {
    const file = `quoted-${field}.md`;
    const dir = await fixtureDir({ [file]: essaySource({ [field]: "false" }) });
    test.after(() => cleanupFixture(dir));
    await assert.rejects(loadEssays(dir), new RegExp(`${file}: ${field} must be true or false without quotes`));
  }
});

test("loadEssays rejects non-string optional social images", async () => {
  const dir = await fixtureDir({
    "boolean-social.md": essaySource({ socialImage: false })
  });
  test.after(() => cleanupFixture(dir));
  await assert.rejects(loadEssays(dir), /boolean-social\.md: socialImage must be a non-empty string when provided/);
});

test("loadEssays includes the filename when frontmatter is missing", async () => {
  const dir = await fixtureDir({
    "missing-frontmatter.md": "This essay has no frontmatter."
  });
  test.after(() => cleanupFixture(dir));
  await assert.rejects(loadEssays(dir), /missing-frontmatter\.md: Essay is missing frontmatter/);
});

test("loadEssays rejects unsafe slugs before they become canonical routes", async () => {
  const dir = await fixtureDir({
    "Unsafe Slug.md": essaySource()
  });
  test.after(() => cleanupFixture(dir));
  await assert.rejects(loadEssays(dir), /Unsafe Slug\.md: slug must use lowercase letters, numbers, and single hyphens/);
});

test("loadEssays rejects adversarial editorial image paths", async () => {
  const values = [
    "https://example.com/editorial.svg",
    "images/../secret.svg",
    "images\\editorial.svg",
    "images/editorial.svg\" onerror=\"alert(1)",
    "images/editorial\u0001.svg"
  ];

  for (const [index, image] of values.entries()) {
    const file = `unsafe-image-${index}.md`;
    const dir = await fixtureDir({ [file]: essaySource({ image }) });
    test.after(() => cleanupFixture(dir));
    await assert.rejects(loadEssays(dir), new RegExp(`${file}: image must be a normalized file path beneath src/images`));
  }
});

test("loadEssays requires social images to be normalized PNG paths beneath src/images", async () => {
  const dir = await fixtureDir({
    "unsafe-social.md": essaySource({ socialImage: "../social-card.svg" })
  });
  test.after(() => cleanupFixture(dir));
  await assert.rejects(loadEssays(dir), /unsafe-social\.md: socialImage must be a normalized PNG path beneath src\/images/);
});

test("loadEssays allows exactly one featured published essay", async () => {
  const dir = await fixtureDir({
    "one.md": essaySource({ featured: true }, "This first published fixture contains enough words to satisfy the substantive-body rule while testing duplicate featured publications in isolation today."),
    "two.md": essaySource({ title: "Two", featured: true }, "This second published fixture also contains enough words to satisfy the substantive-body rule while testing duplicate featured publications in isolation today.")
  });
  test.after(() => cleanupFixture(dir));
  await assert.rejects(loadEssays(dir), (error) => {
    assert.match(error.message, /Only one published essay may be featured/);
    assert.match(error.message, /one\.md/);
    assert.match(error.message, /two\.md/);
    return true;
  });
});

test("essay collection validation rejects duplicate canonical routes with conflicting files", () => {
  assert.equal(typeof contentModule.validateEssayCollection, "function");
  assert.throws(
    () => contentModule.validateEssayCollection([
      { slug: "same-route", sourceFile: "content/essays/one.md", featured: false, status: "draft" },
      { slug: "same-route", sourceFile: "content/essays/two.md", featured: false, status: "draft" }
    ]),
    (error) => {
      assert.match(error.message, /Canonical essay route collision: \/essays\/same-route\//);
      assert.match(error.message, /one\.md/);
      assert.match(error.message, /two\.md/);
      return true;
    }
  );
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
