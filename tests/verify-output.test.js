import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { verifyOutput } from "../src/verify-output.js";

const validPngFixture = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]);

async function outputFixture(t, files) {
  const outputDir = await mkdtemp(join(tmpdir(), "editorial-output-"));
  await Promise.all(Object.entries(files).map(async ([path, contents]) => {
    const target = join(outputDir, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents);
  }));
  t.after(() => rm(outputDir, { recursive: true, force: true }));
  return outputDir;
}

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

test("verifyOutput reports non-absolute canonical and social URLs", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `<link rel="canonical" href="/"><meta property="og:image" content="/images/social-default.png"><img src="/images/social-default.png" alt="">`,
    "images/social-default.png": validPngFixture
  });

  await assert.rejects(
    verifyOutput(outputDir),
    /Non-absolute canonical URL: \/[\s\S]*Non-absolute Open Graph image URL: \/images\/social-default\.png/
  );
});

test("verifyOutput reports public draft or upcoming essay routes", async (t) => {
  const outputDir = await outputFixture(t, {
    "essays/upcoming/index.html": `<link rel="canonical" href="https://ana-varela.vercel.app/essays/upcoming/"><meta property="og:image" content="https://ana-varela.vercel.app/images/social-default.png">`
  });

  await assert.rejects(
    verifyOutput(outputDir),
    /Public draft\/upcoming essay route: \/essays\/upcoming\//
  );
});

test("verifyOutput permits 404 metadata omission and resolves query or fragment suffixes", async (t) => {
  const outputDir = await outputFixture(t, {
    "404.html": `<meta property="og:image" content="https://ana-varela.vercel.app/images/social-default.png"><a href="/#top">Home</a>`,
    "index.html": `<link rel="canonical" href="https://ana-varela.vercel.app/"><meta property="og:image" content="https://ana-varela.vercel.app/images/social-default.png"><a href="/about/?from=home">About</a>`,
    "about/index.html": `<link rel="canonical" href="https://ana-varela.vercel.app/about/"><meta property="og:image" content="https://ana-varela.vercel.app/images/social-default.png">`
  });

  await assert.doesNotReject(verifyOutput(outputDir));
});
