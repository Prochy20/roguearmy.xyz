import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { FinalCTA } from './FinalCTA'

const meta = {
  title: 'Components/Home/FinalCTA',
  component: FinalCTA,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FinalCTA>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('CTA opens Discord invite in a new tab', async () => {
      const link = canvas.getByRole('link', { name: /join the discord/i })
      await expect(link).toHaveAttribute('target', '_blank')
    })
  },
}
