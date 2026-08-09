import { test } from "node:test";
import assert from "node:assert/strict";
import * as templates from "../src/templates.js";

const { renderAboutPage, renderEssayPage } = templates;

const publishedEssay = {
  sourceFile: "content/essays/example-essay.md",
  slug: "example-essay",
  title: "Example Essay",
  subtitle: "A concise example subtitle.",
  date: "2026-08-09",
  year: "2026",
  category: "Culture",
  tags: ["culture", "examples"],
  excerpt: "An example essay used to verify the page renderer.",
  image: "/images/editorial-myths.svg",
  socialImage: "/images/social-example.png",
  curated: true,
  featured: true,
  status: "published",
  readingTime: "4 min read",
  bodyHtml: "<p>Example essay body.</p>"
};

test("published essay pages expose article metadata and useful image alt text", () => {
  const html = renderEssayPage(publishedEssay, [publishedEssay]);
  assert.match(html, /property="og:type" content="article"/);
  assert.match(html, /<img[^>]+alt="Editorial illustration for Example Essay"/);
});

test("the 404 page preserves the site identity and recovery links", () => {
  assert.equal(typeof templates.renderNotFoundPage, "function");
  const html = templates.renderNotFoundPage();
  assert.match(html, /<h1>Page not found<\/h1>/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/projects\/"/);
});

test("every page shell contains one main landmark and visible skip link", () => {
  const html = renderAboutPage();
  assert.equal((html.match(/<main/g) || []).length, 1);
  assert.match(html, /<a class="skip-link" href="#main-content">Skip to content<\/a>/);
  assert.match(html, /<main[^>]*id="main-content"/);
});
