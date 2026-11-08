# How to add a poem to ABOUT US

You write each poem in a plain text file. No code, no quotes, no commas. Publishing takes about two minutes.
You can do it from your phone.

## The poem file

Every poem is one `.txt` file inside the `content/poems` folder. It looks like this:

```
title: Rain on the Window
date: 2026-11-02
category: Love
tags: rain, memories
featured: no
---
The first line of my poem,
the second line of my poem.

Another stanza begins here,
and continues naturally.
```

- Everything above the three dashes (`---`) is the settings. Only **title** and **date** are required.
- Below the dashes is your poem. Each line you write stays on its own line.
- **One empty line = a new stanza.**
- `date` must look like `2026-11-02` (year-month-day). The newest poems appear first on the home screen.
- `category` is optional (one word or phrase). `tags` are optional, separated by commas.
- `featured: yes` puts a poem on the home screen as the featured poem. If several are "yes", the newest one is shown.

**The file name** must use only lowercase letters, numbers and hyphens, and end in `.txt`.
Good: `rain-on-the-window.txt`. Bad: `Rain on the Window.txt`.

> **Never rename a poem file after it is published.** The file name is the poem's identity. Readers' bookmarks and their
> "continue reading" place are tied to it. To fix a typo in the title, change the `title:` line inside the file instead.

The book puts poems in date order, oldest first, so a new poem is always added at the end of the book.

## Way 1: from your phone or any browser (easiest)

You only need the GitHub website. One-time setup is in README.md ("Put it online").

1. Open **github.com**, sign in, and open your **about-us** repository.
2. Tap **content**, then **poems**.
3. Tap **_TEMPLATE.txt**. Copy all its text (the "Copy raw file" button at the top right of the file, or select all and copy).
4. Go back to the **poems** folder. Tap **Add file**, then **Create new file**.
5. In the name box, type your file name, for example `rain-on-the-window.txt`.
6. Paste the template into the big box. Change the title, date, category and tags. Replace the example poem with your own.
7. Tap **Commit changes...**, then tap **Commit changes** again (keep "Commit directly to the main branch" selected).
8. Wait one to two minutes. Netlify builds the website by itself.
9. Open ABOUT US. A banner says **"New poems are waiting for you."** Tap **Update**. Your poem is in the book.

**Check that it worked:** open your site on **app.netlify.com**, then **Deploys**.
- Green **Published**: done.
- Red **Failed**: tap it and read the message. It names the file and says what to fix (for example, a wrong date).
  Fix the file the same way (step "Edit a poem" below) and commit again. **While a deploy is failed, the live website
  keeps showing the last good version, so nothing breaks for your readers.**

### Edit a poem
Open the file in `content/poems`, tap the pencil icon, change it, then **Commit changes**.

### Delete a poem
Open the file, tap the three dots at the top right, choose **Delete file**, then **Commit changes**.
Do this for the six demo poems that came with the project: `threshold`, `salt-and-linen`, `the-olive-grove`,
`reading-in-the-late-hour`, `cartography-of-ordinary-days`, `twelve-seasons-of-us`.

## Way 2: from your computer

1. Open the project folder in your editor (Antigravity or VS Code).
2. Copy `content/poems/_TEMPLATE.txt`, rename the copy, write your poem, save.
3. To preview: run `npm run dev` and open the link it prints. (Restart it after adding a new file.)
4. To publish, run these in the terminal:
   ```
   git add .
   git commit -m "Add poem: Rain on the Window"
   git push
   ```
5. Netlify publishes it in a minute or two.

## If something goes wrong

| Message | What it means | Fix |
|---|---|---|
| `The file name "..." is not allowed` | Capital letters, spaces or symbols in the file name | Use only lowercase letters, numbers and hyphens |
| `There is no line with three dashes (---)` | The `---` line is missing | Add `---` on its own line between the settings and the poem |
| `Missing "title:"` / `Missing "date:"` | A required setting is missing | Add the line, for example `date: 2026-11-02` |
| `The date "..." is not valid` | Wrong format or a day that does not exist | Use year-month-day, like `2026-11-02` |
| `Unknown setting "..."` | A typo in a setting name | Allowed: title, date, category, tags, featured |
| `"featured:" must be yes or no` | Something else was written | Write `featured: yes` or `featured: no` |
| `The poem has no text below the dashes` | The poem is empty | Write the poem below the `---` line |

## Good to know

- Letters such as â, ê, î, ô, û and ṭ are supported. Poems in other scripts (for example Assamese) will show in your device's
  default font, which is readable but not the book's own font.
- Your poems are public once published. Anyone with the link can read them.
- A collection of hundreds of poems works fine.
