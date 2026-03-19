import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    define: {
      "import.meta.env.VITE_GOOGLE_MAPS_API_KEY": JSON.stringify(
        env.VITE_GOOGLE_MAPS_API_KEY
      ),
    },
    server: {
      proxy: {
        // Proxy all API requests to the backend server
        "/api": {
          target: `${env.VITE_BACKEND_URL}`,
          changeOrigin: true,
          secure: false,
        },
      },
      host: true,
      port: parseInt(env.VITE_APP_PORT) || 3000,
    },
    // Add build configuration for production
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: false,
    },
    // Preview config for production preview
    preview: {
      port: parseInt(env.VITE_APP_PORT) || 3000,
      host: true,
      strictPort: true,
    },
  };
});
