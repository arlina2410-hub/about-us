# ABOUT US

A personal collection of poems, shown as a realistic digital book. It installs like an app on phones and computers,
works offline, and costs nothing to run.

## What you can do with it
Read poems in a book with real page turns (two pages on desktop, one on phones), search, bookmark, continue where you stopped,
choose light/sepia/dark pages and a text size, and share a poem.

## Add or change poems
Poems are plain text files in `content/poems`. Full step-by-step guide, including from your phone: **docs/ADD-POEMS.md**

## Set up on your computer
You need Node.js 22 (free, from nodejs.org) and Git.

```
npm install
npm run dev
```
Open the link it prints. `npm run dev` checks your poems first and stops with a clear message if one has a mistake.

| Command | What it does |
|---|---|
| `npm run dev` | Work on the site with live reload (no offline/install features here) |
| `npm run build` | Check poems, check code, build the real website into `dist/` |
| `npm run preview` | Serve the built website locally, with offline/install features, to test them |
| `npm run poems` | Only check the poems and regenerate the poem data |

To test the installed-app behaviour and the update banner: `npm run build`, then `npm run preview`, and open the link.
For your phone on the same Wi-Fi: `npm run preview -- --host` and open the "Network" link.

## Put it online (free, one time)
1. **GitHub**: create a free account, then a new repository called `about-us` (private or public).
2. In the project folder, run (replace YOUR-NAME):
   ```
   git remote add origin https://github.com/YOUR-NAME/about-us.git
   git branch -M main
   git push -u origin main
   ```
3. **Netlify**: create a free account (sign in with GitHub). Choose **Add new site, Import an existing project, GitHub**, pick `about-us`.
   The settings are read from `netlify.toml`. Press **Deploy**.
4. When it finishes you get an address like `random-name.netlify.app`. Change it in **Site configuration, Change site name**, for example `about-us-poems`.
5. From now on, every change you commit to GitHub (including a new poem) is published automatically in one to two minutes.

If a build fails, the old site stays online. Open the failed deploy on Netlify to read what to fix.

## Install it as an app
- **Android, Chrome**: open the site, tap the three dots, then **Install app** (or use the **Install the app** link inside ABOUT US).
- **iPhone, Safari**: tap Share, then **Add to Home Screen**.
- **Computer, Chrome or Edge**: click the install icon at the right end of the address bar.

## How updates reach readers
Each build gets a new version number. The installed app notices it, downloads the new poems quietly, and shows
**"New poems are waiting for you."** with an **Update** button. Nothing changes under a reader's eyes until they tap it.

## Project map
```
content/poems/      your poems, one .txt file each
docs/               guides and roadmap
public/             icons and web app manifest
scripts/            poem checker and generator
src/book/           the book: layout engine, page flip, reader
src/home/           the home screen
src/pwa/            offline, install and update code
src/lib/            saved bookmarks, settings, sharing
```
For AI assistants: read AGENTS.md first.
