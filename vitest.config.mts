import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [tsconfigPaths(), react()],
        test: {
          name: 'int',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['tests/int/**/*.int.spec.ts'],
        },
      },
      {
        plugins: [
          tsconfigPaths(),
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            storybookScript: 'pnpm storybook --ci',
          }),
        ],
        resolve: {
          alias: {
            '@/lib/division2/assetMap.server': path.join(
              dirname,
              'src/lib/division2/assetMap.browser-stub.ts',
            ),
          },
        },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
})
