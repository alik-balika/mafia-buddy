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
    hmr: true,
    allowedHosts: [
      "5ec3-2600-100f-a020-b271-5873-c2aa-ef4-ad2c.ngrok-free.app",
    ], // change link as ngrok host changes
    // hmr: {
    //   protocol: "wss",
    //   host: "5ec3-2600-100f-a020-b271-5873-c2aa-ef4-ad2c.ngrok-free.app",
    // },
  },
});
