import { defineConfig } from 'vitest/config'
import { lingui } from '@lingui/vite-plugin'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import relay from 'vite-plugin-relay'

const config = defineConfig({
  test: { setupFiles: ['./src/test/i18n-setup.tsx'] },
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: (chunkInfo) => {
          const isDynamicLucideIcon =
            chunkInfo.moduleIds.length > 0 &&
            chunkInfo.moduleIds.every((moduleId) =>
              moduleId.includes('/lucide-react/dist/esm/icons/'),
            )

          return isDynamicLucideIcon
            ? 'assets/icons/[name]-[hash].js'
            : 'assets/[name]-[hash].js'
        },
      },
    },
  },
  plugins: [
    relay,
    lingui(),
    devtools({
      eventBusConfig: {
        port: Number(process.env.VITE_DEVTOOLS_PORT ?? 42069),
      },
    }),
    tailwindcss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routeFileIgnorePattern: '^(__generated__|-)',
    }),
    viteReact({
      babel: {
        plugins: [
          '@lingui/babel-plugin-lingui-macro',
          'babel-plugin-react-compiler',
        ],
      },
    }),
  ],
})

export default config
