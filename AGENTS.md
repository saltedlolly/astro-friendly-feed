# Working on Friendly Feed for Astro

Notes for anyone changing this package, people and coding agents alike. What the package does and how to use it is in [README.md](README.md); this file covers how it's built and the conventions to keep.

It is maintained by [Olly Stedall](https://saltedlolly.com) and used live on [saltedlolly.com](https://saltedlolly.com/feed/), so changes are released only after they've been tried there.

## Layout

| Path | What it is |
| --- | --- |
| `index.mjs`, `index.d.ts` | The integration: checks the options, adds the middleware, passes the settings on through the virtual module `virtual:friendly-feed/settings` (read by `lib/settings.ts`), and warns after a build about feeds or the page that were built as files. |
| `middleware.mjs` | Decides, per request to a listed feed, whether it's a browser tab (`isBrowserTab`) and, if so, rewrites to the page. Adds `Vary` to both answers and `no-store` to the page. |
| `components/FeedPage.astro` | The page's content, placed by sites inside their own layout. One file, with its script (Copy) and global styles. |
| `lib/` | Settings, and the wording helpers (`i18n.ts`, `translate.ts`; `translate.ts` is the same as Atmosphere Comments'). |
| `locales/` | The wording, one i18next JSON (v4) file per language; English is the source. |

## Ground rules

- **The feed must never break.** Anything that isn't clearly a browser tab gets the feed, untouched apart from the `Vary` header. If the page can't be shown, send the feed. Never change the feed's content or content type.
- **Only browsers' own headers decide.** `Sec-Fetch-Dest: document` plus `Sec-Fetch-Mode: navigate`, which pages can't set and feed readers don't send. Don't guess from `User-Agent` or `Accept`: feed readers often send browser-like values for both.
- **Caches must never mix the two answers:** both carry `Vary: Sec-Fetch-Dest, Sec-Fetch-Mode`, and the page is `no-store`.
- **No user-visible English in the component**: wording goes in `locales/en.json` and is used with `t()` / `th()`. Links inside a sentence are placeholders (`{{link}}`), so translators can move them.
- **Styles stay overridable:** every selector in `:where()`, colours and sizes as `--ff-*` variables, links left to the site's own styles.
- Note every change in `CHANGELOG.md`.

## Releasing

Change the code, bump `version` in `package.json`, add the CHANGELOG entry, commit and push. Try it on saltedlolly.com (an `npm pack` tarball installed with `--no-save`) and in a fresh Astro site first. Olly publishes to npm and tags `vX.Y.Z`; agents don't publish or move tags.
