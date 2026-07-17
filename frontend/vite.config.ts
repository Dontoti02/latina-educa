import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import eslintPlugin from 'vite-plugin-eslint'
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('ire_'),
        },
      },
    }),
    eslintPlugin()
  ],
  optimizeDeps: {
    include: ['my-lib/components/**/*.vue'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      "@router": fileURLToPath(new URL('./src/common/router.ts', import.meta.url))
    },
  },
  envDir: './environments',
  define: {
    'process.env': process.env,
  },
})
