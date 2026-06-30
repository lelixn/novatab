import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,

  name: "NovaTab",

  version: "1.0.0",

  description: "Minimal productivity dashboard for developers.",

  chrome_url_overrides: {
    newtab: "index.html",
  },

  permissions: ["storage"],

  icons: {
    16: "icon16.png",
    48: "icon48.png",
    128: "icon128.png",
  },
});