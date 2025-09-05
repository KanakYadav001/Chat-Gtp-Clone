import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://chat-gtp-clone.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "https://chat-gtp-clone.onrender.com",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
