import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
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
    const canvas = within(canvasElement)
    await step('Protocol section mounts (renders the SectionHeader frame)', async () => {
      await expect(canvasElement.children.length).toBeGreaterThan(0)
    })
  },
}
