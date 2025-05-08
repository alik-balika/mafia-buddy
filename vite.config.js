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
    allowedHosts: ["b364-2600-100f-a020-b271-2c9b-64-c5ce-2b.ngrok-free.app"], // change link as ngrok host changes
    hmr: {
      protocol: "wss",
      host: "b364-2600-100f-a020-b271-2c9b-64-c5ce-2b.ngrok-free.app",
    },
  },
});
