import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
// JS plugin file — typed loosely; loaded by Vite at dev time
// @ts-expect-error untyped JS module
import blogDevPlugin from "./scripts/blog/dev-plugin.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile(), blogDevPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    // allow the e2b preview host ({port}-{sandboxId}.e2b.app) in addition to localhost
    allowedHosts: true,
  },
});
