import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "header_app", // any name of your choice
      filename: "remoteHeader.js",
      exposes: {
        "./Header": "./src/components/Header",
        // expose other components if required
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
    cssCodeSplit: false,
  },
});