# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Site Overview

Jekyll-based static website for the **REAL Lab (Renewable Energy & Automotive Lab)** at Hanyang University ERICA, hosted at `real.hanyang.ac.kr`. Research focus: battery modeling, thermal runaway simulation, fuel cell CFD, and battery management systems.

## Development Commands

```bash
bundle install           # Install Ruby dependencies (first time)
bundle exec jekyll serve # Local dev server (http://localhost:4000)
bundle exec jekyll build # Build to _site/
```

## Architecture

This is a **data-driven site** — almost all content lives in `_data/` YAML files, not in HTML. The HTML pages (`index.html`, `research.html`, `pubs.html`, `team.html`, etc.) are pre-compiled and reference the YAML data.

### Content Files (`_data/`)

The `_data/README.md` is the authoritative guide for content schema. Key files:

- `publications.yml` — publication entries; citations are auto-updated by GitHub Actions
- `team.yml` / `alumni.yml` — member profiles with front/back hover images
- `research.yml` — research sectors, capabilities, tools, past projects
- `news.yml` — lab news entries
- `gallery.yml` — gallery images
- `projects.yml` — ongoing/past projects
- `equipment.yml` — lab equipment

### Citation Automation

The workflow `.github/workflows/update_citations.yml` runs daily at 09:00 KST to fetch and update publication citation counts via `scripts/citation-api.js`. **Do not manually edit citation count fields in `publications.yml`** — they will be overwritten.

### Assets

- Team member photos go in `assets/img/` — profiles use front/back images for CSS hover flip effect
- **All images must be in WebP format.** When adding new images, convert with: `magick input.jpg -quality 85 output.webp`
- A single compiled stylesheet lives at `css/styles.css` (272 KB) — do not edit this directly unless you know the full CSS structure

## Content Conventions

- **Bilingual**: All public-facing content must support both English and Korean. Pages and data entries use both language fields where applicable.
- **Dates**: Use `YYYY-MM-DD` format in YAML files.
- **Timezone**: `Asia/Seoul` (set in `_config.yml`)
- **Image paths**: Always reference `assets/img/filename.webp` — the site was migrated to WebP in May 2026.

## Most Common Tasks

To add or update content, edit the appropriate `_data/*.yml` file — no HTML changes needed for publications, team members, news, or gallery entries. Refer to `_data/README.md` for exact field schemas before adding new entries.

## Performance Notes

The following optimizations are already in place (do not revert):
- All `<img>` tags below the fold use `loading="lazy"`
- All `<script src="js/scripts.js">` tags use `defer`
- Scroll event listeners are unified into a single `requestAnimationFrame`-throttled handler in `js/scripts.js`
- All images converted to WebP (258 MB → 57 MB)
