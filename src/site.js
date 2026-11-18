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
    photo: "https://images.unsplash.com/photo-1763983592095-0c7c4cbc6380",
    image: "/images/editorial-politics.svg",
    categories: ["Politics"],
    description: "Essays on history, memory, territory, power and the narratives that shape public life."
  },
  {
    name: "Mythologies",
    slug: "mythologies",
    photo: "https://images.unsplash.com/photo-1792802141331-78bd537d7a51",
    image: "/images/editorial-myths.svg",
    categories: ["Culture"],
    description: "Ancient stories, literary symbols and cultural figures re-read from the present."
  },
  {
    name: "Cities",
    slug: "cities",
    photo: "https://images.unsplash.com/photo-1724863066925-fe32db1691bc",
    image: "/images/editorial-cities.svg",
    categories: ["Cities"],
    description: "Urban life, belonging, tourism, housing and the difference between visiting and living."
  },
  {
    name: "Art, Design & Visual Culture",
    slug: "visual-culture",
    photo: "https://images.unsplash.com/photo-1621695368258-e38f5591b0fa",
    image: "/images/editorial-visual-culture.svg",
    categories: ["Art, Design & Visual Culture"],
    description: "Art, design, colour, images and material culture examined through the visual systems that shape how ideas are read."
  },
  {
    name: "Health",
    slug: "health",
    photo: "https://images.unsplash.com/photo-1785452862485-031abfc5a031",
    image: "/images/editorial-nutrition.svg",
    categories: ["Health"],
    description: "Nutrition, bodies, behaviour and the social conditions that shape health choices."
  },
  {
    name: "Business",
    slug: "business",
    photo: "https://images.unsplash.com/photo-1769107805528-964f4de0e342",
    image: "/images/editorial-business.svg",
    categories: ["Business"],
    description: "Work, brands, digital systems and the everyday organisation of modern businesses."
  },
  {
    name: "Open Questions",
    slug: "open-questions",
    photo: "https://images.unsplash.com/photo-1632429966927-12c46c16f130",
    image: "/images/editorial-open-questions.svg",
    categories: [],
    description: "A rotating archive of questions that may become future essays."
  }
];

// Editorial photography. Unsplash images (Unsplash License) are served from
// images.unsplash.com; local files live in src/images.
export const heroPhoto = "https://images.unsplash.com/photo-1783685158361-a82d34288149";

export const essayPhotos = {
  "green-from-poison-to-purity": "/images/green-willow-bough.jpg",
  "ireland-and-spain-political-culture": "https://images.unsplash.com/photo-1777907569514-c98645696994",
  "why-do-we-talk-about-willpower-food": "https://images.unsplash.com/photo-1743715032287-d797f3349d63",
  "nutrition-for-real-people": "https://images.unsplash.com/photo-1750874681042-9fdd1c7d06e9",
  "eating-well-choice-or-privilege": "https://images.unsplash.com/photo-1748170764709-f4527015bf50",
  "myths-change-when-society-changes": "https://images.unsplash.com/photo-1777108177283-79143d9114b3",
  "cities-easier-to-visit-than-live-in": "https://images.unsplash.com/photo-1791420181340-786b0704ffba"
};

export function photoUrl(src, width = 1200) {
  if (!src.startsWith("https://images.unsplash.com/")) return src;
  return `${src}?auto=format&fit=crop&w=${width}&q=80`;
}

export function photoSrcset(src) {
  if (!src.startsWith("https://images.unsplash.com/")) return "";
  return [640, 1000, 1600].map((width) => `${photoUrl(src, width)} ${width}w`).join(", ");
}
