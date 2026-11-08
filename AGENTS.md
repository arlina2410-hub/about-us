# ABOUT US: project rules for AI assistants
A poetry-book PWA: a personal collection of poems shown as a realistic digital book.
Stack: React + TypeScript + Vite, plain custom CSS (no UI libraries), hosted free on Netlify. Budget is ₹0: add no paid service.
Package name: about-us (the folder name has a space).

## Fonts (self-hosted, never from a CDN)
Tanker (src/assets/fonts) for the ABOUT US name and big headings only. Newsreader for poems. DM Sans for interface text (both via @fontsource).

## Colours
ivory #F7F1E3, cream #FBF7EC, parchment #EADFC8, sage #A9B89A, olive #6B7A45, forest #2F4A3A, charcoal #2E2A25, peach #E8B9A0 (rare accent).
Feel: warm, editorial, calm, generous whitespace, thin borders, rounded corners, soft shadows. No purple, no heavy gradients, no generic SaaS look.

## How the project works (read before every task)
- POEMS: the owner writes one plain .txt file per poem in content/poems/. `scripts/build-poems.mjs` checks them and generates src/data/poems.json
  (generated and git-ignored: never edit it by hand). It runs automatically before `npm run dev` and `npm run build`. Adding a poem never needs a UI change.
  The file name is the poem's id; bookmarks and "continue reading" depend on it, so published files are never renamed.
- ROUTING uses the URL hash on purpose: (none) = home, #book, #book/<poem id>, #continue. #dev, #pagination, #stage1 exist only in `npm run dev`.
  Do not add a router library or switch to path routing.
- BOOK: src/book/paginate.ts measures poem text in the browser, src/book/pack.ts decides which lines go on which page (tested, never rewrite it),
  src/book/FlipBook.tsx wraps the page-flip library. That library moves DOM nodes itself, so every page is rendered in its own React root.
  Do not turn it into normal JSX children. Layout code must use the same CSS classes as the real page, or measuring goes wrong.
- THEMES: colours come only from CSS variables in src/book/book.css (light, sepia, dark). Themes never change layout. Text size does re-paginate, on purpose.
- SAVED DATA (settings, bookmarks, reading position) lives only in localStorage through src/lib/. No backend, no accounts.
- PWA: vite-plugin-sw.ts generates dist/sw.js at build time from src/pwa/sw.template.js (list of files + version). The service worker never takes over
  by itself: the reader taps "Update". Service worker and install code run only in the production build (`npm run build` then `npm run preview`).
- PERFORMANCE: flipping must stay smooth on phones. Do not add background patterns, inner shadows, filters or blur to .book-page (they are repainted on every frame of a page turn).
- poemUtils.ts (src/home) and pack.ts (src/book) are tested. Never rewrite them.

## How to work
- Do ONLY the task named in the prompt and follow its instruction file literally. Do not refactor, restyle, rename or "improve" files the task does not mention.
  If something looks wrong, say so in your summary instead of changing it.
- Do not install packages unless the task file says so. Everything must stay free (₹0).
- Do not open the browser unless asked. Run `npm run build` before saying you are done. Finish with a 5-line summary.
- Docs for the owner: README.md, docs/ADD-POEMS.md. Future work: docs/ROADMAP.md.
