import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestBreadcrumb } from './DigestBreadcrumb'

const meta = {
  title: 'Components/Division2/Digest/DigestBreadcrumb',
  component: DigestBreadcrumb,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
  },
  args: { accent: 'cyan', designator: 'BRF_8F2A' },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof DigestBreadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Weekly: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Crumbs link back to the parent surfaces', async () => {
      await expect(canvas.getByRole('link', { name: /division 2/i })).toHaveAttribute('href', '/division-2')
      await expect(canvas.getByRole('link', { name: /briefings/i })).toHaveAttribute('href', '/division-2/digest')
    })
    await step('Leaf shows the designator', async () => {
      await expect(canvas.getByText(args.designator)).toBeInTheDocument()
    })
  },
}

export const Daily: Story = { args: { accent: 'mod', designator: 'BRF_1C92' } }
