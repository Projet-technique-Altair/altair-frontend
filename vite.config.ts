import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

// === CONFIGURATION VITE ===
// Cette configuration crée un alias "@" vers le dossier /src
// et assure la compatibilité avec Tailwind, Recharts, etc.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(srcDir),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
