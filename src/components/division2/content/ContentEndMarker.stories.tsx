import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ContentEndMarker } from './ContentEndMarker'

const meta = {
  title: 'Components/Division2/Content/ContentEndMarker',
  component: ContentEndMarker,
  argTypes: { label: { control: 'text' } },
  args: { label: '// END OF TRANSMISSION · 142 ENTRIES' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentEndMarker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders the supplied label between divider rules', async () => {
      await expect(canvas.getByText(args.label)).toBeInTheDocument()
    })
  },
}
