import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'vite-plugin-react-import',
          setup(build) {
            build.onLoad({ filter: /\/node_modules\/react-router-dom\// }, (args) => {
              return {
                contents: `import * as reactRouterDom from '${args.path}'; export default reactRouterDom;`,
              };
            });
          },
        },
      ],
    },
  },
});
