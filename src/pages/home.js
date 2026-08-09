import { essayCard, pageShell, smallEssayCard } from "../components.js";
import { escapeHtml } from "../markdown.js";
import { categoryThemes, site } from "../site.js";

const themes = categoryThemes;
const themeHref = (theme) => `/categories/${theme.slug}/`;

export const openQuestions = [
  ["Culture, society and everyday life", "Why is it easier to visit cities than to live in them?"],
  ["Culture, society and everyday life", "How does our identity change when we change environments?"],
  ["Culture, society and everyday life", "Why do we idealise certain places so much when we see them from the outside?"],
  ["Culture, society and everyday life", "What does a city reveal about the people who live in it?"],
  ["Culture, society and everyday life", "Why do some societies seem to advance faster than others in social rights?"],
  ["Culture, society and everyday life", "How do social class and context shape the decisions we call personal?"],
  ["Culture, society and everyday life", "Why are some ways of life considered aspirational while others are simply normal?"],
  ["Culture, society and everyday life", "What does it really mean to have an independent life?"],
  ["Culture, society and everyday life", "Why do some generations feel that the future has become less reachable?"],
  ["Culture, society and everyday life", "How does our idea of success change depending on the country we live in?"],
  ["Politics, history and identity", "How does history continue to shape the way a society understands politics?"],
  ["Politics, history and identity", "Why do some historical conflicts remain present decades later?"],
  ["Politics, history and identity", "What makes a nation feel united or divided?"],
  ["Politics, history and identity", "How is a national identity constructed?"],
  ["Politics, history and identity", "Why do some countries remember their past as a wound and others as a victory?"],
  ["Politics, history and identity", "Can a society move forward without agreeing on its historical memory?"],
  ["Politics, history and identity", "How does religion influence political culture even in increasingly secular societies?"],
  ["Politics, history and identity", "Why does Europe mean different things to different countries?"],
  ["Politics, history and identity", "How does politics change when territorial identity matters more than ideology?"],
  ["Politics, history and identity", "To what extent does history explain the conflicts of the present?"],
  ["Mythology, literature and symbolism", "How do myths change when society changes?"],
  ["Mythology, literature and symbolism", "Why do we still use ancient figures to explain modern problems?"],
  ["Mythology, literature and symbolism", "What does Medusa reveal about the way a society looks at women?"],
  ["Mythology, literature and symbolism", "Why does Frankenstein still feel so contemporary?"],
  ["Mythology, literature and symbolism", "What monsters does each era create to represent its fears?"],
  ["Mythology, literature and symbolism", "Why are some female figures remembered as threats?"],
  ["Mythology, literature and symbolism", "How does a myth transform when we reinterpret it from the present?"],
  ["Mythology, literature and symbolism", "What do ancient stories teach us about power, fear and guilt?"],
  ["Mythology, literature and symbolism", "Why do certain stories survive for centuries?"],
  ["Mythology, literature and symbolism", "Can fiction explain a society better than data?"],
  ["Health, nutrition and society", "Is eating well a personal choice or a social privilege?"],
  ["Health, nutrition and society", "Why do we talk so much about willpower when we talk about food?"],
  ["Health, nutrition and society", "How does the environment influence what we eat?"],
  ["Health, nutrition and society", "Why is healthy eating so often presented as an individual matter?"],
  ["Health, nutrition and society", "What role does social class play in health?"],
  ["Health, nutrition and society", "Why has the body become a constant project?"],
  ["Health, nutrition and society", "How does visual culture affect the way we understand health?"],
  ["Health, nutrition and society", "Why do we confuse wellbeing with control?"],
  ["Health, nutrition and society", "To what extent are our health decisions truly free?"],
  ["Health, nutrition and society", "How does our relationship with food change when the social context changes?"],
  ["Business, work and modern systems", "Why do some traditional companies struggle so much to digitalise?"],
  ["Business, work and modern systems", "What is lost and what is gained when a family business modernises?"],
  ["Business, work and modern systems", "Why do many businesses keep using systems that no longer serve them?"],
  ["Business, work and modern systems", "How does internal organisation affect the customer experience?"],
  ["Business, work and modern systems", "What does a shop reveal about the way we buy?"],
  ["Business, work and modern systems", "Why has aesthetics become so important in trusting a brand?"],
  ["Business, work and modern systems", "How does a company change when it starts thinking digitally?"],
  ["Business, work and modern systems", "Why do some brands feel close while others feel impersonal?"],
  ["Business, work and modern systems", "What is the difference between selling a product and building an experience?"],
  ["Business, work and modern systems", "How can small businesses compete in an increasingly automated environment?"],
  ["Digital life, technology and behaviour", "Why do we trust a beautiful website more?"],
  ["Digital life, technology and behaviour", "How does our way of thinking change when everything becomes content?"],
  ["Digital life, technology and behaviour", "Why do we feel the need to document what we do?"],
  ["Digital life, technology and behaviour", "What does our digital presence say about who we want to be?"],
  ["Digital life, technology and behaviour", "How does design influence the way we interpret information?"],
  ["Digital life, technology and behaviour", "Why do some platforms make us feel productive even when we are not?"],
  ["Digital life, technology and behaviour", "What kind of identity do we build online?"],
  ["Digital life, technology and behaviour", "Why has the visual become so important for communicating ideas?"],
  ["Digital life, technology and behaviour", "How does knowledge change when it is presented in a short format?"],
  ["Digital life, technology and behaviour", "Are we learning more, or just consuming information faster?"],
  ["Personal growth, education and ambition", "Why is it sometimes harder to choose a path than to move forward on it?"],
  ["Personal growth, education and ambition", "How do you build a professional identity when you have very different interests?"],
  ["Personal growth, education and ambition", "Why do we feel that we have to specialise in only one thing?"],
  ["Personal growth, education and ambition", "What does it mean to be multidisciplinary in a world that asks for clear labels?"],
  ["Personal growth, education and ambition", "How does ambition change when it stops being only about work?"],
  ["Personal growth, education and ambition", "Why can learning different things become a way of building judgement?"],
  ["Personal growth, education and ambition", "How does curiosity become a project?"],
  ["Personal growth, education and ambition", "Why do some people need to understand before deciding?"],
  ["Personal growth, education and ambition", "What role does writing play in organising what we think?"],
  ["Personal growth, education and ambition", "How is a voice of one's own built?"]
].map(([category, question]) => ({ category, question }));

