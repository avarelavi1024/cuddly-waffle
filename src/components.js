import { escapeHtml } from "./markdown.js";
import { renderMetadata } from "./metadata.js";
import { categoryThemes, essayPhotos, photoSrcset, photoUrl, site } from "./site.js";

let archiveEssays = null;

export function setArchiveEssays(essays) {
  archiveEssays = essays;
}

export function themeEssays(theme, essays) {
  return essays.filter((essay) => theme.categories.includes(essay.category) && essay.status !== "draft");
}

export function themesWithContent(essays = archiveEssays) {
  if (!essays) return categoryThemes;
  return categoryThemes.filter((theme) => theme.slug === "open-questions" || themeEssays(theme, essays).length > 0);
}

function themeCountLabel(theme, essays) {
  if (!essays) return "";
  if (theme.slug === "open-questions") return "Questions to think with";
  const list = themeEssays(theme, essays);
  const published = list.filter((essay) => essay.status === "published").length;
  const upcoming = list.length - published;
  const parts = [];
  if (published) parts.push(`${published} ${published === 1 ? "essay" : "essays"}`);
  if (upcoming) parts.push(`${upcoming} coming soon`);
  return parts.join(" · ");
}

export function themeForCategory(category) {
  return categoryThemes.find((theme) => theme.categories.includes(category));
}

export function essayCover(essay) {
  const photo = essayPhotos[essay.slug];
  return photo ? { src: photo, artwork: false } : { src: asset(essay.image), artwork: Boolean(essay.series) };
}

export function picture(src, { alt = "", sizes = "100vw", className = "", width = 1200, eager = false } = {}) {
  const srcset = photoSrcset(src);
  return `<img${className ? ` class="${className}"` : ""} src="${escapeHtml(photoUrl(src, width))}"${srcset ? ` srcset="${escapeHtml(srcset)}" sizes="${sizes}"` : ""} alt="${escapeHtml(alt)}"${eager ? "" : ` loading="lazy"`}>`;
}

function coverImage(essay, sizes) {
  const cover = essayCover(essay);
  return picture(cover.src, { sizes, className: cover.artwork ? "essay-series-artwork" : "" });
}

export function categoryLabel(category) {
  return themeForCategory(category)?.name ?? category;
}

export function asset(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function renderHeader() {
  return `<header class="site-header">
    <a class="brand" href="/">${site.name}</a>
    <nav aria-label="Primary navigation">
      <a href="/projects/">Projects</a>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
    </nav>
  </header>`;
}

export function renderFooter() {
  return `<footer class="site-footer">
    <div class="footer-brand">
      <a class="brand" href="/">${site.name}</a>
      <p>${escapeHtml(site.description)}</p>
      <p class="footer-credit">Photography via <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash<span class="sr-only"> (opens in a new tab)</span></a></p>
    </div>
    <div>
      <strong>Archive</strong>
      <a href="/projects/">Projects</a>
      <a href="/#essays">Curated</a>
      <a href="/categories/open-questions/">Open questions</a>
    </div>
    <div>
      <strong>Explore</strong>
      ${themesWithContent().filter((theme) => theme.slug !== "open-questions").map((theme) => `<a href="/categories/${theme.slug}/">${escapeHtml(theme.name)}</a>`).join("\n      ")}
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
  <link rel="icon" href="/images/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
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
      <div class="essay-card-media">${coverImage(essay, featured ? "(max-width: 820px) 100vw, 60vw" : "(max-width: 820px) 100vw, 33vw")}</div>
      <div class="essay-card-body">
        <span>${escapeHtml(categoryLabel(essay.category))} · ${published ? escapeHtml(essay.readingTime) : "Coming soon"}</span>
        <h3>${escapeHtml(essay.title)}</h3>
        <p>${escapeHtml(essay.excerpt)}</p>
        ${published && featured ? `<em class="card-cta">Read essay <span aria-hidden="true">→</span></em>` : ""}
      </div>`;
  return `<article class="essay-card ${featured ? "essay-card-featured" : ""}" data-theme="${escapeHtml(themeForCategory(essay.category)?.slug ?? "")}">
    ${published ? `<a href="/essays/${essay.slug}/" aria-label="Read ${escapeHtml(essay.title)}">${content}</a>` : `<div class="disabled-card">${content}</div>`}
  </article>`;
}

export function smallEssayCard(essay) {
  const published = essay.status !== "coming-soon";
  const badge = published ? "" : `<b class="badge">Coming soon</b>`;
  const content = `
      <div class="small-essay-media">${coverImage(essay, "(max-width: 820px) 100vw, 33vw")}${badge}</div>
      <span>${escapeHtml(categoryLabel(essay.category))} · ${published ? escapeHtml(essay.year) : "In progress"}</span>
      <h3>${escapeHtml(essay.title)}</h3>
      <p>${escapeHtml(essay.excerpt)}</p>`;
  return `<article class="small-essay">
    ${published ? `<a href="/essays/${essay.slug}/">${content}</a>` : `<div class="disabled-card">${content}</div>`}
  </article>`;
}

export function categoryTile(theme, attributes = "", essays = archiveEssays) {
  const count = themeCountLabel(theme, essays);
  return `<a${attributes} href="/categories/${theme.slug}/" class="category-tile">${picture(theme.photo ?? theme.image, { sizes: "(max-width: 820px) 50vw, 25vw", width: 800 })}<span>${escapeHtml(theme.name)}</span>${count ? `<small>${escapeHtml(count)}</small>` : ""}</a>`;
}

export function questionItem(item, hidden = false) {
  return `<div class="question-item" data-question-item${hidden ? " hidden" : ""}><small>${escapeHtml(item.category)}</small><p>${escapeHtml(item.question)}</p></div>`;
}

export function archiveRow(essay) {
  const published = essay.status !== "coming-soon";
  const theme = themeForCategory(essay.category);
  const content = `
    <span>${escapeHtml(essay.title)}</span>
    <small>${escapeHtml(categoryLabel(essay.category))} · ${published ? escapeHtml(essay.year) : "Coming soon"}</small>`;
  const data = `data-category="${escapeHtml(essay.category)}" data-theme="${escapeHtml(theme?.slug ?? "")}" data-year="${escapeHtml(essay.year)}"`;
  return published
    ? `<a class="archive-row" href="/essays/${essay.slug}/" ${data}>${content}</a>`
    : `<div class="archive-row archive-row-disabled" ${data}>${content}</div>`;
}
