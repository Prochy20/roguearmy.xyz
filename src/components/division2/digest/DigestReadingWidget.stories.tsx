import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestReadingWidget } from './DigestReadingWidget'

const meta = {
  title: 'Components/Division2/Digest/DigestReadingWidget',
  component: DigestReadingWidget,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
    wordCount: { control: { type: 'number', min: 0 } },
  },
  args: { accent: 'cyan', wordCount: 1240 },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DigestReadingWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('WORDS row shows the formatted total', async () => {
      await expect(canvas.getByText(/1,240/)).toBeInTheDocument()
    })
  },
}
