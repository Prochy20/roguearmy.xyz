import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { Footer } from './Footer'

const meta = {
  title: 'Components/Chrome/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Site footer with terminal-style navigation. Includes a live session-time tracker (advances client-side after hydration).',
      },
    },
  },
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Discord invite link is present', async () => {
      const discord = canvas.getAllByRole('link').find((a) => a.getAttribute('href')?.includes('dc.roguearmy.xyz'))
      await expect(discord).toBeTruthy()
    })
  },
}
