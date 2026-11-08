# Roadmap and known gaps

Written for the owner and for any AI assistant that works on the project. See AGENTS.md for the rules.

## Done (Stages 1 to 5, tested by the owner on phone and computer)
Foundation and design tokens, pagination engine, realistic page-flip book (spread on desktop, single page on phones),
home screen with the 3D book, search and filters, bookmarks, continue reading, light/sepia/dark pages, text size, sharing.

## Stage 6 (this pack): launch readiness
Installable PWA with offline reading, update banner ("New poems are waiting for you"), install help, plain-text poem
publishing, README, Netlify config, phone flip smoothness fixes, tap-highlight fix, error screen, cleanup.

## After launch: quality work (suggested order)
1. **Phone check of the flip** on the real deployed site (not `npm run dev`; dev mode is much slower than the real site).
   If a model of phone is still not smooth, next options: lower shadow quality further, or draw pages flat during the turn.
2. **Accessibility pass**: trap keyboard focus inside the open sheets, hide off-screen book pages from screen readers,
   announce poem changes, check colour contrast in all three themes.
3. **Automated tests** with Node's built-in test runner for `pack.ts`, `poemUtils.ts`, `src/lib/*` and `scripts/poems-lib.mjs`
   (the logic is pure, so this is cheap) and a `npm test` script.
4. **Colour tokens**: home.css and book.css still contain hex colours; move them into src/styles/tokens.css variables.
5. **Performance budget**: run Lighthouse on the deployed site; keep the home screen script under about 120 KB gzipped.
6. **Fonts and licences**: keep a copy of the Tanker licence in the repository and confirm it allows website embedding for this use.

## Known limits (honest list)
- The page-flip library (StPageFlip) works well but has not been updated since about 2020. It is pinned in package-lock.json.
- Poem text in scripts other than Latin uses a fallback font.
- Bookmarks and reading position are stored on each device; they do not sync between a phone and a computer (no accounts by design).

## Owner's ideas
(Add new feature ideas here, one per line, and plan them one at a time.)
