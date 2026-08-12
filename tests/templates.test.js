import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderFooter } from "../src/components.js";
import { parseFrontmatter, readingTime } from "../src/content.js";
import { markdownToHtml } from "../src/markdown.js";
import * as templates from "../src/templates.js";

const { categoryThemes, renderAboutPage, renderCategoryPage, renderContactPage, renderEssayPage, renderHomePage } = templates;

const publishedEssay = {
  sourceFile: "content/essays/example-essay.md",
  slug: "example-essay",
  title: "Example Essay",
  subtitle: "A concise example subtitle.",
  date: "2026-08-09",
  year: "2026",
  category: "Culture",
  series: "The Secret Histories of Colour",
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

test("essay pages render optional series metadata", () => {
  const html = renderEssayPage(publishedEssay, [publishedEssay]);
  assert.match(html, /<p class="essay-series">The Secret Histories of Colour<\/p>/);
  assert.match(html, /<img class="essay-series-artwork"/);

  const withoutSeries = renderEssayPage({ ...publishedEssay, series: "" }, [publishedEssay]);
  assert.doesNotMatch(withoutSeries, /class="essay-series"/);
  assert.doesNotMatch(withoutSeries, /class="essay-series-artwork"/);
});

test("essay image attributes remain single escaped attributes with adversarial input", () => {
  const essay = { ...publishedEssay, image: '/images/editorial.svg" onerror="alert(1)' };
  const html = renderEssayPage(essay, [essay]);

  assert.match(html, /src="\/images\/editorial\.svg&quot; onerror=&quot;alert\(1\)"/);
  assert.doesNotMatch(html, /src="\/images\/editorial\.svg" onerror=/);
});

test("a template-derived essay renders exactly one top-level heading", async () => {
  const source = await readFile("content/essay-template.md", "utf8");
  const { data, body } = parseFrontmatter(source, "essay-template.md");
  const essay = {
    sourceFile: "content/essay-template.md",
    slug: "essay-template",
    ...data,
    image: `/${data.image}`,
    socialImage: `/${data.socialImage}`,
    readingTime: readingTime(body),
    bodyHtml: markdownToHtml(body)
  };
  const html = renderEssayPage(essay, [essay]);

  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
});

test("essay pages without a social image use the default raster card", () => {
  const essay = { ...publishedEssay, socialImage: "" };
  const html = renderEssayPage(essay, [essay]);

  assert.match(html, /property="og:image" content="https:\/\/ana-varela\.vercel\.app\/images\/social-default\.png"/);
  assert.match(html, /<img[^>]+src="\/images\/editorial-myths\.svg" alt="Editorial illustration for Example Essay">/);
});

test("category pages use raster social metadata while preserving editorial artwork", () => {
  const theme = categoryThemes[0];
  const html = renderCategoryPage(theme, []);

  assert.match(html, /property="og:image" content="https:\/\/ana-varela\.vercel\.app\/images\/social-default\.png"/);
  assert.match(html, new RegExp(`<img src="${theme.image}" alt="">`));
});

test("category themes retain the seven stable editorial artwork paths", () => {
  assert.deepEqual(
    categoryThemes.map(({ slug, image }) => [slug, image]),
    [
      ["politics", "/images/editorial-politics.svg"],
      ["mythologies", "/images/editorial-myths.svg"],
      ["cities", "/images/editorial-cities.svg"],
      ["visual-culture", "/images/editorial-visual-culture.svg"],
      ["health", "/images/editorial-nutrition.svg"],
      ["business", "/images/editorial-business.svg"],
      ["open-questions", "/images/editorial-open-questions.svg"]
    ]
  );

  const html = renderHomePage([publishedEssay]);
  for (const theme of categoryThemes) {
    const escapedName = theme.name.replaceAll("&", "&amp;");
    assert.match(html, new RegExp(`<span>${escapedName}<\\/span>`));
  }
});

test("Art, Design & Visual Culture retains its established public route", () => {
  const theme = categoryThemes.find(({ slug }) => slug === "visual-culture");

  assert.equal(theme.name, "Art, Design & Visual Culture");
  assert.deepEqual(theme.categories, ["Art, Design & Visual Culture"]);
  assert.equal(theme.slug, "visual-culture");

  const html = renderCategoryPage(theme, []);
  assert.match(html, /<h1>Art, Design &amp; Visual Culture<\/h1>/);
  assert.match(html, /https:\/\/ana-varela\.vercel\.app\/categories\/visual-culture\//);
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

test("question rotation exposes an accessible live region without forcing announcements", () => {
  const html = renderHomePage([publishedEssay]);
  assert.match(html, /class="question-list"[^>]+data-question-list/);
  assert.match(html, /aria-label="Show another set of questions"/);
  assert.match(html, /class="essay-series-artwork" src="\/images\/editorial-myths\.svg"/);
  assert.doesNotMatch(html, /aria-live/);
});

test("the homepage gives LinkedIn visitors a direct editorial entry path", () => {
  const html = renderHomePage([publishedEssay]);

  assert.match(html, /class="hero-positioning">Research-led essays on culture, design, health and the systems behind everyday life\.<\/p>/);
  assert.match(html, /class="text-link hero-latest-link" href="\/essays\/example-essay\/">Read the latest essay/);
  assert.match(html, /href="\/projects\/">Explore the archive<\/a>/);
  assert.doesNotMatch(html, />View projects<\/a>/);
});

test("the homepage omits the latest-essay action when nothing is published", () => {
  const html = renderHomePage([]);

  assert.doesNotMatch(html, /class="text-link hero-latest-link"/);
});

test("essay recommendations prefer the same category and fall back to other published work", () => {
  const sameCategory = { ...publishedEssay, slug: "same", title: "Same Category", featured: false };
  const fallback = { ...publishedEssay, slug: "fallback", title: "Published Fallback", category: "Health", featured: false };
  const comingSoon = { ...publishedEssay, slug: "soon", title: "Coming Soon Fixture", status: "coming-soon" };
  const draft = { ...publishedEssay, slug: "draft", title: "Draft Fixture", status: "draft" };
  const html = renderEssayPage(publishedEssay, [publishedEssay, fallback, comingSoon, sameCategory, draft]);

  assert.ok(html.indexOf("Same Category") < html.indexOf("Published Fallback"));
  assert.doesNotMatch(html, /Coming Soon Fixture|Draft Fixture/);
});

test("every essay ending offers archive and LinkedIn continuation actions", () => {
  const html = renderEssayPage(publishedEssay, [publishedEssay]);

  assert.match(html, /href="\/projects\/">Browse the complete archive<\/a>/);
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/ana-varela-vilariño-7aa95b235" target="_blank" rel="noopener noreferrer">New essays are announced on LinkedIn<span class="sr-only"> \(opens in a new tab\)<\/span><\/a>/);
  assert.match(html, /More essays will appear here soon\./);
});

test("reader journey actions use restrained responsive editorial styling", async () => {
  const html = renderHomePage([publishedEssay]);
  const css = await readFile("src/styles.css", "utf8");
  const relatedRule = css.match(/\.related\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(html, /<p class="hero-intro">I collect research/);
  assert.match(css, /\.hero-intro\s*\{[^}]*font-size:/s);
  assert.match(css, /\.hero-positioning\s*\{[^}]*font-size:/s);
  assert.match(css, /\.hero-latest-link\s*\{[^}]*display:\s*inline-flex/s);
  assert.match(css, /\.related-actions\s*\{[^}]*border-top:\s*1px solid/s);
  assert.match(css, /@media[\s\S]*?\.related-actions\s*\{[^}]*align-items:\s*flex-start/s);
  assert.match(relatedRule, /position:\s*static/);
  assert.doesNotMatch(relatedRule, /\btop\s*:/);
});

test("long-form essays use the approved desktop reading scale without shrinking mobile text", async () => {
  const css = await readFile("src/styles.css", "utf8");

  assert.match(css, /\.essay-body\s*\{[^}]*font-size:\s*clamp\(18px,\s*1\.35vw,\s*20px\)/s);
  assert.match(css, /\.essay-body ol\s*\{[^}]*font-size:\s*clamp\(14px,\s*1\.1vw,\s*16px\)/s);
  assert.match(css, /\.essay-body h3 \+ ol\s*\{[^}]*font-size:\s*clamp\(13px,\s*1\.15vw,\s*15px\)/s);
  assert.match(css, /@media \(max-width:\s*600px\)[\s\S]*?\.essay-body\s*\{[^}]*font-size:\s*18px/s);
});

test("the Contact LinkedIn link independently provides safe new-window markup", () => {
  const html = renderContactPage();
  assert.match(html, /<main[\s\S]*?<a href="https:\/\/www\.linkedin\.com\/in\/[^\"]+" target="_blank" rel="noopener noreferrer">LinkedIn:[\s\S]*?<span class="sr-only"> \(opens in a new tab\)<\/span><\/a>[\s\S]*?<\/main>/);
});

test("Contact renders the approved editorial-letter structure and exact copy", () => {
  const html = renderContactPage();

  assert.match(html, /<main[^>]*class="contact-page"/);
  assert.match(html, /<article class="contact-letter">/);
  assert.match(html, /<h1>Contact<\/h1>/);
  assert.match(html, /If something here made you think, connect ideas or see a topic differently, I’d be glad to hear from you\. Reach out through LinkedIn or email below\./);
  assert.match(html, /class="contact-letter-links"/);
  assert.match(html, /LinkedIn: www\.linkedin\.com\/in\/ana-varela-vilariño-7aa95b235/);
  assert.match(html, /Email: avarelavi@gmail\.com/);
  assert.match(html, /href="mailto:avarelavi@gmail\.com"/);
  assert.doesNotMatch(html, /Let’s talk|A note from Ana/);
});

test("Contact stylesheet uses the paper palette and responsive link grid", async () => {
  const css = await readFile("src/styles.css", "utf8");

  assert.match(css, /\.contact-page\s*\{[^}]*background:\s*var\(--paper\)/s);
  assert.match(css, /\.contact-letter-links\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media[\s\S]*?\.contact-letter-links\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(css, /@media[\s\S]*?\.essay-series-artwork\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(css, /\.essay-card \.essay-series-artwork\s*\{[^}]*object-fit:\s*contain/s);
});

test("the footer LinkedIn link independently provides safe new-window markup", () => {
  const html = renderFooter();
  assert.match(html, /<a href="https:\/\/www\.linkedin\.com\/in\/[^\"]+" target="_blank" rel="noopener noreferrer">LinkedIn<span class="sr-only"> \(opens in a new tab\)<\/span><\/a>/);
});
