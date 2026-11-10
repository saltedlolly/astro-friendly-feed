# Changelog

## 0.3.0 (10 November 2026)

- **A preview of the feed, front and centre:** the latest posts are now shown under an RSS icon and "example.com Feed Preview" (the site's address), with a note in a small info box (`.ff__preview-intro`) saying the feed holds the latest posts and that a feed reader checks it for you. Each entry is a plain list item with its title and date, plus a summary and picture when given, so the preview stays neutral about whether a feed carries whole posts, summaries or just links. It helps people who have never used a feed see what one is.
- **The address box shows the feed's type:** a small badge with the feed icon and "RSS", "Atom" or "JSON Feed" (`.ff__type`), inside a new `.ff__field` box, which now carries the border and background the `<code>` had. Copy still copies only the address.
- `posts` entries take optional `summary` and `image` (a picture's address, shown at 104 by 70 pixels).
- **"No feed reader yet?" folds away** under the buttons (a `<details>` disclosure), so it no longer competes with the preview.
- **One column:** the address, then the preview, then "Other ways to follow". The two-column layout (posts beside the other panels) is gone. On pages under 600px wide the preview leaves out pictures; `narrowPosts` still limits how many posts show there.
- Keys: new `preview.heading` (`{{site}}` is the site's address) and `preview.intro`; `posts.heading` removed. Classes: new `.ff__preview`, `.ff__rss`, `.ff__entries`, `.ff__entry`; `.ff__posts` and `.ff--posts` removed; `.ff__readers` is now the `<details>`.

## 0.2.1 (10 November 2026)

- The two small lines under the address (the other feeds and "View the feed's code"; "New to feeds?") are now separate paragraphs (`.ff__small`) with 10px between them, instead of one paragraph split by a line break, so they no longer look crowded.

## 0.2.0 (8 November 2026)

- **Six built-in feed readers, for different needs:** NetNewsWire (Mac, iPhone and iPad), NewsBlur (the web, Mac, iPhone and Android), Folo (with AI summaries, on every platform including Windows and Linux), Fluent Reader (Windows, Mac and Linux), Feeder (Android) and Inoreader (the web, iPhone and Android). Each says whether it's free and open source or freemium, with "Available on …" (its platforms) on a smaller line beneath. Feedly is gone.
- **Readers can list their platforms:** `readers` entries take an optional `platforms` (say, "Windows, Mac and Linux"), shown as "Available on …" under the reader. Styled `.ff__platforms`.
- Keys: new `readers.available`, `readers.newsblur`, `readers.folo`, `readers.fluentreader`, `readers.feeder` and `platforms.*` (one per reader); `readers.netnewswire` and `readers.inoreader` changed (platforms moved out); `readers.feedly` removed.

## 0.1.0 (8 November 2026)

First release, from the feed page on [saltedlolly.com](https://saltedlolly.com/feed/).

- **The integration** adds middleware that answers a browser tab opening one of the listed feeds (`Sec-Fetch-Dest: document` and `Sec-Fetch-Mode: navigate`) with the site's feed page, by an Astro rewrite, so the address stays the feed's. Everything else gets the feed. Both answers say `Vary: Sec-Fetch-Dest, Sec-Fetch-Mode`; the page is `no-store`. `?raw` shows the feed in a browser. If the page can't be shown, the feed is sent instead.
- **`<FeedPage />`**: the explanation, the address with Copy and "Open in feed reader" (a `feed:https://…` link), the other feeds, "View the feed's code", About Feeds, feed readers to try, an "Other ways to follow" slot, and the latest posts (two columns when the page is at least 1000px wide, a container query). Styled with `--ff-*` variables, every rule in `:where()` (the two buttons `.ff :where(…)`, so a site's plain `button` and `a` rules don't undo them).
- **Options:** `feeds` (types guessed: RSS, Atom, JSON Feed), `page`, `name`, `readers`, `locale`, `messages`.
- **Build warnings** for feeds or the page built as files, which middleware can't reach.
- Wording in `locales/en.json` (i18next JSON v4).
