// The integration's settings, as the component and middleware see them (from
// the virtual module the integration adds; see index.mjs).
import settings from "virtual:friendly-feed/settings";

export type FeedType = "rss" | "atom" | "json";

export type FriendlyFeedSettings = {
  feeds: { path: string; type: FeedType }[];
  /** The site's page that uses <FeedPage />, shown at the feeds' addresses. */
  page: string;
  /** The site's address, e.g. "https://saltedlolly.com" (no trailing slash). */
  site: string;
  /** The site's name, for the headings (default: its hostname). */
  name: string;
  /** Feed readers to suggest, instead of the built-in ones (false: none). */
  readers?: { name: string; url: string; about?: string; platforms?: string }[] | false;
  locale?: string;
  messages?: Record<string, string>;
};

export default settings as FriendlyFeedSettings;
