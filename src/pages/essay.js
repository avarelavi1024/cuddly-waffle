import { asset, essayCard, pageShell } from "../components.js";
import { escapeHtml } from "../markdown.js";

export function renderEssayPage(essay, essays) {
  const visualClass = essay.visualEdition ? " essay-page-visual" : "";
  const visualBodyClass = essay.visualEdition ? " essay-body-visual" : "";
  const publishedCandidates = essays.filter((item) => item.slug !== essay.slug && item.status === "published");
  const sameCategory = publishedCandidates.filter((item) => item.category === essay.category);
  const fallback = publishedCandidates.filter((item) => item.category !== essay.category);
  const related = [...sameCategory, ...fallback].slice(0, 2);
  const article = essay.status === "published"
    ? {
      publishedTime: essay.date,
      section: essay.category,
      tags: essay.tags
    }
    : undefined;

  return pageShell({
    title: essay.title,
    description: essay.excerpt,
    path: `/essays/${essay.slug}/`,
    image: essay.socialImage ? asset(essay.socialImage) : undefined,
    type: "article",
    article,
    body: `<main class="essay-page${visualClass}">
      <article>
        <header class="essay-hero">
          ${essay.series ? `<p class="essay-series">${escapeHtml(essay.series)}</p>` : ""}
          <p class="kicker">${escapeHtml(essay.category)} / ${escapeHtml(essay.readingTime)}</p>
          <h1>${escapeHtml(essay.title)}</h1>
          <p>${escapeHtml(essay.subtitle)}</p>
          <img${essay.series ? ` class="essay-series-artwork"` : ""} src="${escapeHtml(asset(essay.image))}" alt="Editorial illustration for ${escapeHtml(essay.title)}">
        </header>
        <div class="essay-body${visualBodyClass}">${essay.bodyHtml}</div>
      </article>
      <aside class="related">
        <h2>Read next</h2>
        ${related.length ? related.map((item) => essayCard(item)).join("") : `<p class="empty-state">More essays will appear here soon.</p>`}
        <nav class="related-actions" aria-label="Continue exploring">
          <a class="text-link" href="/projects/">Browse the complete archive</a>
          <a class="text-link" href="https://www.linkedin.com/in/ana-varela-vilariño-7aa95b235" target="_blank" rel="noopener noreferrer">New essays are announced on LinkedIn<span class="sr-only"> (opens in a new tab)</span></a>
        </nav>
      </aside>
    </main>`
  });
}
