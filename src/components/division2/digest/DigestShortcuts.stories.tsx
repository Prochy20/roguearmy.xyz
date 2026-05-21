import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestShortcuts } from './DigestShortcuts'

const meta = {
  title: 'Components/Division2/Digest/DigestShortcuts',
  component: DigestShortcuts,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
  },
  args: { accent: 'cyan' },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DigestShortcuts>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('J and K keycaps render as <kbd>', async () => {
      await expect(canvas.getByText('J')).toBeInTheDocument()
      await expect(canvas.getByText('K')).toBeInTheDocument()
    })
  },
}
