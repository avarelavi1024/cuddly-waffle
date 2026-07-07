import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { markdownToHtml } from "./markdown.js";

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

export async function loadEssays(contentDir = "content/essays") {
  const files = (await readdir(contentDir)).filter((file) => file.endsWith(".md"));
  const essays = [];

  for (const file of files) {
    const source = await readFile(join(contentDir, file), "utf8");
    const { data, body } = parseFrontmatter(source);
    essays.push({
      slug: basename(file, ".md"),
      title: data.title,
      subtitle: data.subtitle,
      date: data.date,
      year: data.year,
      category: data.category,
      tags: data.tags ?? [],
      excerpt: data.excerpt,
      image: data.image,
      curated: Boolean(data.curated),
      featured: Boolean(data.featured),
      status: data.status ?? "published",
      readingTime: readingTime(body),
      bodyHtml: markdownToHtml(body)
    });
  }

  return essays.sort((a, b) => new Date(b.date) - new Date(a.date));
}
