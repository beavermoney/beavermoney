import { defineConfig, type Plugin } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import relay from 'vite-plugin-relay'

const additionalManifestEntries: Array<{
  revision: string | null
  url: string
}> = []

const collectAppShellIconChunks = (): Plugin => ({
  name: 'collect-app-shell-icon-chunks',
  apply: 'build',
  generateBundle: (_options, bundle) => {
    const iconFiles = new Set<string>()

    for (const output of Object.values(bundle)) {
      if (
        output.type !== 'chunk' ||
        output.fileName.startsWith('assets/icons/')
      ) {
        continue
      }

      for (const importedFile of output.imports) {
        if (importedFile.startsWith('assets/icons/')) {
          iconFiles.add(importedFile)
        }
      }
    }

    for (
      let index = additionalManifestEntries.length - 1;
      index >= 0;
      index--
    ) {
      if (additionalManifestEntries[index].url.startsWith('assets/icons/')) {
        additionalManifestEntries.splice(index, 1)
      }
    }

    for (const url of [...iconFiles].sort()) {
      additionalManifestEntries.push({ revision: null, url })
    }
  },
})

const config = defineConfig({
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
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    collectAppShellIconChunks(),
    VitePWA({
      registerType: 'prompt',
      manifest: false,
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-96x96.png',
        'apple-touch-icon.png',
        'manifest.json',
        'web-app-manifest-192x192.png',
        'web-app-manifest-512x512.png',
        'assets/logo.png',
      ],
      workbox: {
        additionalManifestEntries,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,woff2}'],
        globIgnores: ['assets/icons/**/*.js'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/img\.logo\.dev\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'logo-dev-images',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 30,
                maxEntries: 256,
              },
            },
          },
        ],
      },
    }),
  ],
})

export default config
