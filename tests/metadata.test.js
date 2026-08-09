import { test } from "node:test";
import assert from "node:assert/strict";
import { absoluteUrl } from "../src/site.js";
import { renderMetadata } from "../src/metadata.js";

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

test("renderMetadata escapes dynamic attribute values", () => {
  const html = renderMetadata({
    title: 'Example "<title>',
    description: 'A & B',
    path: "/essays/example/",
    image: "/images/social.png",
    type: "website"
  });

  assert.match(html, /property="og:title" content="Example &quot;&lt;title&gt;"/);
  assert.match(html, /name="description" content="A &amp; B"/);
});

test("renderMetadata omits article fields for non-article pages", () => {
  const html = renderMetadata({
    title: "About",
    description: "About this archive.",
    path: "/about/",
    image: "/images/social-about.png",
    type: "website",
    article: { publishedTime: "2026-08-09", section: "Culture", tags: ["culture"] }
  });

  assert.doesNotMatch(html, /property="article:/);
});
