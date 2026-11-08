---
title: "Why I Write in Markdown"
description: "Plain text is the only format I trust to survive a decade of tool changes."
date: 2026-09-12
tags: [Writing, Markdown, Notes]
category: Writing
draft: false
featured: false
---

I have migrated my notes through at least six applications. Each migration lost something: formatting, attachments, links, or the notes themselves. The only files that survived intact were the ones written in plain text.

## Format is a commitment

Every editor wants to be your permanent home. It stores your writing in a structured format, adds features you start to depend on, and quietly makes leaving expensive. This is not malicious. It is just how products work.

Markdown is the opposite of that. It is a set of conventions for annotating plain text, and the underlying file is still readable without any tool at all. If every Markdown application disappeared tomorrow, `cat` would still show me my writing.

## Portability in practice

This site is built from Markdown files. The same files open correctly in Obsidian, VS Code, GitHub, and a terminal pager. When I want to publish, a build step converts them to HTML. When I want to move, I copy a folder.

The important property is not that Markdown is perfect. It is that the failure mode is graceful. A broken link or an unsupported table is a small inconvenience, not a locked door.

## What plain text gives up

It gives up some things, honestly:

- **Rich layout.** Complex documents need more than headings and lists.
- **Embedded media.** Images live beside the text rather than inside it.
- **Structured data.** Tables are a compromise, and nested data is awkward.

For prose, none of that matters much. For a spreadsheet or a slide deck, Markdown is the wrong tool, and forcing it is its own kind of lock-in.

## A small set of conventions

I keep the syntax narrow on purpose:

```markdown
# One title per file
## Sections for navigation
**Bold** for emphasis, *italics* sparingly
`code` for identifiers
- lists for enumerations
```

Frontmatter holds metadata that the prose should not carry: title, date, tags, draft status. Everything else stays in the body.

## Writing as a durable act

The real reason I care is that writing is slow. A post might take hours or weeks. Putting that effort into a format controlled by a single company feels like building on rented land. Plain text is boring, and that is exactly the appeal: boring formats do not get discontinued.
