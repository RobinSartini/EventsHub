import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // `vp check` charge cette config depuis la racine du monorepo : sans `root`,
  // le plugin React Router cherche `app/root.tsx` dans le mauvais dossier.
  root: import.meta.dirname,
  plugins: [fumadocsMdx(), tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
