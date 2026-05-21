import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { Hero } from './Hero'

const meta = {
  title: 'Components/Home/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof Hero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Discord CTA is the primary external link', async () => {
      const cta = canvas.getByRole('link', { name: /join the discord/i })
      await expect(cta).toHaveAttribute('target', '_blank')
      await expect(cta).toHaveAttribute('href', 'https://dc.roguearmy.xyz')
    })
  },
}
