import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'
import { UtcClock } from './UtcClock'

const meta = {
  title: 'Components/Me/UtcClock',
  component: UtcClock,
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof UtcClock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Clock resolves to a real time after mount', async () => {
      await waitFor(
        () => {
          const node = canvas.getByText(/UTC$/)
          expect(node.textContent ?? '').toMatch(/\d{2}:\d{2}:\d{2} UTC/)
        },
        { timeout: 2000 },
      )
    })
  },
}
