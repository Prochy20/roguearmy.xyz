import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'
import { StatCounter } from './StatCounter'

const meta = {
  title: 'Components/Community/StatCounter',
  component: StatCounter,
  argTypes: {
    value: { control: { type: 'number' } },
    duration: { control: { type: 'number', min: 100, step: 100 } },
    threshold: { control: { type: 'number', min: 0, max: 1, step: 0.1 } },
    locale: { control: 'boolean' },
    compact: { control: 'boolean' },
  },
  args: {
    value: 12480,
    duration: 1400,
    threshold: 0.4,
    locale: true,
    compact: false,
  },
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="font-display text-5xl text-rga-green text-glow-green">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatCounter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Final value lands after the duration', async () => {
      await canvas.findByText('12,480', {}, { timeout: (args.duration ?? 1400) + 800 })
    })
  },
}

export const Compact: Story = {
  args: { value: 894812, compact: true },
}

export const Plain: Story = {
  args: { value: 99, locale: false, compact: false },
}
