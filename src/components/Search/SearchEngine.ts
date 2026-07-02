export const SEARCH_ENGINES = {
  google: (query: string) =>
    `https://www.google.com/search?q=${encodeURIComponent(query)}`,

  github: (query: string) =>
    `https://github.com/search?q=${encodeURIComponent(query)}`,

  youtube: (query: string) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,

  stackoverflow: (query: string) =>
    `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,

  npm: (query: string) =>
    `https://www.npmjs.com/search?q=${encodeURIComponent(query)}`,

  leetcode: (query: string) =>
    `https://leetcode.com/problemset/?search=${encodeURIComponent(query)}`,

  mdn: (query: string) =>
    `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}`
};