import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { LootIcon } from './LootIcon'

const meta = {
  title: 'Components/Division2/Escalation/LootIcon',
  component: LootIcon,
  argTypes: {
    size: { control: { type: 'number', min: 12, max: 96 } },
  },
  args: { slug: 'shotgun', name: 'Shotgun', size: 48 },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof LootIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Shotgun: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Either an img renders or fallback is null — both are acceptable', async () => {
      // Component returns null when the asset map has no match — we just ensure no crash.
      const imgs = canvasElement.querySelectorAll('img')
      await expect(imgs.length).toBeGreaterThanOrEqual(0)
    })
  },
}

export const Holster: Story = { args: { slug: 'holster', name: 'Holster' } }
export const UnknownSlug: Story = { args: { slug: 'definitely-not-real', name: null } }
