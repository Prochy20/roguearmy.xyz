import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { GlitchName } from './GlitchName'

const meta = {
  title: 'Components/Community/Leaderboard/Formation/GlitchName',
  component: GlitchName,
  argTypes: {
    name: { control: 'text' },
    intervalMs: { control: { type: 'number', min: 500, step: 500 } },
    durationMs: { control: { type: 'number', min: 40, step: 20 } },
  },
  args: { name: 'AXIS', intervalMs: 10000, durationMs: 120 },
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="font-display text-4xl text-text-primary">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlitchName>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Initial render shows the un-corrupted name', async () => {
      await expect(canvas.getByText(args.name)).toBeInTheDocument()
    })
  },
}

export const FastGlitch: Story = {
  args: { intervalMs: 1500, durationMs: 200 },
}
