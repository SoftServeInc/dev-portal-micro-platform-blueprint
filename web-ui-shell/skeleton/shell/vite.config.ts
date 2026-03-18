import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
    base: "/shell/", // Base path for the Shell app
    plugins: [
        react(),
        federation({
            name: "shell", // Name of the host app
            remotes: {
                remote_app: "http://localhost:3000/mfe1/assets/remoteEntry.js",
            },
            shared: ["react", "react-dom"], // Dependencies shared with the remote
        }),
    ],
    server: {
        port: 3000, // Port where the host app runs
        origin: "http://localhost:3000", // Public origin of the host app
    },
    build: {
        modulePreload: false, // Prevent preloading of federated modules
        target: "esnext", // Ensures modern compatibility
        minify: false, // Disable minification for easier debugging
        cssCodeSplit: false, // Prevent CSS splitting
    },
});
