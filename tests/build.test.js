import assert from "node:assert/strict";
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { build } from "../src/build.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function essaySource(slug, status, { category = "Culture", featured = false, image = "/images/editorial-myths.svg", socialImage } = {}) {
  const body = status === "published"
    ? "This published fixture contains enough substantive words to pass editorial validation while exercising production route generation and canonical sitemap behavior in isolation."
    : "This unpublished fixture remains visible only where its publication status permits it.";

  return `---
title: "${slug[0].toUpperCase()}${slug.slice(1)} Essay"
subtitle: "A fixture subtitle"
date: "2026-08-0${status === "published" ? "3" : status === "coming-soon" ? "2" : "1"}"
year: "2026"
category: "${category}"
tags: ["fixture"]
excerpt: "A fixture excerpt for ${slug}."
image: "${image}"
${socialImage === undefined ? "" : `socialImage: "${socialImage}"\n`}
featured: ${featured}
status: "${status}"
---

${body}`;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function buildFixture(t, { onlyDraft = false, publishedSlug = "published" } = {}) {
  const root = await mkdtemp(join(tmpdir(), "editorial-build-"));
  const contentDir = join(root, "content", "essays");
  const outputDir = join(root, "dist");
  const sourceDir = join(root, "src");
  await mkdir(contentDir, { recursive: true });
  await mkdir(sourceDir, { recursive: true });

  const publicEssayFiles = onlyDraft ? [] : [
    writeFile(join(contentDir, `${publishedSlug}.md`), essaySource(publishedSlug, "published", { featured: true })),
    writeFile(join(contentDir, "upcoming.md"), essaySource("upcoming", "coming-soon", { category: "Cities" }))
  ];
  await Promise.all([
    ...publicEssayFiles,
    writeFile(join(contentDir, "draft.md"), essaySource("draft", "draft")),
    cp(join(projectRoot, "src", "styles.css"), join(sourceDir, "styles.css")),
    cp(join(projectRoot, "src", "client.js"), join(sourceDir, "client.js")),
    cp(join(projectRoot, "src", "images"), join(sourceDir, "images"), { recursive: true })
  ]);

  t.after(() => rm(root, { recursive: true, force: true }));
  return { contentDir, outputDir, sourceDir };
}

test("build preflights every essay asset before deleting existing output", async (t) => {
  const { contentDir, outputDir } = await buildFixture(t, { onlyDraft: true });
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, "keep.txt"), "preserve existing output");
  await Promise.all([
    writeFile(join(contentDir, "draft.md"), essaySource("draft", "draft", { image: "/images/missing-draft.svg" })),
    writeFile(join(contentDir, "upcoming.md"), essaySource("upcoming", "coming-soon", { socialImage: "/images/missing-upcoming.png" }))
  ]);

  await assert.rejects(build({ contentDir, outputDir }), (error) => {
    assert.match(error.message, /draft\.md: image references missing asset \/images\/missing-draft\.svg/);
    assert.match(error.message, /upcoming\.md: socialImage references missing asset \/images\/missing-upcoming\.png/);
    assert.match(error.message, /Add the file beneath src\/images or correct the frontmatter field/);
    return true;
  });
  assert.equal(await readFile(join(outputDir, "keep.txt"), "utf8"), "preserve existing output");
});

test("build generates only published essay routes", async (t) => {
  const { contentDir, outputDir } = await buildFixture(t);
  await build({ contentDir, outputDir });

  assert.equal(await exists(join(outputDir, "essays", "published", "index.html")), true);
  assert.equal(await exists(join(outputDir, "essays", "upcoming", "index.html")), false);
  assert.equal(await exists(join(outputDir, "essays", "draft", "index.html")), false);
});

test("build preserves normalized image files nested beneath src/images", async (t) => {
  const { contentDir, outputDir, sourceDir } = await buildFixture(t);
  const nestedImage = join(sourceDir, "images", "nested", "editorial-myths.svg");
  await mkdir(dirname(nestedImage), { recursive: true });
  await cp(join(projectRoot, "src", "images", "editorial-myths.svg"), nestedImage);
  await writeFile(
    join(contentDir, "published.md"),
    essaySource("published", "published", { featured: true, image: "images/nested/editorial-myths.svg" })
  );

  await build({ contentDir, outputDir });

  assert.equal(await exists(join(outputDir, "images", "nested", "editorial-myths.svg")), true);
});

