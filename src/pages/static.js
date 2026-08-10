import { pageShell } from "../components.js";
import { escapeHtml } from "../markdown.js";

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
    path: "/about/",
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
    path: "/contact/",
    body: `<main class="contact-page">
      <article class="contact-letter">
        <header class="contact-letter-header">
          <span>Ana Varela</span>
          <span>Contact</span>
        </header>
        <div class="contact-letter-copy">
          <p class="contact-letter-label">Contact</p>
          <h1>Contact</h1>
          <p>If something here made you think, connect ideas or see a topic differently, I’d be glad to hear from you. Reach out through LinkedIn or email below.</p>
          <div class="contact-letter-links">
            <a href="https://www.linkedin.com/in/ana-varela-vilariño-7aa95b235" target="_blank" rel="noopener noreferrer">LinkedIn: www.linkedin.com/in/ana-varela-vilariño-7aa95b235<span class="sr-only"> (opens in a new tab)</span></a>
            <a href="mailto:avarelavi@gmail.com">Email: avarelavi@gmail.com</a>
          </div>
        </div>
      </article>
    </main>`
  });
}

export function renderNotFoundPage() {
  return pageShell({
    title: "Page not found",
    description: "The requested page could not be found in the Mini Theses archive.",
    path: "/404.html",
    body: `<main class="text-page">
      <section class="page-title split-title">
        <p class="kicker">404</p>
        <h1>Page not found</h1>
        <p>The page you are looking for may have moved or may no longer exist.</p>
      </section>
      <section class="route-cards">
        <a href="/"><span>Home</span><strong>Return to the archive</strong></a>
        <a href="/projects/"><span>Projects</span><strong>Browse essays</strong></a>
      </section>
    </main>`
  });
}
