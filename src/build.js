import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { loadEssays } from "./content.js";
import { renderAboutPage, renderArchivePage, renderContactPage, renderEssayPage, renderHomePage, renderProjectsPage } from "./templates.js";

async function writePage(path, html) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, html);
}

async function copyAsset(from, to) {
  await mkdir(dirname(to), { recursive: true });
  await writeFile(to, await readFile(from));
}

async function copyImages() {
  await mkdir("dist/images", { recursive: true });
  const images = await readdir("src/images");
  for (const image of images) {
    await copyAsset(join("src/images", image), join("dist/images", image));
  }
}

async function build() {
  const essays = await loadEssays();
  await rm("dist", { recursive: true, force: true });
  await mkdir("dist", { recursive: true });

  await writePage("dist/index.html", renderHomePage(essays));
  await writePage("dist/archive/index.html", renderArchivePage(essays));
  await writePage("dist/projects/index.html", renderProjectsPage(essays));
  await writePage("dist/about/index.html", renderAboutPage());
  await writePage("dist/contact/index.html", renderContactPage());

  for (const essay of essays) {
    await writePage(join("dist/essays", essay.slug, "index.html"), renderEssayPage(essay, essays));
  }

  await copyAsset("src/styles.css", "dist/styles.css");
  await copyAsset("src/client.js", "dist/client.js");
  await copyImages();
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
