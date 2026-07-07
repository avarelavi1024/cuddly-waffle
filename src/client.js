const carousel = document.querySelector("[data-carousel]");
const next = document.querySelector("[data-carousel-next]");
const prev = document.querySelector("[data-carousel-prev]");

if (carousel && next && prev) {
  next.addEventListener("click", () => carousel.scrollBy({ left: 320, behavior: "smooth" }));
  prev.addEventListener("click", () => carousel.scrollBy({ left: -320, behavior: "smooth" }));
}

const filters = document.querySelector("[data-filters]");
const rows = [...document.querySelectorAll(".archive-row")];

if (filters) {
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    const selected = button.dataset.filter;
    filters.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    rows.forEach((row) => {
      row.hidden = selected !== "All" && row.dataset.category !== selected;
    });
  });
  filters.querySelector("[data-filter='All']")?.classList.add("active");
}

const questionItems = [...document.querySelectorAll("[data-question-item]")];
const rotateQuestions = document.querySelector("[data-rotate-questions]");
let questionOffset = 0;

function showQuestionSet(offset) {
  if (!questionItems.length) return;
  questionItems.forEach((item, index) => {
    const relative = (index - offset + questionItems.length) % questionItems.length;
    item.hidden = relative >= 3;
    if (relative >= 3) item.open = false;
  });
}

function advanceQuestions() {
  questionOffset = (questionOffset + 3) % questionItems.length;
  showQuestionSet(questionOffset);
}

if (questionItems.length > 3) {
  showQuestionSet(questionOffset);
  rotateQuestions?.addEventListener("click", advanceQuestions);
  window.setInterval(advanceQuestions, 9000);
}
