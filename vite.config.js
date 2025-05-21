import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    // hmr: true,
    allowedHosts: [
      "ac5c-2600-100f-a020-b271-d52a-2413-8608-89f3.ngrok-free.app",
    ], // change link as ngrok host changes
    hmr: {
      protocol: "wss",
      host: "ac5c-2600-100f-a020-b271-d52a-2413-8608-89f3.ngrok-free.app",
    },
  },
});
