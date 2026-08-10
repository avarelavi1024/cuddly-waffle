import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { deflateSync } from "node:zlib";
import { verifyOutput } from "../src/verify-output.js";

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length, 0);
  typeBytes.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), data.length + 8);
  return chunk;
}

function pngFixture(width = 1200, height = 630) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const rowLength = (width * 3) + 1;
  const raster = Buffer.alloc(rowLength * height);
  return Buffer.concat([
    signature,
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(raster)),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

const validPngFixture = pngFixture();

function metadata({
  route = "/",
  canonical = `https://ana-varela.vercel.app${route}`,
  ogUrl = canonical,
  image = "https://ana-varela.vercel.app/images/social-default.png",
  type = "website",
  publishedTime,
  omit = []
} = {}) {
  const omitted = new Set(omit);
  return [
    ["canonical", `<link rel="canonical" href="${canonical}">`],
    ["description", `<meta name="description" content="Example description.">`],
    ["author", `<meta name="author" content="Ana Varela Vilariño">`],
    ["og:title", `<meta property="og:title" content="Example title">`],
    ["og:description", `<meta property="og:description" content="Example description.">`],
    ["og:type", `<meta property="og:type" content="${type}">`],
    ["og:url", `<meta property="og:url" content="${ogUrl}">`],
    ["og:image", `<meta property="og:image" content="${image}">`],
    ["twitter:card", `<meta name="twitter:card" content="summary_large_image">`],
    ["twitter:title", `<meta name="twitter:title" content="Example title">`],
    ["twitter:description", `<meta name="twitter:description" content="Example description.">`],
    ["twitter:image", `<meta name="twitter:image" content="${image}">`],
    ["article:published_time", publishedTime ? `<meta property="article:published_time" content="${publishedTime}">` : ""]
  ].filter(([key]) => !omitted.has(key)).map(([, tag]) => tag).join("");
}

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
    "index.html": `${metadata()}<img src="/images/social-default.png" alt="">`,
    "images/social-default.png": validPngFixture
  });

  await assert.doesNotReject(verifyOutput(outputDir));
});

test("verifyOutput rejects a canonical from the wrong origin", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": metadata({ canonical: "https://example.com/" }),
    "images/social-default.png": validPngFixture
  });

  await assert.rejects(
    verifyOutput(outputDir),
    /Canonical URL must use https:\/\/ana-varela\.vercel\.app origin: https:\/\/example\.com\/ in \//
  );
});

test("verifyOutput rejects a canonical whose path does not match its output route", async (t) => {
  const outputDir = await outputFixture(t, {
    "about/index.html": metadata({ route: "/about/", canonical: "https://ana-varela.vercel.app/contact/" }),
    "images/social-default.png": validPngFixture
  });

  await assert.rejects(
    verifyOutput(outputDir),
    /Canonical URL mismatch: expected https:\/\/ana-varela\.vercel\.app\/about\/, got https:\/\/ana-varela\.vercel\.app\/contact\/ in \/about\//
  );
});

test("verifyOutput rejects duplicate canonical links", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `${metadata()}<link rel="canonical" href="https://ana-varela.vercel.app/">`,
    "images/social-default.png": validPngFixture
  });

  await assert.rejects(verifyOutput(outputDir), /Expected exactly one canonical URL in \/, found 2/);
});

test("verifyOutput permits the archive alias to canonicalize to projects", async (t) => {
  const outputDir = await outputFixture(t, {
    "archive/index.html": metadata({
      route: "/archive/",
      canonical: "https://ana-varela.vercel.app/projects/",
      ogUrl: "https://ana-varela.vercel.app/projects/"
    }),
    "images/social-default.png": validPngFixture
  });

  await assert.doesNotReject(verifyOutput(outputDir));
});

test("verifyOutput reports missing promised Open Graph and Twitter fields", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": metadata({ omit: ["og:description", "twitter:title", "twitter:image"] }),
    "images/social-default.png": validPngFixture
  });

  await assert.rejects(verifyOutput(outputDir), (error) => {
    assert.match(error.message, /Missing metadata field: og:description in \//);
    assert.match(error.message, /Missing metadata field: twitter:title in \//);
    assert.match(error.message, /Missing metadata field: twitter:image in \//);
    return true;
  });
});

test("verifyOutput reports non-absolute canonical and social URLs", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `<link rel="canonical" href="/"><meta property="og:image" content="/images/social-default.png"><img src="/images/social-default.png" alt="">`,
    "images/social-default.png": validPngFixture
  });

  await assert.rejects(verifyOutput(outputDir), (error) => {
    assert.match(error.message, /Non-absolute canonical URL: \/ in \//);
    assert.match(error.message, /Non-absolute Open Graph image URL: \/images\/social-default\.png in \//);
    return true;
  });
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

test("verifyOutput reports a missing metadata-only social image", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `<link rel="canonical" href="https://ana-varela.vercel.app/"><meta property="og:image" content="https://ana-varela.vercel.app/images/missing.png">`
  });

  await assert.rejects(verifyOutput(outputDir), /Missing asset: \/images\/missing\.png/);
});

