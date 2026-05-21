import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'
import { TypeWriter } from './TypeWriter'

const meta = {
  title: 'Components/Effects/TypeWriter',
  component: TypeWriter,
  argTypes: {
    text: { control: 'text' },
    speed: { control: { type: 'number', min: 5, step: 5 } },
    delay: { control: { type: 'number', min: 0, step: 100 } },
    cursor: { control: 'boolean' },
  },
  args: {
    text: '// VISUAL IDENTITY & DESIGN GUIDELINES',
    speed: 30,
    delay: 200,
    cursor: true,
    onComplete: fn(),
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="font-mono text-base text-rga-cyan">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TypeWriter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const totalMs = (args.delay ?? 0) + args.text.length * (args.speed ?? 30) + 2000
    await step('Full text appears after the typing duration', async () => {
      await canvas.findByText(args.text, {}, { timeout: totalMs })
      await expect(canvas.getByText(args.text)).toBeInTheDocument()
    })
  },
}

export const NoCursor: Story = { args: { cursor: false } }
