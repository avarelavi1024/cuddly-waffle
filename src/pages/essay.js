import { asset, essayCard, pageShell } from "../components.js";
import { escapeHtml } from "../markdown.js";

export function renderEssayPage(essay, essays) {
  const related = essays.filter((item) => item.slug !== essay.slug && item.category === essay.category).slice(0, 2);
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
    image: asset(essay.socialImage || essay.image),
    type: "article",
    article,
    body: `<main class="essay-page">
      <article>
        <header class="essay-hero">
          <p class="kicker">${escapeHtml(essay.category)} / ${escapeHtml(essay.readingTime)}</p>
          <h1>${escapeHtml(essay.title)}</h1>
          <p>${escapeHtml(essay.subtitle)}</p>
          <img src="${asset(essay.image)}" alt="Editorial illustration for ${escapeHtml(essay.title)}">
        </header>
        <div class="essay-body">${essay.bodyHtml}</div>
      </article>
      <aside class="related">
        <h2>Read next</h2>
        ${related.length ? related.map((item) => essayCard(item)).join("") : `<p class="empty-state">More essays will appear here soon.</p>`}
      </aside>
    </main>`
  });
}
