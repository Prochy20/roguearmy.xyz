import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BlogSectionDivider } from './BlogSectionDivider'

const meta = {
  title: 'Components/Blog/BlogSectionDivider',
  component: BlogSectionDivider,
  argTypes: { label: { control: 'text' } },
  args: { label: '// LATEST DROPS' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BlogSectionDivider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Label renders to the left of the rule', async () => {
      await expect(canvas.getByText(args.label)).toBeInTheDocument()
    })
  },
}

export const Incoming: Story = { args: { label: '// INCOMING' } }
