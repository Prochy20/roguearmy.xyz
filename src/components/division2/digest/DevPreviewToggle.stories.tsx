import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DevPreviewToggle } from './DevPreviewToggle'

const meta = {
  title: 'Components/Division2/Digest/DevPreviewToggle',
  component: DevPreviewToggle,
  argTypes: { isPreviewingAsMember: { control: 'boolean' } },
  args: { isPreviewingAsMember: false },
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true, navigation: { pathname: '/division-2/digest' } },
  },
} satisfies Meta<typeof DevPreviewToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Toggle defaults to "PREVIEW AS MEMBER" when not yet previewing', async () => {
      await expect(canvas.getByRole('link', { name: /preview as member/i })).toBeInTheDocument()
    })
  },
}

export const Previewing: Story = {
  args: { isPreviewingAsMember: true },
}
