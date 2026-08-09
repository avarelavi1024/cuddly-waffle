import { archiveRow, pageShell } from "../components.js";
import { escapeHtml } from "../markdown.js";
import { categoryThemes } from "../site.js";
import { openQuestions } from "./home.js";

const themes = categoryThemes;
const themeHref = (theme) => `/categories/${theme.slug}/`;

export function renderArchivePage(essays) {
  return renderProjectsPage(essays);
}

export function renderProjectsPage(essays) {
  return pageShell({
    title: "Projects",
    description: "Browse categories and every essay by Ana Varela Vilariño.",
    path: "/projects/",
    body: `<main class="projects-page">
      <section class="page-title">
        <p class="kicker">Projects</p>
        <h1>Essays, visual notes and questions in progress.</h1>
        <p>Explore the themes that shape this archive, from politics and identity to culture, cities, health, business and open questions.</p>
      </section>
      <section class="category-grid project-categories">
        ${themes.map((theme) => `<a id="${theme.slug}" href="${themeHref(theme)}" class="category-tile"><img src="${theme.image}" alt=""><span>${escapeHtml(theme.name)}</span></a>`).join("")}
      </section>
      <section class="section all-essays" id="all-essays">
        <div class="section-heading">
          <h2>All published essays</h2>
          <span>${essays.filter((essay) => essay.status !== "coming-soon").length} published</span>
        </div>
        <div class="archive-list">${essays.length ? essays.map((essay) => archiveRow(essay)).join("") : `<p class="empty-state">No essays published yet.</p>`}</div>
      </section>
    </main>`
  });
}

export function renderCategoryPage(theme, essays) {
  if (theme.slug === "open-questions") return renderOpenQuestionsPage(theme);

  const categoryEssays = essays.filter((essay) => theme.categories.includes(essay.category));
  const published = categoryEssays.filter((essay) => essay.status !== "coming-soon");
  const upcoming = categoryEssays.filter((essay) => essay.status === "coming-soon");

  return pageShell({
    title: theme.name,
    description: theme.description,
    path: `/categories/${theme.slug}/`,
    body: `<main class="projects-page category-page">
      <section class="page-title category-title">
        <div>
          <p class="kicker">Category</p>
          <h1>${escapeHtml(theme.name)}</h1>
          <p>${escapeHtml(theme.description)}</p>
        </div>
        <img src="${theme.image}" alt="">
      </section>
      <section class="section all-essays">
        <div class="section-heading">
          <h2>Published essays</h2>
          <span>${published.length} published</span>
        </div>
        <div class="archive-list">${published.length ? published.map((essay) => archiveRow(essay)).join("") : `<p class="empty-state">No essays published in this category yet.</p>`}</div>
      </section>
      <section class="section all-essays">
        <div class="section-heading">
          <h2>In progress</h2>
          <span>${upcoming.length} coming soon</span>
        </div>
        <div class="archive-list">${upcoming.length ? upcoming.map((essay) => archiveRow(essay)).join("") : `<p class="empty-state">No upcoming essays listed for this category.</p>`}</div>
      </section>
    </main>`
  });
}

function renderOpenQuestionsPage(theme) {
  return pageShell({
    title: theme.name,
    description: theme.description,
    path: `/categories/${theme.slug}/`,
    body: `<main class="projects-page category-page">
      <section class="page-title category-title">
        <div>
          <p class="kicker">Category</p>
          <h1>${escapeHtml(theme.name)}</h1>
          <p>${escapeHtml(theme.description)}</p>
        </div>
        <img src="${theme.image}" alt="">
      </section>
      <section class="section open-questions">
        <div class="section-heading">
          <h2>Questions in rotation</h2>
          <a href="/#open-questions">View on home</a>
        </div>
        <div class="question-list">
          ${openQuestions.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.category)}</p></details>`).join("")}
        </div>
      </section>
    </main>`
  });
}
