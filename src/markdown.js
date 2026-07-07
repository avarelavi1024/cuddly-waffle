export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');
}

export function markdownToHtml(markdown) {
  const blocks = markdown
    .trim()
    .split(/\n{2,}/)
    .filter(Boolean);

  const html = [];
  let orderedItems = [];

  function flushOrderedList() {
    if (!orderedItems.length) return;
    html.push(`<ol>${orderedItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ol>`);
    orderedItems = [];
  }

  for (const block of blocks) {
    const trimmed = block.trim();
    if (/^\d+\.\s+/m.test(trimmed)) {
      const items = trimmed
        .split(/\n(?=\d+\.\s+)/)
        .map((item) => item.replace(/^\d+\.\s+/, "").replace(/\n/g, " ").trim())
        .filter(Boolean);
      orderedItems.push(...items);
      continue;
    }

    flushOrderedList();
    if (trimmed.startsWith("# ")) html.push(`<h1>${inlineMarkdown(trimmed.slice(2))}</h1>`);
    else if (trimmed.startsWith("## ")) html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
    else if (trimmed.startsWith("> ")) html.push(`<blockquote>${inlineMarkdown(trimmed.slice(2).replace(/\n/g, " "))}</blockquote>`);
    else html.push(`<p>${inlineMarkdown(trimmed.replace(/\n/g, " "))}</p>`);
  }

  flushOrderedList();
  return html.join("\n");
}
