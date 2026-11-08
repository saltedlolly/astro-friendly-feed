# Friendly Feed for Astro

When someone clicks your site's RSS button, their browser usually shows them a page of raw code. **Friendly Feed for Astro** shows them a friendly page instead, at the same address: what a feed is, the address to copy, a button to open it in their feed reader app, a few feed readers to try, your other ways to follow, and your latest posts.

Feed readers, and scripts that fetch your feed, still get the feed itself, exactly as before.

It's live on [saltedlolly.com](https://saltedlolly.com/feed/): open that link in your browser, then paste it into a feed reader.

## Why not a feed stylesheet?

The usual fix has been an XSLT stylesheet that dresses the feed up in the browser. Chrome removes XSLT on 17 November 2026 (Chrome 158), and Edge, Firefox and Safari plan to follow, so styled feeds turn back into raw code. This package doesn't style the feed. It shows a real page to people, and the real feed to feed readers.

## How it tells them apart

When someone opens an address in a browser tab, the browser sends two headers: `Sec-Fetch-Dest: document` and `Sec-Fetch-Mode: navigate`. Feed readers never send them, and web pages can't fake them. So the integration's middleware answers a browser tab with your feed page (an Astro rewrite, so the address doesn't change), and answers everything else with your feed.

Both answers carry `Vary: Sec-Fetch-Dest, Sec-Fetch-Mode`, so a cache in front of your site (a CDN or a proxy cache) never hands the page to a feed reader, and the page itself is never cached. If the page ever can't be shown, the visitor simply gets the feed.

Adding `?raw` to the address (the page links to it as "View the feed's code") shows the feed itself in the browser.

## Install

You need an Astro site with a server adapter, such as `@astrojs/node`. (For a fully static site, see [Static sites](#static-sites).)

```sh
npm install astro-friendly-feed
```

Add the integration to `astro.config.mjs`, with your feeds' addresses:

```js
import friendlyFeed from "astro-friendly-feed";

export default defineConfig({
  site: "https://example.com",
  adapter: node({ mode: "standalone" }),
  integrations: [
    friendlyFeed({
      feeds: ["/rss.xml"],
      name: "My blog",
    }),
  ],
});
```

Your feeds must be made on demand, so the middleware sees each request. Add this to each feed's route (for example `src/pages/rss.xml.js`):

```js
export const prerender = false;
```

Then make the page, `src/pages/subscribe.astro`, inside your own layout:

```astro
---
import FeedPage from "astro-friendly-feed/FeedPage.astro";
import Layout from "../layouts/Layout.astro";
import { getCollection } from "astro:content";

export const prerender = false;

const posts = (await getCollection("blog"))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 20)
  .map((post) => ({ title: post.data.title, url: `/blog/${post.id}/`, date: post.data.pubDate }));
---

<Layout title="Subscribe">
  <FeedPage posts={posts} allPosts="/blog/" narrowPosts={10}>
    <ul slot="follow">
      <li><p><strong>Mastodon:</strong> @me@example.social</p></li>
      <li><p><strong>Bluesky:</strong> <a href="https://bsky.app/profile/example.com">@example.com</a></p></li>
    </ul>
  </FeedPage>
</Layout>
```

The page must be on demand too (`export const prerender = false`). A build warns you about any feed or page that isn't.

Now open `/rss.xml` in your browser. Visited at its own address, `/subscribe/` works as a plain "Follow" page too.

## Options

| Option | What it does |
| --- | --- |
| `feeds` | **Required.** Your feeds' addresses, such as `["/rss.xml"]` or `["/feed/", "/feed/atom/"]`. The type (RSS, Atom or JSON Feed) is guessed from the address; write `{ path: "/feed/", type: "atom" }` when the guess would be wrong. The first feed is the one shown when the page is visited at its own address. With more than one, each feed's page mentions the others ("Most apps prefer this RSS version; there's also an Atom version."). |
| `page` | Your page that uses `<FeedPage />` (default `"/subscribe/"`). |
| `name` | Your site's name, for the headings: "This is the My blog feed", "Follow My blog" (default: your site's hostname). Change the headings themselves with `messages`. |
| `readers` | Feed readers to suggest, instead of the built-in six (NetNewsWire, NewsBlur, Folo, Fluent Reader, Feeder and Inoreader): `[{ name, url, about }]`. `false` hides the panel. |
| `locale` | The page's language, such as `"en-GB"` (default: Astro's current locale, else English). The full locale is used for dates. |
| `messages` | Any of the wording to change, by key. The keys are in [`locales/en.json`](locales/en.json). |

## The component

`<FeedPage />` takes these props, all optional:

| Prop | What it does |
| --- | --- |
| `posts` | Your latest posts: `[{ title, url, date }]`. On wide screens they sit on the left, beside the other panels. Without them, the page is a single column. |
| `allPosts` | Where "See all posts →" goes, under the list. |
| `narrowPosts` | How many of the posts to show when the page is one column (phones). |
| `locale`, `messages` | As for the integration, for this page only. |

Its `follow` slot is for your own ways to follow: a newsletter, Mastodon, Bluesky, or [Atmosphere Comments for Astro](https://github.com/saltedlolly/astro-atmosphere-comments)'s Subscribe and Follow buttons. It's shown in an "Other ways to follow" panel, which is left out when the slot is empty.

## Styling

The page uses your layout, fonts and link styles. Every rule is wrapped in `:where()`, so any rule of yours wins (the Copy and Open in feed reader buttons have a little more, `.ff :where(…)`, so plain `button` and `a` rules don't undo them). Colours and sizes come from CSS variables you can set on `.ff`, or anywhere above it:

```css
.ff {
  --ff-card-bg: #fff;          /* panels */
  --ff-border: #e3e3e8;        /* panel and list borders */
  --ff-radius: 18px;           /* panel corners */
  --ff-card-padding: 32px;
  --ff-gap: 24px;              /* space between panels */
  --ff-muted: #666;            /* small text and dates */
  --ff-well: #f3f3f6;          /* behind the address */
  --ff-accent: #c2185b;        /* Copy and Open in feed reader */
  --ff-accent-hover: #1a5fb8;
  --ff-accent-text: #fff;      /* text on the Copy button */
}
```

By default the colours come from the text colour around the page, so it suits light and dark sites alike. The layout switches to two columns when the page itself is at least 1000px wide (a container query), so it works in narrow layouts too.

## Static sites

A fully static site has no server to look at each request, but your web server can make the same choice. Build `/subscribe/` as a normal static page, then send it for browser tabs:

**Nginx:**

```nginx
location = /rss.xml {
  add_header Vary "Sec-Fetch-Dest, Sec-Fetch-Mode" always;
  if ($http_sec_fetch_dest = "document") {
    rewrite ^ /subscribe/index.html last;
  }
}
```

Keep `?raw` working by checking `$arg_raw` as well if you need it. Caching layers in front must respect `Vary`.

## Languages

The wording is in English for now, in [`locales/en.json`](locales/en.json). Translations are very welcome: add a file named after the language (`fr.json`, `de.json`…) with the same keys, and send a pull request. Any key a language lacks falls back to English.

## Licence

MIT. Made by [Olly Stedall](https://saltedlolly.com), who also makes [Atmosphere Comments for Astro](https://github.com/saltedlolly/astro-atmosphere-comments) and [Atmosphere Publishing for Astro](https://github.com/saltedlolly/astro-atmosphere-publishing).