test("build renders a public empty state from draft-only content", async (t) => {
  const { contentDir, outputDir } = await buildFixture(t, { onlyDraft: true });
  await build({ contentDir, outputDir });

  const home = await readFile(join(outputDir, "index.html"), "utf8");
  assert.match(home, /No essays published yet\./);
  assert.doesNotMatch(home, /Draft Essay/);
  assert.equal(await exists(join(outputDir, "essays", "draft", "index.html")), false);
});

test("public listings include coming-soon essays but exclude drafts", async (t) => {
  const { contentDir, outputDir } = await buildFixture(t);
  await build({ contentDir, outputDir });

  const projects = await readFile(join(outputDir, "projects", "index.html"), "utf8");
  const culture = await readFile(join(outputDir, "categories", "mythologies", "index.html"), "utf8");
  assert.match(projects, /archive-row-disabled/);
  assert.match(projects, /Cities \/ Coming soon/);
  assert.doesNotMatch(projects, /Draft Essay/);
  assert.match(culture, /Published Essay/);
  assert.doesNotMatch(culture, /Draft Essay/);
});

test("sitemap contains canonical public routes only", async (t) => {
  const { contentDir, outputDir } = await buildFixture(t);
  await build({ contentDir, outputDir });

  const sitemap = await readFile(join(outputDir, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(locations, [
    "https://ana-varela.vercel.app/",
    "https://ana-varela.vercel.app/projects/",
    "https://ana-varela.vercel.app/about/",
    "https://ana-varela.vercel.app/contact/",
    "https://ana-varela.vercel.app/categories/politics/",
    "https://ana-varela.vercel.app/categories/mythologies/",
    "https://ana-varela.vercel.app/categories/cities/",
    "https://ana-varela.vercel.app/categories/visual-culture/",
    "https://ana-varela.vercel.app/categories/health/",
    "https://ana-varela.vercel.app/categories/business/",
    "https://ana-varela.vercel.app/categories/open-questions/",
    "https://ana-varela.vercel.app/essays/published/"
  ]);
  assert.doesNotMatch(sitemap, /upcoming|draft|\/archive\//);
});

test("build preserves compatibility and infrastructure outputs", async (t) => {
  const { contentDir, outputDir } = await buildFixture(t);
  await build({ contentDir, outputDir });

  const notFound = await readFile(join(outputDir, "404.html"), "utf8");
  const robots = await readFile(join(outputDir, "robots.txt"), "utf8");
  assert.match(notFound, /<h1>Page not found<\/h1>/);
  assert.equal(robots, "User-agent: *\nAllow: /\nSitemap: https://ana-varela.vercel.app/sitemap.xml\n");
  assert.equal(await exists(join(outputDir, "archive", "index.html")), true);
  assert.equal(await exists(join(outputDir, "styles.css")), true);
  assert.equal(await exists(join(outputDir, "client.js")), true);
  assert.equal(await exists(join(outputDir, "images", "editorial-myths.svg")), true);
  for (const name of [
    "social-default.png",
    "social-willpower-food.png",
    "social-ireland-spain.png",
    "favicon.svg"
  ]) {
    assert.equal(await exists(join(outputDir, "images", name)), true);
  }

  const home = await readFile(join(outputDir, "index.html"), "utf8");
  assert.match(home, /<link rel="icon" href="\/images\/favicon\.svg" type="image\/svg\+xml">/);
});

test("generated pages include author metadata and article authorship only for essays", async (t) => {
  const { contentDir, outputDir } = await buildFixture(t);
  await build({ contentDir, outputDir });

  const home = await readFile(join(outputDir, "index.html"), "utf8");
  const essay = await readFile(join(outputDir, "essays", "published", "index.html"), "utf8");
  assert.match(home, /<meta name="author" content="Ana Varela Vilari/);
  assert.doesNotMatch(home, /property="article:author"/);
  assert.match(essay, /<meta name="author" content="Ana Varela Vilari/);
  assert.match(essay, /<meta property="article:author" content="https:\/\/ana-varela\.vercel\.app\/about\/">/);
});

test("social cards are 1200 by 630 raster images", async () => {
  for (const name of ["social-default.png", "social-willpower-food.png", "social-ireland-spain.png"]) {
    const bytes = await readFile(join("src/images", name));
    assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG");
    assert.equal(bytes.readUInt32BE(16), 1200);
    assert.equal(bytes.readUInt32BE(20), 630);
  }
});
