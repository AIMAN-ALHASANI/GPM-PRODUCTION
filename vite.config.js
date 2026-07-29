import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

const esToolkitCompatPlugin = {
  name: 'es-toolkit-compat-plugin',
  resolveId(id) {
    // Intercept default imports like 'es-toolkit/compat/get' or 'es-toolkit/compat/function/ary'
    // Normalize path by stripping extensions/subdirs if any
    if (id.startsWith('es-toolkit/compat/')) {
      const parts = id.split('/');
      const funcName = parts[parts.length - 1].replace(/\.js$/, '');
      return `\0es-toolkit-compat:${funcName}`;
    }
    return null;
  },
  load(id) {
    if (id.startsWith('\0es-toolkit-compat:')) {
      const funcName = id.replace('\0es-toolkit-compat:', '');
      return `import { ${funcName} } from 'es-toolkit/compat';\nexport default ${funcName};`;
    }
    return null;
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    esToolkitCompatPlugin,
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group React core together
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react-core';
            }
            // Group axios and react-query
            if (id.includes('@tanstack') || id.includes('axios')) {
              return 'vendor-query-axios';
            }
            // Group chart libraries (recharts, d3 components)
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-recharts';
            }
            // Remaining node dependencies
            return 'vendor-others';
          }
        }
      }
    },
    chunkSizeWarningLimit: 800,
    cssCodeSplit: true
  }
})



