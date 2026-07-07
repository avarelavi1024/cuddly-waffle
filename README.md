# Ana Varela Vilarino Editorial Archive

Personal editorial website for essays, cultural notes and open questions.

## Add a new essay

Create a new Markdown file inside `content/essays`.

Use this structure:

```markdown
---
title: "Essay title"
subtitle: "Short subtitle"
date: "2026-07-07"
year: "2026"
category: "Culture"
tags: ["culture", "society"]
excerpt: "Short summary for the homepage and archive."
image: "images/editorial-cities.svg"
curated: true
featured: false
status: "published"
---

# Essay title

Essay text here.
```

Use `status: "coming-soon"` for essays that should appear as upcoming but not open as full articles.

## Build locally

```bash
node src/build.js
```

The generated website is created in `dist`.

