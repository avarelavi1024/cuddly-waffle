export const site = Object.freeze({
  name: "Ana Varela Vilariño",
  title: "Mini Theses",
  description: "Cultural analysis, visual research and everyday questions shaped into concise essays.",
  origin: "https://ana-varela.vercel.app",
  authorUrl: "https://ana-varela.vercel.app/about/",
  defaultSocialImage: "/images/social-default.png"
});

export function absoluteUrl(path) {
  return new URL(path, `${site.origin}/`).href;
}

export const categoryThemes = [
  {
    name: "Politics & Identity",
    slug: "politics",
    image: "/images/editorial-politics.svg",
    categories: ["Politics"],
    description: "Essays on history, memory, territory, power and the narratives that shape public life."
  },
  {
    name: "Mythologies",
    slug: "mythologies",
    image: "/images/editorial-myths.svg",
    categories: ["Culture"],
    description: "Ancient stories, literary symbols and cultural figures re-read from the present."
  },
  {
    name: "Cities",
    slug: "cities",
    image: "/images/editorial-cities.svg",
    categories: ["Cities"],
    description: "Urban life, belonging, tourism, housing and the difference between visiting and living."
  },
  {
    name: "Visual Culture",
    slug: "visual-culture",
    image: "/images/editorial-visual-culture.svg",
    categories: ["Visual Culture"],
    description: "Images, platforms, aesthetics and the visual systems that shape how ideas are read."
  },
  {
    name: "Health",
    slug: "health",
    image: "/images/editorial-nutrition.svg",
    categories: ["Health"],
    description: "Nutrition, bodies, behaviour and the social conditions that shape health choices."
  },
  {
    name: "Business",
    slug: "business",
    image: "/images/editorial-business.svg",
    categories: ["Business"],
    description: "Work, brands, digital systems and the everyday organisation of modern businesses."
  },
  {
    name: "Open Questions",
    slug: "open-questions",
    image: "/images/editorial-open-questions.svg",
    categories: [],
    description: "A rotating archive of questions that may become future essays."
  }
];
