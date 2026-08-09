import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEssays } from "./content.js";
import { absoluteUrl, site } from "./site.js";
import { categoryThemes, renderAboutPage, renderArchivePage, renderCategoryPage, renderContactPage, renderEssayPage, renderHomePage, renderNotFoundPage, renderProjectsPage } from "./templates.js";
import { verifyOutput } from "./verify-output.js";

async function writePage(path, html) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, html);
}

async function copyAsset(from, to) {
  await mkdir(dirname(to), { recursive: true });
  await writeFile(to, await readFile(from));
}

async function copyImages(sourceRoot, outputDir) {
  const sourceDir = join(sourceRoot, "src", "images");
  const destinationDir = join(outputDir, "images");
  await cp(sourceDir, destinationDir, { recursive: true });
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function preflightEssayAssets(essays, sourceRoot) {
  const findings = [];
  for (const essay of essays) {
    for (const field of ["image", "socialImage"]) {
      const reference = essay[field];
      if (!reference) continue;
      const sourcePath = join(sourceRoot, "src", ...reference.slice(1).split("/"));
      if (!await isFile(sourcePath)) {
        findings.push(`${essay.sourceFile}: ${field} references missing asset ${reference}. Add the file beneath src/images or correct the frontmatter field.`);
      }
    }
  }

  if (findings.length > 0) {
    throw new Error(`Editorial asset preflight failed:\n${findings.sort().join("\n")}`);
  }
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function renderSitemap(paths) {
  const urls = paths.map((path) => `  <url><loc>${escapeXml(absoluteUrl(path))}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export async function build({ contentDir = "content/essays", outputDir = "dist" } = {}) {
  const essays = await loadEssays(contentDir);
  const visibleEssays = essays.filter((essay) => essay.status !== "draft");
  const publishedEssays = essays.filter((essay) => essay.status === "published");
  const sourceRoot = resolve(contentDir, "..", "..");

  await preflightEssayAssets(essays, sourceRoot);

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  await writePage(join(outputDir, "index.html"), renderHomePage(visibleEssays));
  await writePage(join(outputDir, "archive", "index.html"), renderArchivePage(visibleEssays));
  await writePage(join(outputDir, "projects", "index.html"), renderProjectsPage(visibleEssays));
  await writePage(join(outputDir, "about", "index.html"), renderAboutPage());
  await writePage(join(outputDir, "contact", "index.html"), renderContactPage());
  await writePage(join(outputDir, "404.html"), renderNotFoundPage());

  for (const essay of publishedEssays) {
    await writePage(join(outputDir, "essays", essay.slug, "index.html"), renderEssayPage(essay, publishedEssays));
  }

  for (const theme of categoryThemes) {
    await writePage(join(outputDir, "categories", theme.slug, "index.html"), renderCategoryPage(theme, visibleEssays));
  }

  const sitemapPaths = [
    "/",
    "/projects/",
    "/about/",
    "/contact/",
    ...categoryThemes.map((theme) => `/categories/${theme.slug}/`),
    ...publishedEssays.map((essay) => `/essays/${essay.slug}/`)
  ];
  await writeFile(join(outputDir, "sitemap.xml"), renderSitemap(sitemapPaths));
  await writeFile(join(outputDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);

  await copyAsset(join(sourceRoot, "src", "styles.css"), join(outputDir, "styles.css"));
  await copyAsset(join(sourceRoot, "src", "client.js"), join(outputDir, "client.js"));
  await copyImages(sourceRoot, outputDir);
  await verifyOutput(outputDir);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  build().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
