---
title: "Building a Personal Site with Astro"
description: "Why a static, Markdown-first publication is still the most durable way to own your writing."
date: 2026-10-28
tags: [Web, Astro, Notes]
category: Technology
draft: false
featured: false
---

Every few years I rebuild this site. The stack changes, the design changes, but the goal stays the same: a place to publish that I control, that loads quickly, and that will still make sense in a decade.

This time I settled on Astro. It is a static site generator, which means the output is just HTML, CSS, and a little JavaScript. No database, no server rendering, no framework runtime shipping to the browser unless I explicitly ask for it.

## Why static first

A personal site is mostly text. Text does not need a request-time server. It needs a build step, a CDN, and a domain.

Static output gives you a few properties that are hard to retrofit:

- **Speed.** Pages are pre-rendered files. There is nothing to compute on request.
- **Durability.** The build output can be hosted anywhere, including a bucket, GitHub Pages, or a Raspberry Pi in a cupboard.
- **Debuggability.** When something breaks, you can open the generated HTML and see exactly what the browser received.

The trade-off is that anything dynamic has to be handled at build time or in the client. For a publication, that is almost always fine.

## Content as files

The articles here are Markdown files with frontmatter. A post looks like this:

```yaml
---
title: "A title"
description: "A short summary."
date: 2026-10-28
tags: [Web, Notes]
category: Technology
draft: false
---
```

The content collection schema validates that frontmatter at build time. If I forget a description or write an invalid date, the build fails instead of publishing something broken. That small guardrail is worth more than it sounds.

Because everything is a file, the entire archive is versioned in Git. I can diff a post, revert a typo, or move the whole thing to another machine with a clone.

## The build pipeline

At a high level, the pipeline is simple:

```mermaid
graph LR
    A[Markdown files] --> B[Content collection]
    B --> C[Astro build]
    C --> D[Static HTML]
    D --> E[CDN]
```

Feeds are generated from the same source. RSS, Atom, and JSON Feed are separate endpoints that read the collection, render each entry, and emit XML or JSON. There is no second copy of the content to keep in sync.

## What I would change next
