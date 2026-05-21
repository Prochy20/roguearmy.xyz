import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestDocStrip } from './DigestDocStrip'

const meta = {
  title: 'Components/Division2/Digest/DigestDocStrip',
  component: DigestDocStrip,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
    frequency: { control: 'inline-radio', options: ['weekly', 'daily'] },
    wordCount: { control: { type: 'number', min: 0 } },
  },
  args: {
    accent: 'cyan',
    designator: 'BRF_8F2A',
    frequency: 'weekly',
    wordCount: 1240,
    updatedAt: '2026-05-26',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DigestDocStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All four packet-header fields render', async () => {
      await expect(canvas.getByText(args.designator)).toBeInTheDocument()
      await expect(canvas.getByText(args.frequency.toUpperCase())).toBeInTheDocument()
      await expect(canvas.getByText(/1,240/)).toBeInTheDocument()
    })
  },
}
