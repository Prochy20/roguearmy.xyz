import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { JoinCTA } from './JoinCTA'

const meta = {
  title: 'Components/Community/JoinCTA',
  component: JoinCTA,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof JoinCTA>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Primary "ENLIST · DISCORD" link is external (target=_blank)', async () => {
      const link = canvas.getByRole('link', { name: /enlist · discord/i })
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('href', 'https://dc.roguearmy.xyz')
    })
    await step('Manifesto secondary CTA points to /manifesto', async () => {
      const link = canvas.getByRole('link', { name: /read the manifesto/i })
      await expect(link).toHaveAttribute('href', '/manifesto')
    })
  },
}
