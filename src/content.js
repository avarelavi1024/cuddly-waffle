import { readdir, readFile } from "node:fs/promises";
import { basename, join, posix } from "node:path";
import { markdownToHtml } from "./markdown.js";

const REQUIRED_FIELDS = ["title", "subtitle", "date", "year", "category", "excerpt", "image", "status"];
const STATUSES = new Set(["published", "coming-soon", "draft"]);
const BOOLEAN_FIELDS = ["curated", "featured"];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_ASSET_SEGMENT = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/;

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

export function parseFrontmatter(source, file = "") {
  const normalized = source.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file ? `${file}: ` : ""}Essay is missing frontmatter`);

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

function invalidImagePath(file, field) {
  const kind = field === "socialImage" ? "normalized PNG path" : "normalized file path";
  throw new Error(`${file}: ${field} must be a ${kind} beneath src/images`);
}

export function normalizeEditorialImagePath(value, field, file) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${file}: ${field} must be a non-empty string when provided`);
  }

  if (value !== value.trim() || /[\u0000-\u001f\u007f"'\\]/.test(value)) {
    invalidImagePath(file, field);
  }

  const rootRelative = value.startsWith("/") ? value : `/${value}`;
  const segments = rootRelative.split("/");
  const filename = segments.at(-1) ?? "";
  if (
    !rootRelative.startsWith("/images/")
    || posix.normalize(rootRelative) !== rootRelative
    || segments.slice(2).some((segment) => !SAFE_ASSET_SEGMENT.test(segment))
    || !posix.extname(filename)
    || (field === "socialImage" && posix.extname(filename).toLowerCase() !== ".png")
  ) {
    invalidImagePath(file, field);
  }

  return rootRelative;
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
  const timestamp = Date.parse(`${data.date}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date)
    || Number.isNaN(timestamp)
    || new Date(timestamp).toISOString().slice(0, 10) !== data.date
  ) {
    throw new Error(`${file}: date must be a real calendar date in YYYY-MM-DD format`);
  }
  if (data.year !== data.date.slice(0, 4)) {
    throw new Error(`${file}: year must match date`);
  }
  if (!Array.isArray(data.tags) || data.tags.length === 0 || data.tags.some((tag) => typeof tag !== "string" || !tag.trim())) {
    throw new Error(`${file}: tags must be a non-empty array of strings`);
  }
  if (Object.hasOwn(data, "series") && (typeof data.series !== "string" || !data.series.trim())) {
    throw new Error(`${file}: series must be a non-empty string when provided`);
  }
  for (const field of BOOLEAN_FIELDS) {
    if (Object.hasOwn(data, field) && typeof data[field] !== "boolean") {
      throw new Error(`${file}: ${field} must be true or false without quotes`);
    }
  }
  normalizeEditorialImagePath(data.image, "image", file);
  if (Object.hasOwn(data, "socialImage")) {
    normalizeEditorialImagePath(data.socialImage, "socialImage", file);
  }
  if (data.status === "published" && body.trim().split(/\s+/).length < 20) {
    throw new Error(`${file}: published essays require a substantive body`);
  }
}

export function validateEssayCollection(essays) {
  const featured = essays.filter((essay) => essay.status === "published" && essay.featured === true);
  if (featured.length > 1) {
    const files = featured.map((essay) => essay.sourceFile).sort().join(", ");
    throw new Error(`Only one published essay may be featured. Conflicting files: ${files}`);
  }

  const filesByRoute = new Map();
  for (const essay of essays) {
    const route = `/essays/${essay.slug}/`;
    const files = filesByRoute.get(route) ?? [];
    files.push(essay.sourceFile);
    filesByRoute.set(route, files);
  }
  for (const [route, files] of [...filesByRoute.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    if (files.length > 1) {
      throw new Error(`Canonical essay route collision: ${route}. Conflicting files: ${files.sort().join(", ")}`);
    }
  }
}

export async function loadEssays(contentDir = "content/essays") {
  const files = (await readdir(contentDir)).filter((file) => file.endsWith(".md"));
  const essays = [];

  for (const file of files) {
    const source = await readFile(join(contentDir, file), "utf8");
    const slug = basename(file, ".md");
    if (!SLUG_PATTERN.test(slug)) {
      throw new Error(`${file}: slug must use lowercase letters, numbers, and single hyphens`);
    }
    const { data, body } = parseFrontmatter(source, file);
    validateEssay(data, body, file);
    essays.push({
      sourceFile: join(contentDir, file),
      slug,
      title: data.title,
      subtitle: data.subtitle,
      date: data.date,
      year: data.year,
      category: data.category,
      series: data.series ?? "",
      tags: data.tags,
      excerpt: data.excerpt,
      image: normalizeEditorialImagePath(data.image, "image", file),
      curated: data.curated ?? false,
      featured: data.featured ?? false,
      status: data.status,
      socialImage: Object.hasOwn(data, "socialImage")
        ? normalizeEditorialImagePath(data.socialImage, "socialImage", file)
        : "",
      readingTime: readingTime(body),
      bodyHtml: markdownToHtml(body)
    });
  }

  validateEssayCollection(essays);

  return essays.sort((a, b) => new Date(b.date) - new Date(a.date));
}
