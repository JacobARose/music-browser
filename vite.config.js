import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function injectSocialHeadPlugin() {
  const fragmentPath = path.resolve(__dirname, "partials/social-head.html");
  const marker = "<!--vite-inject-social-head-->";

  return {
    name: "inject-social-head",
    transformIndexHtml(html) {
      if (!html.includes(marker)) {
        return html;
      }
      const fragment = fs.readFileSync(fragmentPath, "utf8");
      return html.replace(marker, fragment.trimEnd());
    },
  };
}

export default defineConfig({
  base: "/music-browser/",
  plugins: [injectSocialHeadPlugin()],
});
