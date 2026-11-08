# Stage 6: Launch readiness (PWA, offline, poem publishing, smooth flipping, cleanup)

Everything in this pack is already written, type-checked, and its logic has been tested
(service worker, build plugin, poem files). Your job is to INTEGRATE and VERIFY, not redesign.
Read AGENTS.md first.

## Step 1: remove old leftovers (these confuse tools and were never part of the app)
Delete: the folders `about-us-stage2`, `about-us-stage3`, `about-us-stage4`, `about-us-stage5`, the folder `tanker-font`,
the file `AGENTS.md.txt`, the file `scripts/validate-poems.mjs`, and the old `STAGE2.md`, `STAGE3.md`, `STAGE4.md`, `STAGE5.md`
if they exist in the project root. Do NOT delete anything in `src/` that is not listed here.
Move nothing else. The Tanker font stays in `src/assets/fonts/`.
Then run `git rm --cached src/data/poems.json` once (the file is now generated and git-ignored, but an older copy is still tracked).

## Step 2: check the new pieces are in place
- `public/` (manifest.webmanifest, favicon.svg, icons/) and `vite-plugin-sw.ts`, `src/pwa/`, `scripts/build-poems.mjs`,
  `scripts/poems-lib.mjs`, `content/poems/`, `netlify.toml`, `docs/`, `README.md`.
- `src/data/poems.json` is now GENERATED from `content/poems/*.txt` and is git-ignored. Run `npm run poems` once to create it.

## Step 3: verify
1. Do not install any package.
2. Run `npm run build`. Fix ONLY type or import errors with minimal edits. Do not restyle, and do not rewrite
   `src/book/pack.ts`, `src/home/poemUtils.ts`, `src/lib/*`, `scripts/poems-lib.mjs` or `src/pwa/sw.template.js`.
3. Confirm `dist/sw.js` exists, contains a version string and a list of files that includes `/index.html`,
   the `/assets/` files and `/icons/icon-192.png`, and contains no `__VERSION__` or `__PRECACHE__` text.
4. Confirm `dist` does NOT contain the developer test pages (search the built JS for the text "Stage 2: page layout test"; it must be absent).
5. Do not open the browser. Do not start new features.
6. Finish with a 5-line summary: files removed, files changed, build result, size of dist/sw.js, anything unexpected.

## What changed in existing files (so you do not undo it)
- `src/book/FlipBook.tsx`: `mobileScrollSupport: false`, lighter shadows and no corner hover on touch screens (fixes phone stutter).
- `src/book/book.css`: flat paper (no pattern, no inner shadows), one fixed crease shadow, `touch-action: none` on the book.
- `src/book/BookReader.tsx`: adds the `is-reading` class on <html> while the book is open (blocks page scroll and pull-to-refresh).
- `src/book/layout.ts`: tiny size changes no longer rebuild the book.
- `src/styles/global.css`: no tap highlight, olive text selection, no focus ring for mouse and touch (keyboard focus ring stays).
- `src/App.tsx`, `src/main.tsx`: error screen, update banner, service worker registration, developer pages only in `npm run dev`.
- `src/home/Header.tsx`, `src/home/HomePage.tsx`: "Install the app" menu item and sheet.
- `index.html`, `package.json` (scripts), `vite.config.ts`, `tsconfig.node.json`, `.gitignore`.
