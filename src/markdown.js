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
  const lines = String(markdown).trim().split(/\r?\n/);
  const html = [];
  let paragraphLines = [];
  let listItems = [];
  let listTag = null;
  let quoteLines = [];

  function flushParagraph() {
    if (!paragraphLines.length) return;
    html.push(`<p>${inlineMarkdown(paragraphLines.join(" "))}</p>`);
    paragraphLines = [];
  }

  function flushList() {
    if (!listItems.length) return;
    html.push(`<${listTag}>\n${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("\n")}\n</${listTag}>`);
    listItems = [];
    listTag = null;
  }

  function flushQuote() {
    if (!quoteLines.length) return;
    html.push(`<blockquote><p>${inlineMarkdown(quoteLines.join(" "))}</p></blockquote>`);
    quoteLines = [];
  }

  function flushBlocks() {
    flushParagraph();
    flushList();
    flushQuote();
  }

  for (const line of lines) {
    const unorderedItem = line.match(/^[-*] (.+)$/);
    const orderedItem = line.match(/^\d+\. (.+)$/);
    const quote = line.match(/^> (.+)$/);
    const thematicBreak = /^ {0,3}([-*_])(?: *\1){2,} *$/.test(line);
    const headingLine = line.trimStart();

    if (!line.trim()) {
      flushBlocks();
    } else if (thematicBreak) {
      flushBlocks();
      html.push("<hr>");
    } else if (unorderedItem || orderedItem) {
      flushParagraph();
      flushQuote();
      const nextListTag = unorderedItem ? "ul" : "ol";
      if (listTag && listTag !== nextListTag) flushList();
      listTag = nextListTag;
      listItems.push((unorderedItem || orderedItem)[1]);
    } else if (quote) {
      flushParagraph();
      flushList();
      quoteLines.push(quote[1]);
    } else if (headingLine.startsWith("### ")) {
      flushBlocks();
      html.push(`<h3>${inlineMarkdown(headingLine.slice(4))}</h3>`);
    } else if (headingLine.startsWith("## ")) {
      flushBlocks();
      html.push(`<h2>${inlineMarkdown(headingLine.slice(3))}</h2>`);
    } else if (headingLine.startsWith("# ")) {
      flushBlocks();
      html.push(`<h1>${inlineMarkdown(headingLine.slice(2))}</h1>`);
    } else {
      flushList();
      flushQuote();
      paragraphLines.push(line.trim());
    }
  }

  flushBlocks();
  return html.join("\n");
}
