import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { LootStripPanel } from './LootStripPanel'
import { MOCK_MISSIONS, MOCK_PROTOTYPE_CACHES } from '../_mock'

const ITEMS = [
  { position: 0, slug: 'shotgun', name: 'Shotgun' },
  { position: 1, slug: 'assault-rifle', name: 'Assault Rifle' },
  { position: 2, slug: 'holster', name: 'Holster' },
  { position: 3, slug: 'mask', name: 'Mask' },
  { position: 4, slug: 'kneepads', name: 'Kneepads' },
]

const meta = {
  title: 'Components/Division2/Landing/LootStripPanel',
  component: LootStripPanel,
  args: {
    missions: MOCK_MISSIONS,
    items: ITEMS,
    caches: MOCK_PROTOTYPE_CACHES,
    targetDay: '2026-05-21',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1080 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LootStripPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All loot slot names render in the strip', async () => {
      for (const item of ITEMS) {
        await expect(canvas.getAllByText(item.name).length).toBeGreaterThan(0)
      }
    })
  },
}

export const NoCaches: Story = { args: { caches: null } }
