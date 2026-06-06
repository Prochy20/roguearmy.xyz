import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { PrototypeCaches } from './PrototypeCaches'
import { MOCK_PROTOTYPE_CACHES } from '../_mock'

const meta = {
  title: 'Components/Division2/Escalation/PrototypeCaches',
  component: PrototypeCaches,
  args: {
    caches: MOCK_PROTOTYPE_CACHES,
    sectionLabel: '// ESCALATION VENDOR · PROTOTYPE CACHES',
    blurb: 'Vendor rotates one gear and one weapon cache every 24h at White House BoO.',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 960 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PrototypeCaches>

export default meta
type Story = StoryObj<typeof meta>

export const Published: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Both cache cards render their loot names', async () => {
      // Loot names render in both the headline and the sr-only label, so
      // each text appears multiple times in the accessibility tree.
      await expect(canvas.getAllByText(/holster/i).length).toBeGreaterThan(0)
      await expect(canvas.getAllByText(/rifle/i).length).toBeGreaterThan(0)
    })
  },
}

export const PendingUpstream: Story = {
  args: { caches: null },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Falls back to the "upstream did not publish" message', async () => {
      await expect(canvas.getAllByText(/upstream did not publish/i).length).toBeGreaterThan(0)
    })
  },
}
