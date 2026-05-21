import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestBriefing } from './DigestBriefing'

const SAMPLE = `## Highlights\n\nVendor cache rotation is the headline.\n\n## Vendor Rotation\n\nHolster + Rifle slots. Best window opens Friday.\n`

const meta = {
  title: 'Components/Division2/Digest/DigestBriefing',
  component: DigestBriefing,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
  },
  args: { accent: 'cyan', content: SAMPLE },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DigestBriefing>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Headings render through the markdown converter map', async () => {
      await expect(canvas.getByText(/highlights/i)).toBeInTheDocument()
      await expect(canvas.getByText(/vendor rotation/i)).toBeInTheDocument()
    })
  },
}
