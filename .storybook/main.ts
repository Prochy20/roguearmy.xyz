import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/nextjs-vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(dirname, '../src')

const config: StorybookConfig = {
  framework: {
    name: '@storybook/nextjs-vite',
    options: {
      nextConfigPath: path.resolve(dirname, '../next.config.mjs'),
    },
  },
  stories: [
    '../src/stories/**/*.mdx',
    '../src/components/**/*.mdx',
    '../src/components/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-vitest'],
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  staticDirs: ['../public'],
  async viteFinal(config) {
    config.resolve = config.resolve ?? {}
    // @rollup/plugin-alias does first-match-wins resolution and treats a
    // bare `@` as a prefix that matches `@/anything`. The specific
    // assetMap.server redirect MUST come before the catch-all `@` alias,
    // otherwise the generic `@` rewrite fires first and resolves the
    // import to the real (server-only) file. Using the array form makes
    // the ordering explicit and stable.
    const existing = config.resolve.alias
    const existingEntries = Array.isArray(existing)
      ? existing
      : Object.entries(existing ?? {}).map(([find, replacement]) => ({
          find,
          replacement: replacement as string,
        }))
    config.resolve.alias = [
      // Storybook's UI runs in a browser, so the `'server-only'` +
      // `node:fs` chain inside assetMap.server explodes at module load.
      // The browser stub mirrors the public API so <LootIcon> renders
      // in both the dev UI and the Vitest runner. Keep this in sync
      // with the alias in vitest.config.mts.
      {
        find: '@/lib/division2/assetMap.server',
        replacement: path.resolve(srcDir, 'lib/division2/assetMap.browser-stub.ts'),
      },
      { find: '@', replacement: srcDir },
      ...existingEntries,
    ]
    return config
  },
}

export default config
