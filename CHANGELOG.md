# Changelog

## 0.2.0 (8 November 2026)

- **Six built-in feed readers for different needs, each saying who it suits:** NetNewsWire (Apple devices, synced through iCloud), NewsBlur (apps on all your devices; AI on its top plan), Folo (for AI, with apps on everything, including Windows and Linux), Fluent Reader (a desktop app), Feeder (an Android app) and Inoreader (the most features, AI on paid plans; its free plan shows ads). All are free to start, and all but Inoreader are open source. Feedly is gone. Keys: `readers.intro`, `readers.netnewswire` and `readers.inoreader` changed; new `readers.newsblur`, `readers.folo`, `readers.fluentreader`, `readers.feeder`; `readers.feedly` removed.
- Each reader's name is bold, followed by a colon (was a comma), and the list has a little more space between entries, as the descriptions are longer.

## 0.1.0 (8 November 2026)

First release, from the feed page on [saltedlolly.com](https://saltedlolly.com/feed/).

- **The integration** adds middleware that answers a browser tab opening one of the listed feeds (`Sec-Fetch-Dest: document` and `Sec-Fetch-Mode: navigate`) with the site's feed page, by an Astro rewrite, so the address stays the feed's. Everything else gets the feed. Both answers say `Vary: Sec-Fetch-Dest, Sec-Fetch-Mode`; the page is `no-store`. `?raw` shows the feed in a browser. If the page can't be shown, the feed is sent instead.
- **`<FeedPage />`**: the explanation, the address with Copy and "Open in feed reader" (a `feed:https://…` link), the other feeds, "View the feed's code", About Feeds, feed readers to try, an "Other ways to follow" slot, and the latest posts (two columns when the page is at least 1000px wide, a container query). Styled with `--ff-*` variables, every rule in `:where()` (the two buttons `.ff :where(…)`, so a site's plain `button` and `a` rules don't undo them).
- **Options:** `feeds` (types guessed: RSS, Atom, JSON Feed), `page`, `name`, `readers`, `locale`, `messages`.
- **Build warnings** for feeds or the page built as files, which middleware can't reach.
- Wording in `locales/en.json` (i18next JSON v4).
