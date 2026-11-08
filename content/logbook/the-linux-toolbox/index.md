---
title: "The Linux Toolbox I Actually Use"
description: "A short list of command-line tools that have survived years of habit."
date: 2026-10-14
updated: 2026-10-20
tags: [Linux, Software, Notes]
category: Software
draft: false
featured: false
---

There is a certain genre of blog post that lists fifty command-line tools, most of which you install once and never touch again. This is not that. These are the tools I reach for almost daily, in roughly the order I would miss them.

## Navigation and files

`fd` replaces `find` for most of my searches. It is faster to type, respects `.gitignore` by default, and its output is predictable.

```bash
fd -e md -x wc -l
```

`ripgrep` (`rg`) does the same for file contents. The default behaviour — recursive, ignores hidden and ignored files, prints line numbers — is exactly what I want ninety percent of the time.

```bash
rg "TODO" --type ts
```

`bat` is `cat` with syntax highlighting and line numbers. It is a small quality-of-life improvement that adds up when you read a lot of config files.

## Processes and ports

`htop` is the classic, but I have been using `btop` more. It is prettier, which sounds frivolous until you spend an afternoon watching a build.

For ports, `ss -tulpn` is the modern replacement for `netstat`. When a dev server refuses to start because something already owns port 3000, this is the fastest way to find the culprit.

```bash
ss -tulpn | rg 3000
```

## Git

I use `lazygit` for staging and browsing history, and plain `git` for everything else. The combination works because `lazygit` makes it easy to *see* what changed without running four separate diff commands.

`git absorb` is the one unusual tool on this list. It takes staged changes and automatically fixes them into the right commits in your branch, which turns an untidy history into something reviewable with very little effort.

## Shell

`zoxide` is a smarter `cd`. It remembers directories you visit and lets you jump to them by partial name.

```bash
z logbook
```

`fzf` is the fuzzy finder that ties a lot of this together. Piping history, file names, or branches into it is a habit that is hard to give up once acquired.

## The point

None of these tools are essential. `find`, `grep`, `cat`, and `cd` still work, and they are installed everywhere. The value of the replacements is that they remove small frictions — the kind you stop noticing after a while but that quietly shape how willing you are to poke around a system.

A good toolbox is not the longest one. It is the one you know well enough to use without thinking.
