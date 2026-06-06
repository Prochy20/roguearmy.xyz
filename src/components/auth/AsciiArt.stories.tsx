import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { AsciiArt } from './AsciiArt'

const meta = {
  title: 'Components/Auth/AsciiArt',
  component: AsciiArt,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AsciiArt>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('ASCII art exposes the RGA aria-label', async () => {
      await expect(canvas.getByLabelText(/rga - rogue army/i)).toBeInTheDocument()
    })
    await step('"MEMBERS PORTAL" subtitle renders', async () => {
      await expect(canvas.getByText(/members portal/i)).toBeInTheDocument()
    })
  },
}
