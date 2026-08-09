import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { markdownToHtml } from "./markdown.js";

const REQUIRED_FIELDS = ["title", "subtitle", "date", "year", "category", "excerpt", "image", "status"];
const STATUSES = new Set(["published", "coming-soon", "draft"]);

function parseValue(raw) {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
  }
  return value.replace(/^"|"$/g, "");
}

export function parseFrontmatter(source) {
  const normalized = source.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("Essay is missing frontmatter");

  const data = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);
    data[key] = parseValue(value);
  }

  return { data, body: match[2] };
}

export function readingTime(markdown) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}

export function validateEssay(data, body, file) {
  for (const field of REQUIRED_FIELDS) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      throw new Error(`${file}: ${field} is required`);
    }
  }
  if (!STATUSES.has(data.status)) {
    throw new Error(`${file}: status must be published, coming-soon, or draft`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(`${data.date}T00:00:00Z`))) {
    throw new Error(`${file}: date must use YYYY-MM-DD`);
  }
  if (data.year !== data.date.slice(0, 4)) {
    throw new Error(`${file}: year must match date`);
  }
  if (!Array.isArray(data.tags)) {
    throw new Error(`${file}: tags must be an array`);
  }
  if (data.status === "published" && body.trim().split(/\s+/).length < 20) {
    throw new Error(`${file}: published essays require a substantive body`);
  }
}

export async function loadEssays(contentDir = "content/essays") {
  const files = (await readdir(contentDir)).filter((file) => file.endsWith(".md"));
  const essays = [];

  for (const file of files) {
    const source = await readFile(join(contentDir, file), "utf8");
    const { data, body } = parseFrontmatter(source);
    validateEssay(data, body, file);
    essays.push({
      sourceFile: join(contentDir, file),
      slug: basename(file, ".md"),
      title: data.title,
      subtitle: data.subtitle,
      date: data.date,
      year: data.year,
      category: data.category,
      tags: data.tags,
      excerpt: data.excerpt,
      image: data.image,
      curated: Boolean(data.curated),
      featured: Boolean(data.featured),
      status: data.status,
      socialImage: data.socialImage || "",
      readingTime: readingTime(body),
      bodyHtml: markdownToHtml(body)
    });
  }

  if (essays.filter((essay) => essay.status === "published" && essay.featured === true).length > 1) {
    throw new Error("Only one published essay may be featured");
  }

  return essays.sort((a, b) => new Date(b.date) - new Date(a.date));
}
