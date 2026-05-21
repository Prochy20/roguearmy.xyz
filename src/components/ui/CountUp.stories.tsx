import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { CountUp } from './CountUp'

const meta = {
  title: 'Components/UI/CountUp',
  component: CountUp,
  argTypes: {
    value: { control: { type: 'number' } },
    duration: { control: { type: 'number', min: 0, step: 100 } },
    delay: { control: { type: 'number', min: 0, step: 100 } },
    padZeros: { control: { type: 'number', min: 0, max: 10 } },
    locale: { control: 'boolean' },
    compact: { control: 'boolean' },
    reveal: { control: 'inline-radio', options: ['count', 'glitch'] },
  },
  args: {
    value: 1234,
    duration: 1200,
    reveal: 'count',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="font-display text-6xl text-rga-green text-glow-green">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CountUp>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Final value lands after the duration', async () => {
      await canvas.findByText(args.value!.toString(), {}, { timeout: (args.duration ?? 1200) + 500 })
      await expect(canvas.getByText(args.value!.toString())).toBeInTheDocument()
    })
  },
}

export const GlitchReveal: Story = {
  args: { value: 42100, reveal: 'glitch', duration: 1500 },
}

export const Compact: Story = {
  args: { value: 894812, compact: true },
}

export const ZeroPadded: Story = {
  args: { value: 6, padZeros: 4 },
}