test("verifyOutput reports invalid social image dimensions", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `<link rel="canonical" href="https://ana-varela.vercel.app/"><meta property="og:image" content="https://ana-varela.vercel.app/images/social-small.png">`,
    "images/social-small.png": pngFixture(600, 315)
  });

  await assert.rejects(
    verifyOutput(outputDir),
    /Invalid social image dimensions: \/images\/social-small\.png \(expected 1200x630, got 600x315\)/
  );
});

test("verifyOutput rejects an off-origin Open Graph image", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `<link rel="canonical" href="https://ana-varela.vercel.app/"><meta property="og:image" content="https://cdn.example.com/social.png">`
  });

  await assert.rejects(
    verifyOutput(outputDir),
    /Off-origin Open Graph image URL: https:\/\/cdn\.example\.com\/social\.png in \//
  );
});

test("verifyOutput rejects a truncated PNG", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `<link rel="canonical" href="https://ana-varela.vercel.app/"><meta property="og:image" content="https://ana-varela.vercel.app/images/truncated.png">`,
    "images/truncated.png": validPngFixture.subarray(0, -12)
  });

  await assert.rejects(
    verifyOutput(outputDir),
    /Invalid social image: \/images\/truncated\.png \(expected complete PNG\)/
  );
});

test("verifyOutput rejects a PNG with corrupt chunk data", async (t) => {
  const corruptedPng = Buffer.from(validPngFixture);
  corruptedPng[41] ^= 0xff;
  const outputDir = await outputFixture(t, {
    "index.html": `<link rel="canonical" href="https://ana-varela.vercel.app/"><meta property="og:image" content="https://ana-varela.vercel.app/images/corrupt.png">`,
    "images/corrupt.png": corruptedPng
  });

  await assert.rejects(
    verifyOutput(outputDir),
    /Invalid social image: \/images\/corrupt\.png \(expected complete PNG\)/
  );
});

test("verifyOutput reports a social image that is not a PNG", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `<link rel="canonical" href="https://ana-varela.vercel.app/"><meta property="og:image" content="https://ana-varela.vercel.app/images/social.png">`,
    "images/social.png": "not a PNG"
  });

  await assert.rejects(
    verifyOutput(outputDir),
    /Invalid social image: \/images\/social\.png \(expected PNG\)/
  );
});

test("verifyOutput rejects a relative 404 canonical when one is present", async (t) => {
  const outputDir = await outputFixture(t, {
    "404.html": `<link rel="canonical" href="/404.html"><meta property="og:image" content="https://ana-varela.vercel.app/images/social-default.png">`,
    "images/social-default.png": validPngFixture
  });

  await assert.rejects(verifyOutput(outputDir), /Non-absolute canonical URL: \/404\.html/);
});

test("verifyOutput requires a canonical on the generated 404 page", async (t) => {
  const outputDir = await outputFixture(t, {
    "404.html": metadata({ route: "/404.html", omit: ["canonical"] }),
    "images/social-default.png": validPngFixture
  });

  await assert.rejects(verifyOutput(outputDir), /Missing canonical URL: \/404\.html/);
});

test("verifyOutput requires local references to resolve to files", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `<link rel="canonical" href="https://ana-varela.vercel.app/"><meta property="og:image" content="https://ana-varela.vercel.app/images/social-default.png"><img src="/images/placeholder" alt="">`,
    "images/social-default.png": validPngFixture,
    "images/placeholder/keep.txt": "placeholder directory"
  });

  await assert.rejects(verifyOutput(outputDir), /Missing asset: \/images\/placeholder/);
});

test("verifyOutput ignores attribute-like text outside start tags", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `${metadata()}<p>Example source text: src='/missing.png'</p><!-- <img src="/commented.png"> --><script>const example = '<a href="/script-link/">';</script><style>/* <img src="/style-image.png"> */</style>`,
    "images/social-default.png": validPngFixture
  });

  await assert.doesNotReject(verifyOutput(outputDir));
});

test("verifyOutput ignores metadata tags inside comments", async (t) => {
  const outputDir = await outputFixture(t, {
    "index.html": `<meta property="og:image" content="https://ana-varela.vercel.app/images/social-default.png"><!-- <link rel="canonical" href="https://ana-varela.vercel.app/"> -->`,
    "images/social-default.png": validPngFixture
  });

  await assert.rejects(verifyOutput(outputDir), /Missing canonical URL: \//);
});

test("verifyOutput resolves query or fragment suffixes in internal references", async (t) => {
  const outputDir = await outputFixture(t, {
    "404.html": `${metadata({ route: "/404.html" })}<a href="/#top">Home</a>`,
    "index.html": `${metadata()}<a href="/about/?from=home">About</a>`,
    "about/index.html": metadata({ route: "/about/" }),
    "images/social-default.png": validPngFixture
  });

  await assert.doesNotReject(verifyOutput(outputDir));
});