export function renderHomePage(essays) {
  const publishedEssays = essays.filter((essay) => essay.status !== "coming-soon");
  const featured = publishedEssays.find((essay) => essay.featured) ?? publishedEssays[0] ?? essays[0];
  const selected = featured ? essays.filter((essay) => essay.slug !== featured.slug).slice(0, 3) : [];

  return pageShell({
    title: site.name,
    description: site.description,
    path: "/",
    body: `<main>
      <section class="name-hero">
        <div class="hero-copy">
          <p class="kicker">Mini Theses / Personal Archive</p>
          <h1>Ana Varela Vilariño</h1>
          <p>I collect research, visual culture and everyday questions into concise essays - a living archive of the ideas that shape how we read the world.</p>
        </div>
      </section>

      <section class="theme-marquee" aria-label="Thematic carousel">
        <div class="theme-track">
          ${[...themes, ...themes].map((theme) => `<a href="${themeHref(theme)}" class="theme-pill"><img src="${theme.image}" alt=""><span>${escapeHtml(theme.name)}</span></a>`).join("")}
        </div>
      </section>

      <section class="section latest-publication">
        <div class="section-heading">
          <h2>Latest publication</h2>
          <a href="/projects/">View projects</a>
        </div>
        ${featured ? essayCard(featured, true) : `<p class="empty-state">No essays published yet.</p>`}
      </section>

      <section class="section selected-essays" id="essays">
        <div class="section-heading">
          <h2>Selected essays</h2>
          <a href="/projects/">See all</a>
        </div>
        <div class="small-selection">${selected.map((essay) => smallEssayCard(essay)).join("")}</div>
      </section>

      <section class="section category-icons">
        <div class="section-heading">
          <h2>Available categories</h2>
          <a href="/projects/">Explore</a>
        </div>
        <div class="category-grid">${themes.map((theme) => `<a href="${themeHref(theme)}" class="category-tile"><img src="${theme.image}" alt=""><span>${escapeHtml(theme.name)}</span></a>`).join("")}</div>
      </section>

      <section class="section open-questions" id="open-questions">
        <div class="section-heading">
          <h2>Open questions</h2>
          <button type="button" class="rotate-questions" data-rotate-questions aria-label="Show another set of questions">Rotate</button>
        </div>
        <div class="question-list" data-question-list>
          ${openQuestions.map((item, index) => `<details data-question-item ${index > 2 ? "hidden" : ""}><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.category)}</p></details>`).join("")}
        </div>
      </section>

      <section class="about-strip" id="about">
        <p class="kicker">About this archive</p>
        <h2>A personal space for connecting ideas across disciplines.</h2>
        <p>This journal brings together cultural analysis, social questions, health topics, business observations and visual storytelling.</p>
        <a class="text-link" href="/about/">Read about the archive</a>
      </section>
    </main>`
  });
}
