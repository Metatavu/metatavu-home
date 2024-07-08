import { defineConfig as defineViteConfig, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
const viteConfig = defineViteConfig({
  plugins: [react()],
  server: {
    open: true
  },
  optimizeDeps: {
    include: ["@mui/material/Tooltip"]
  },
  resolve: {
    alias: {
      "src/components": "/src/components",
      "src/atoms": "/src/atoms",
      "src/hooks": "/src/hooks",
      "src/localization": "/src/localization",
      "src/app": "/src/app",
      "src/generated": "/src/generated",
      "src/utils": "/src/utils",
      "src/types": "/src/types",
      "src/theme": "/src/theme",
    }
  },
  
});

const vitestConfig = defineVitestConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './testSetup.tsx'
  }
});

export default mergeConfig(viteConfig, vitestConfig);