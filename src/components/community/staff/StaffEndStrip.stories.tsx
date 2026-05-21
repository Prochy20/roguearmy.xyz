import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StaffEndStrip } from './StaffEndStrip'
import { MOCK_LAST_SYNC } from './_mock'

const meta = {
  title: 'Components/Community/Staff/StaffEndStrip',
  component: StaffEndStrip,
  args: {
    content: undefined,
    recordCount: 12,
    lastSyncedAt: MOCK_LAST_SYNC,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof StaffEndStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Back link points to /community', async () => {
      const link = canvas.getByRole('link', { name: /return · community/i })
      await expect(link).toHaveAttribute('href', '/community')
    })
    await step('Record count is zero-padded', async () => {
      await expect(canvas.getByText(/12 records/i)).toBeInTheDocument()
    })
  },
}

export const NoSync: Story = {
  args: { lastSyncedAt: null },
}
