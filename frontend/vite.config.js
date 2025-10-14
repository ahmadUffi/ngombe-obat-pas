import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // Pre-compress build outputs so servers/CDNs can serve .gz/.br
    viteCompression({ algorithm: "gzip", threshold: 1024 * 5 }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024 * 5,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router")) return "react-router";
          if (id.includes("react") || id.includes("scheduler")) return "react";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("lucide-react") || id.includes("react-toastify"))
            return "ui";
          if (id.includes("date-fns")) return "date-fns";
          if (id.includes("axios")) return "axios";
          return "vendor";
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
