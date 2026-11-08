import type { AstroIntegration } from "astro";

export type FeedType = "rss" | "atom" | "json";

export interface FriendlyFeedOptions {
  /**
   * Your feeds' addresses, e.g. ["/rss.xml"] or ["/feed/", "/feed/atom/"].
   * The type ("rss", "atom" or "json") is guessed from the address; give it
   * as { path, type } when the guess would be wrong. The first is the one
   * shown when the page is visited at its own address.
   */
  feeds: Array<string | { path: string; type?: FeedType }>;
  /** Your page that uses <FeedPage />, shown at the feeds' addresses (default "/subscribe/"). */
  page?: string;
  /** Your site's name, for the headings (default: its hostname). */
  name?: string;
  /** Feed readers to suggest instead of the built-in four, or false for none. */
  readers?: { name: string; url: string; about?: string }[] | false;
  /** The page's language (default: Astro's current locale, else English). */
  locale?: string;
  /** Any of the page's wording to change, by key (see locales/en.json). */
  messages?: Record<string, string>;
}

export default function friendlyFeed(options: FriendlyFeedOptions): AstroIntegration;
