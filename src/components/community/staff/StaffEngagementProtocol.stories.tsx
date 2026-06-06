import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { StaffEngagementProtocol } from './StaffEngagementProtocol'

const meta = {
  title: 'Components/Community/Staff/StaffEngagementProtocol',
  component: StaffEngagementProtocol,
  args: {
    protocol: undefined,
    faq: undefined,
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof StaffEngagementProtocol>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Protocol section mounts (renders the SectionHeader frame)', async () => {
      await expect(canvasElement.children.length).toBeGreaterThan(0)
    })
  },
}
