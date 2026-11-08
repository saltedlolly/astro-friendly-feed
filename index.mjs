// Friendly Feed for Astro: someone who opens one of the site's feeds (RSS,
// Atom or JSON Feed) in a browser tab sees a friendly page explaining how to
// subscribe, at the same address, so it can be copied. Feed readers, and
// scripts that fetch the feed, still get the feed itself.
//
// Browsers mark a visit in a tab with the headers Sec-Fetch-Dest: document and
// Sec-Fetch-Mode: navigate. Feed readers never send them (they're "forbidden"
// headers that web pages can't set either), so the middleware (middleware.mjs)
// can tell the two apart and answer the tab with the site's own page that uses
// <FeedPage /> (components/FeedPage.astro), by an Astro rewrite.
//
// It replaces feed stylesheets (XSLT), which Chrome removes on 17 November
// 2026, with other browsers following.
//
// It needs an on-demand (server) adapter such as @astrojs/node, and the feeds
// it handles must be made on demand (`export const prerender = false`):
// prebuilt files are served without passing through middleware. A build
// warns about any that aren't.
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const VIRTUAL_ID = "virtual:friendly-feed/settings";
const TYPES = ["rss", "atom", "json"];

/** "/feed" or "feed/" → "/feed/"-style key used for matching, without the trailing slash. */
const normalise = (path) => `/${String(path).replace(/^\/+|\/+$/g, "")}`;

function guessType(path) {
  if (/atom/i.test(path)) return "atom";
  if (/\.json$|json/i.test(path)) return "json";
  return "rss";
}

/**
 * @param {import("./index").FriendlyFeedOptions} options
 * @returns {import("astro").AstroIntegration}
 */
export default function friendlyFeed(options) {
  const given = options?.feeds ?? [];
  if (!Array.isArray(given) || !given.length) {
    throw new Error('friendly-feed: list your feeds\' addresses in `feeds`, e.g. feeds: ["/rss.xml"].');
  }
  const feeds = given.map((feed) => {
    const entry = typeof feed === "string" ? { path: feed } : feed;
    if (!entry?.path || !String(entry.path).startsWith("/")) {
      throw new Error(`friendly-feed: each feed needs a path starting with "/", like "/rss.xml" (got ${JSON.stringify(feed)}).`);
    }
    const type = entry.type ?? guessType(entry.path);
    if (!TYPES.includes(type)) throw new Error(`friendly-feed: a feed's type must be "rss", "atom" or "json" (got "${type}").`);
    return { path: entry.path, type };
  });
  const page = options.page ?? "/subscribe/";
  if (!page.startsWith("/")) throw new Error('friendly-feed: `page` must be a path on your site, like "/subscribe/".');
  let clientDir;

  return {
    name: "friendly-feed",
    hooks: {
      "astro:config:setup": ({ config, addMiddleware, updateConfig }) => {
        if (!config.site) throw new Error("friendly-feed: set `site` in astro.config (your site's address).");
        if (config.output === "static" && !config.adapter) {
          throw new Error(
            "friendly-feed needs a server adapter, such as @astrojs/node. (For a fully static site, see the README's web server rules.)",
          );
        }
        /** @type {import("./lib/settings").FriendlyFeedSettings} */
        const settings = {
          feeds,
          page,
          site: config.site.replace(/\/+$/, ""),
          name: options.name ?? new URL(config.site).hostname,
          readers: options.readers,
          locale: options.locale,
          messages: options.messages ?? {},
        };
        addMiddleware({ entrypoint: fileURLToPath(new URL("./middleware.mjs", import.meta.url)), order: "pre" });
        updateConfig({
          vite: {
            plugins: [
              {
                name: "friendly-feed-settings",
                resolveId: (id) => (id === VIRTUAL_ID ? `\0${id}` : undefined),
                load: (id) => (id === `\0${VIRTUAL_ID}` ? `export default ${JSON.stringify(settings)};` : undefined),
              },
            ],
          },
        });
      },
      "astro:config:done": ({ config }) => {
        clientDir = fileURLToPath(config.build.client);
      },
      // Prebuilt files never reach the middleware, so a prebuilt feed or page
      // would quietly stay as it was. Say so.
      "astro:build:done": ({ logger }) => {
        if (!clientDir) return;
        const built = (path) => {
          const file = `${clientDir}${normalise(path).slice(1)}`;
          return (existsSync(file) && statSync(file).isFile()) || existsSync(`${file}/index.html`);
        };
        for (const feed of feeds) {
          if (built(feed.path)) {
            logger.warn(
              `${feed.path} was built as a file, so browsers will still see the raw feed there. Add \`export const prerender = false\` to its route.`,
            );
          }
        }
        if (built(page)) {
          logger.warn(`${page} was built as a file. Add \`export const prerender = false\` to it, so it can be shown at the feeds' addresses.`);
        }
      },
    },
  };
}
