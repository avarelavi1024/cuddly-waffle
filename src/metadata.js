import { escapeHtml } from "./markdown.js";
import { absoluteUrl, site } from "./site.js";

export function renderMetadata({ title, description, path, image = site.defaultSocialImage, type = "website", article }) {
  const canonicalUrl = absoluteUrl(path);
  const socialImageUrl = absoluteUrl(image);
  const articleTags = type === "article" && article
    ? [
      `<meta property="article:published_time" content="${escapeHtml(article.publishedTime)}">`,
      `<meta property="article:section" content="${escapeHtml(article.section)}">`,
      ...article.tags.map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}">`),
      ...(site.authorUrl ? [`<meta property="article:author" content="${escapeHtml(site.authorUrl)}">`] : [])
    ]
    : [];

  return [
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="author" content="${escapeHtml(site.name)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:type" content="${escapeHtml(type)}">`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}">`,
    `<meta property="og:image" content="${escapeHtml(socialImageUrl)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(socialImageUrl)}">`,
    ...articleTags
  ].join("\n");
}
