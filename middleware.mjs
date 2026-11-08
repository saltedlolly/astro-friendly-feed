// Answers a browser tab that opens one of the site's feeds with the site's
// feed page (an Astro rewrite, so the address stays the feed's), and leaves
// every other request to the feed. See index.mjs.
import { defineMiddleware } from "astro:middleware";
import settings from "virtual:friendly-feed/settings";

const key = (path) => `/${String(path).replace(/^\/+|\/+$/g, "")}`;
const feedPaths = new Set(settings.feeds.map((feed) => key(feed.path)));

// Both answers vary on these headers, so a cache in front of the site (a CDN
// or a proxy cache) never hands the page to a feed reader, or the feed to a
// browser. The page itself is never cached.
const VARY = "Sec-Fetch-Dest, Sec-Fetch-Mode";

function addVary(response) {
  try {
    response.headers.append("Vary", VARY);
    return response;
  } catch {
    // Some responses have read-only headers: copy it.
    const copy = new Response(response.body, response);
    copy.headers.append("Vary", VARY);
    return copy;
  }
}

/** A person opening the address in a browser tab, rather than a feed reader or a script. */
export function isBrowserTab(request, url) {
  return (
    request.method === "GET" &&
    request.headers.get("sec-fetch-dest") === "document" &&
    request.headers.get("sec-fetch-mode") === "navigate" &&
    !url.searchParams.has("raw")
  );
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Prebuilt pages have no visitor to look at (the build warns about prebuilt feeds).
  if (context.isPrerendered || !feedPaths.has(key(context.url.pathname))) return next();
  if (!isBrowserTab(context.request, context.url)) return addVary(await next());
  // If the page can't be shown (a prebuilt page can't be rewritten to; the
  // build warns about that), the visitor gets the feed, as before: the feed
  // must never break because of this.
  let page;
  try {
    page = await context.rewrite(settings.page);
  } catch (error) {
    console.error(`[friendly-feed] Couldn't show ${settings.page} at ${context.url.pathname}, so the feed was sent instead:`, error);
  }
  if (!page || page.status >= 400) return addVary(await next());
  const response = new Response(page.body, page);
  response.headers.set("Cache-Control", "no-store");
  response.headers.append("Vary", VARY);
  return response;
});
