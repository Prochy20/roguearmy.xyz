import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'
import { BootSequence } from './BootSequence'

const meta = {
  title: 'Components/Auth/BootSequence',
  component: BootSequence,
  argTypes: {
    baseDelay: { control: { type: 'number', min: 0, step: 100 } },
  },
  args: {
    baseDelay: 200,
    onComplete: fn(),
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BootSequence>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Final line transitions to [READY]', async () => {
      await canvas.findByText('[READY]', {}, { timeout: 8000 })
    })
    await step('onComplete fires after the last line settles', async () => {
      await expect(args.onComplete).toHaveBeenCalled()
    })
  },
}

export const FastBoot: Story = { args: { baseDelay: 0 } }
