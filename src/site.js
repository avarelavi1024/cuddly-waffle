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
    photo: "https://images.unsplash.com/photo-1623039405147-547794f92e9e",
    image: "/images/editorial-politics.svg",
    categories: ["Politics"],
    description: "Essays on history, memory, territory, power and the narratives that shape public life."
  },
  {
    name: "Mythologies",
    slug: "mythologies",
    photo: "https://images.unsplash.com/photo-1777108177283-79143d9114b3",
    image: "/images/editorial-myths.svg",
    categories: ["Culture"],
    description: "Ancient stories, literary symbols and cultural figures re-read from the present."
  },
  {
    name: "Cities",
    slug: "cities",
    photo: "https://images.unsplash.com/photo-1653164579768-ea97833b3b03",
    image: "/images/editorial-cities.svg",
    categories: ["Cities"],
    description: "Urban life, belonging, tourism, housing and the difference between visiting and living."
  },
  {
    name: "Art, Design & Visual Culture",
    slug: "visual-culture",
    photo: "https://images.unsplash.com/photo-1627843240043-aa499ed215e7",
    image: "/images/editorial-visual-culture.svg",
    categories: ["Art, Design & Visual Culture"],
    description: "Art, design, colour, images and material culture examined through the visual systems that shape how ideas are read."
  },
  {
    name: "Health",
    slug: "health",
    photo: "https://images.unsplash.com/photo-1567980145038-eca35242bb75",
    image: "/images/editorial-nutrition.svg",
    categories: ["Health"],
    description: "Nutrition, bodies, behaviour and the social conditions that shape health choices."
  },
  {
    name: "Business",
    slug: "business",
    photo: "https://images.unsplash.com/photo-1544816155-12df9643f363",
    image: "/images/editorial-business.svg",
    categories: ["Business"],
    description: "Work, brands, digital systems and the everyday organisation of modern businesses."
  },
  {
    name: "Open Questions",
    slug: "open-questions",
    photo: "https://images.unsplash.com/photo-1646006409288-d520d7246870",
    image: "/images/editorial-open-questions.svg",
    categories: [],
    description: "A rotating archive of questions that may become future essays."
  }
];

// Editorial photography. Unsplash images (Unsplash License) are served from
// images.unsplash.com; local files live in src/images.
export const essayPhotos = {
  "breogans-tower-galicia-and-ireland": "https://images.unsplash.com/photo-1543191878-f6a3e470454e",
  "green-from-poison-to-purity": "/images/green-willow-bough.jpg",
  "ireland-and-spain-political-culture": "https://images.unsplash.com/photo-1661887332909-93e6c9a4e21a",
  "why-do-we-talk-about-willpower-food": "https://images.unsplash.com/photo-1600881329755-8b3afb279b27",
  "nutrition-for-real-people": "https://images.unsplash.com/photo-1617500603321-bcd6286973b7",
  "eating-well-choice-or-privilege": "https://images.unsplash.com/photo-1646326760697-59a7f96cc8c5",
  "myths-change-when-society-changes": "https://images.unsplash.com/photo-1742548991283-fac7aa1a50fa",
  "cities-easier-to-visit-than-live-in": "https://images.unsplash.com/photo-1653164488636-7407bec89281"
};

export function photoUrl(src, width = 1200) {
  if (!src.startsWith("https://images.unsplash.com/")) return src;
  return `${src}?auto=format&fit=crop&w=${width}&q=80`;
}

export function photoSrcset(src) {
  if (!src.startsWith("https://images.unsplash.com/")) return "";
  return [640, 1000, 1600].map((width) => `${photoUrl(src, width)} ${width}w`).join(", ");
}
