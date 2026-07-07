import { escapeHtml } from "./markdown.js";

const site = {
  name: "Ana Varela Vilariño",
  title: "Mini Theses",
  description: "Cultural analysis, visual research and everyday questions shaped into concise essays."
};

const themes = [
  { name: "Mythologies", slug: "mythologies", image: "/images/editorial-myths.svg" },
  { name: "Cities", slug: "cities", image: "/images/editorial-cities.svg" },
  { name: "Visual Culture", slug: "visual-culture", image: "/images/editorial-visual-culture.svg" },
  { name: "Health", slug: "health", image: "/images/editorial-nutrition.svg" },
  { name: "Business", slug: "business", image: "/images/editorial-business.svg" },
  { name: "Open Questions", slug: "open-questions", image: "/images/editorial-open-questions.svg" }
];

const themeHref = (theme) => theme.slug === "open-questions" ? "/#open-questions" : `/projects/#${theme.slug}`;

const openQuestions = [
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

function asset(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

function pageShell({ title, description, body, image = "/images/editorial-work-independence.svg", type = "website" }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} · ${site.title}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="${escapeHtml(type)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">${site.name}®</a>
    <nav aria-label="Primary navigation">
      <a href="/projects/">Projects</a>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
    </nav>
  </header>
  ${body}
  ${renderFooter()}
  <script src="/client.js"></script>
</body>
</html>`;
}

function essayCard(essay, featured = false) {
  const published = essay.status !== "coming-soon";
  const content = `
      <img src="${asset(essay.image)}" alt="">
      <span>${published ? `${escapeHtml(essay.category)} / ${escapeHtml(essay.readingTime)}` : `${escapeHtml(essay.category)} / Coming soon`}</span>
      <h3>${escapeHtml(published ? essay.title : "Coming soon")}</h3>
      <p>${escapeHtml(published ? essay.excerpt : essay.title)}</p>`;
  return `<article class="essay-card ${featured ? "essay-card-featured" : ""}">
    ${published ? `<a href="/essays/${essay.slug}/" aria-label="Read ${escapeHtml(essay.title)}">${content}</a>` : `<div class="disabled-card">${content}</div>`}
  </article>`;
}

function smallEssayCard(essay) {
  const published = essay.status !== "coming-soon";
  const content = `
      <span>${published ? `${escapeHtml(essay.category)} / ${escapeHtml(essay.year)}` : `${escapeHtml(essay.category)} / Coming soon`}</span>
      <h3>${escapeHtml(published ? essay.title : "Coming soon")}</h3>
      <p>${escapeHtml(published ? essay.excerpt : essay.title)}</p>`;
  return `<article class="small-essay">
    ${published ? `<a href="/essays/${essay.slug}/">${content}</a>` : `<div class="disabled-card">${content}</div>`}
  </article>`;
}

function archiveRow(essay) {
  const published = essay.status !== "coming-soon";
  const content = `
    <span>${escapeHtml(published ? essay.title : "Coming soon")}</span>
    <small>${escapeHtml(essay.category)} / ${published ? escapeHtml(essay.year) : "Coming soon"}</small>`;
  return published
    ? `<a class="archive-row" href="/essays/${essay.slug}/" data-category="${escapeHtml(essay.category)}" data-year="${escapeHtml(essay.year)}">${content}</a>`
    : `<div class="archive-row archive-row-disabled" data-category="${escapeHtml(essay.category)}" data-year="${escapeHtml(essay.year)}">${content}</div>`;
}

export function renderHomePage(essays) {
  const publishedEssays = essays.filter((essay) => essay.status !== "coming-soon");
  const featured = publishedEssays.find((essay) => essay.featured) ?? publishedEssays[0] ?? essays[0];
  const selected = essays.filter((essay) => essay.slug !== featured.slug).slice(0, 3);

  return pageShell({
    title: site.name,
    description: site.description,
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
          ${[...themes, ...themes].map((theme) => `<a href="${themeHref(theme)}" class="theme-pill"><img src="${theme.image}" alt=""><span>${theme.name}</span></a>`).join("")}
        </div>
      </section>

      <section class="section latest-publication">
        <div class="section-heading">
          <h2>Latest publication</h2>
          <a href="/projects/">View projects</a>
        </div>
        ${essayCard(featured, true)}
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
        <div class="category-grid">${themes.map((theme) => `<a href="${themeHref(theme)}" class="category-tile"><img src="${theme.image}" alt=""><span>${theme.name}</span></a>`).join("")}</div>
      </section>

      <section class="section open-questions" id="open-questions">
        <div class="section-heading">
          <h2>Open questions</h2>
          <button type="button" class="rotate-questions" data-rotate-questions>Rotate</button>
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

export function renderArchivePage(essays) {
  return renderProjectsPage(essays);
}

export function renderProjectsPage(essays) {
  return pageShell({
    title: "Projects",
    description: "Browse categories and every essay by Ana Varela Vilariño.",
    body: `<main class="projects-page">
      <section class="page-title">
        <p class="kicker">Projects</p>
        <h1>Essays, visual notes and questions in progress.</h1>
        <p>Explore the themes that shape this archive, from culture and cities to health, business and open questions.</p>
      </section>
      <section class="category-grid project-categories">
        ${themes.map((theme) => `<a id="${theme.slug}" href="#all-essays" class="category-tile"><img src="${theme.image}" alt=""><span>${theme.name}</span></a>`).join("")}
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

export function renderEssayPage(essay, essays) {
  const related = essays.filter((item) => item.slug !== essay.slug && item.category === essay.category).slice(0, 2);
  return pageShell({
    title: essay.title,
    description: essay.excerpt,
    image: asset(essay.image),
    type: "article",
    body: `<main class="essay-page">
      <article>
        <header class="essay-hero">
          <p class="kicker">${escapeHtml(essay.category)} / ${escapeHtml(essay.readingTime)}</p>
          <h1>${escapeHtml(essay.title)}</h1>
          <p>${escapeHtml(essay.subtitle)}</p>
          <img src="${asset(essay.image)}" alt="">
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

function textBlock(title, paragraphs) {
  return `<section class="text-panel">
    <div>
      <p class="kicker">${escapeHtml(title)}</p>
    </div>
    <div class="prose-stack">
      ${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </div>
  </section>`;
}

export function renderAboutPage() {
  return pageShell({
    title: "About",
    description: "About Ana Varela Vilariño and the Mini Theses archive.",
    body: `<main class="text-page">
      <section class="page-title split-title">
        <p class="kicker">About</p>
        <h1>Ana Varela Vilariño</h1>
        <p>A curious and analytical person with interests that move across business, health, culture and everyday systems.</p>
      </section>
      ${textBlock("About me", [
        "I’m Ana Varela Vilariño, a curious and analytical person with interests that move across business, health, culture and everyday systems.",
        "My background combines administration, retail experience, business operations and my current studies in Human Nutrition and Dietetics. That mix has shaped the way I think: I like understanding how things work, why people make certain decisions, how systems affect daily life and how ideas from different fields can connect.",
        "I am especially drawn to projects that require observation, structure and communication. Whether I am looking at a business process, a cultural myth, a public debate, a retail experience or a nutrition-related topic, I tend to approach it in the same way: by asking questions, researching, organising information and turning it into something clear, visual and useful.",
        "Beyond academic or professional labels, I see myself as someone who enjoys learning, connecting ideas and building things with intention."
      ])}
      ${textBlock("About this archive", [
        "This website was created as a personal space for thinking, researching and connecting ideas across disciplines.",
        "Here, I develop mini theses, visual essays and analytical projects on topics that make me curious. Some pieces are more cultural, others more social or professional. Some start from a book, a myth or a public debate; others come from practical observations about businesses, work, consumption or health.",
        "The common thread is not the topic itself, but the way I approach it: with curiosity, research, visual storytelling and a need to understand how different systems shape people’s lives.",
        "This archive is not meant to be a closed portfolio. It is a growing collection of ideas, questions and projects in progress."
      ])}
      <section class="route-cards">
        <a href="/projects/"><span>Mini theses</span><strong>Browse essays</strong></a>
        <a href="/#essays"><span>Visual essays</span><strong>See curated work</strong></a>
      </section>
    </main>`
  });
}

export function renderContactPage() {
  return pageShell({
    title: "Contact",
    description: "Contact Ana Varela Vilariño by LinkedIn or email.",
    body: `<main class="contact-page compact-contact">
      <section class="contact-original">
        <p>If something here made you think, connect ideas or see a topic differently, I’d be glad to hear from you. Reach out through LinkedIn or email below.</p>
        <div>
          <a href="https://www.linkedin.com/in/ana-varela-vilariño-7aa95b235" target="_blank" rel="noopener">LinkedIn: www.linkedin.com/in/ana-varela-vilariño-7aa95b235</a>
          <a href="mailto:avarelavi@gmail.com">Email: avarelavi@gmail.com</a>
        </div>
      </section>
    </main>`
  });
}

function renderFooter() {
  return `<footer class="site-footer">
    <div>
      <strong>Archive</strong>
      <a href="/projects/">Projects</a>
      <a href="/#essays">Curated</a>
    </div>
    <div>
      <strong>Explore</strong>
      <a href="/projects/#open-questions">Society</a>
      <a href="/projects/#mythologies">Mythology</a>
      <a href="/projects/#health">Health</a>
    </div>
    <div>
      <strong>More</strong>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
      <a href="https://www.linkedin.com/in/ana-varela-vilariño-7aa95b235" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  </footer>`;
}
