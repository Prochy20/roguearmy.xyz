import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DiscordLoginButton } from './DiscordLoginButton'

const meta = {
  title: 'Components/Auth/DiscordLoginButton',
  component: DiscordLoginButton,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DiscordLoginButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders as a button with the Discord copy', async () => {
      await expect(canvas.getByRole('button', { name: /login with discord/i })).toBeInTheDocument()
    })
  },
}
