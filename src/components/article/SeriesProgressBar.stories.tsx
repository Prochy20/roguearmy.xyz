import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { SeriesProgressBar } from './SeriesProgressBar'

const meta = {
  title: 'Components/Article/SeriesProgressBar',
  component: SeriesProgressBar,
  argTypes: {
    completedCount: { control: { type: 'number', min: 0 } },
    totalCount: { control: { type: 'number', min: 0 } },
    showLabel: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  args: {
    completedCount: 3,
    totalCount: 8,
    showLabel: true,
    size: 'md',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SeriesProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Shows the X/Y completion ratio', async () => {
      await expect(canvas.getByText('3/8')).toBeInTheDocument()
    })
  },
}

export const Complete: Story = {
  args: { completedCount: 8, totalCount: 8 },
}

export const NotStarted: Story = {
  args: { completedCount: 0, totalCount: 6 },
}

export const HiddenLabel: Story = {
  args: { showLabel: false },
}
