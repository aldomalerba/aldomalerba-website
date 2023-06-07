// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Aldo Malerba";
export const SITE_DESCRIPTION =
  "Portfolio e Blog di Aldo Malerba";
export const TWITTER_HANDLE = "@AldoMalerba_";
export const MY_NAME = "Aldo Malerba";

// setup in astro.config.mjs
const BASE_URL = new URL(import.meta.env.SITE);
export const SITE_URL = BASE_URL.origin;
