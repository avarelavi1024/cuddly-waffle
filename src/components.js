import { escapeHtml } from "./markdown.js";
import { renderMetadata } from "./metadata.js";
import { categoryThemes, site } from "./site.js";

export function themeForCategory(category) {
  return categoryThemes.find((theme) => theme.categories.includes(category));
}

export function categoryLabel(category) {
  return themeForCategory(category)?.name ?? category;
}

export function asset(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function renderHeader() {
  return `<header class="site-header">
    <a class="brand" href="/">${site.name}®</a>
    <nav aria-label="Primary navigation">
      <a href="/projects/">Projects</a>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
    </nav>
  </header>`;
}

export function renderFooter() {
  return `<footer class="site-footer">
    <div>
      <strong>Archive</strong>
      <a href="/projects/">Projects</a>
      <a href="/#essays">Curated</a>
    </div>
    <div>
      <strong>Explore</strong>
      ${categoryThemes.map((theme) => `<a href="/categories/${theme.slug}/">${escapeHtml(theme.name)}</a>`).join("\n      ")}
    </div>
    <div>
      <strong>More</strong>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
      <a href="https://www.linkedin.com/in/ana-varela-vilariño-7aa95b235" target="_blank" rel="noopener noreferrer">LinkedIn<span class="sr-only"> (opens in a new tab)</span></a>
    </div>
  </footer>`;
}

function withMainContentId(body) {
  return body.replace(/<main(?=[\s>])/, `<main id="main-content"`);
}

export function pageShell({ title, description, path, body, image, type = "website", article }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} · ${escapeHtml(site.title)}</title>
  ${renderMetadata({ title, description, path, image, type, article })}
  <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${renderHeader()}
  ${withMainContentId(body)}
  ${renderFooter()}
  <script src="/client.js"></script>
</body>
</html>`;
}

export function essayCard(essay, featured = false) {
  const published = essay.status !== "coming-soon";
  const content = `
      <img${essay.series ? ` class="essay-series-artwork"` : ""} src="${escapeHtml(asset(essay.image))}" alt="">
      <span>${escapeHtml(categoryLabel(essay.category))} / ${published ? escapeHtml(essay.readingTime) : "Coming soon"}</span>
      <h3>${escapeHtml(essay.title)}</h3>
      <p>${escapeHtml(essay.excerpt)}</p>`;
  return `<article class="essay-card ${featured ? "essay-card-featured" : ""}">
    ${published ? `<a href="/essays/${essay.slug}/" aria-label="Read ${escapeHtml(essay.title)}">${content}</a>` : `<div class="disabled-card">${content}</div>`}
  </article>`;
}

export function smallEssayCard(essay) {
  const published = essay.status !== "coming-soon";
  const content = `
      <span>${escapeHtml(categoryLabel(essay.category))} / ${published ? escapeHtml(essay.year) : "Coming soon"}</span>
      <h3>${escapeHtml(essay.title)}</h3>
      <p>${escapeHtml(essay.excerpt)}</p>`;
  return `<article class="small-essay">
    ${published ? `<a href="/essays/${essay.slug}/">${content}</a>` : `<div class="disabled-card">${content}</div>`}
  </article>`;
}

export function archiveRow(essay) {
  const published = essay.status !== "coming-soon";
  const theme = themeForCategory(essay.category);
  const content = `
    <span>${escapeHtml(essay.title)}</span>
    <small>${escapeHtml(categoryLabel(essay.category))} / ${published ? escapeHtml(essay.year) : "Coming soon"}</small>`;
  const data = `data-category="${escapeHtml(essay.category)}" data-theme="${escapeHtml(theme?.slug ?? "")}" data-year="${escapeHtml(essay.year)}"`;
  return published
    ? `<a class="archive-row" href="/essays/${essay.slug}/" ${data}>${content}</a>`
    : `<div class="archive-row archive-row-disabled" ${data}>${content}</div>`;
}
