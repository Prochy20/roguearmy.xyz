import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StaffRoster } from './StaffRoster'
import { MOCK_STAFF_ROSTER } from './_mock'

const meta = {
  title: 'Components/Community/Staff/StaffRoster',
  component: StaffRoster,
  args: {
    content: undefined,
    emptyState: undefined,
    profiles: MOCK_STAFF_ROSTER,
    showMemberSurface: false,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof StaffRoster>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Section title renders + every roster card is in the DOM', async () => {
      await expect(canvas.getByText(/the core/i)).toBeInTheDocument()
      for (const profile of MOCK_STAFF_ROSTER) {
        await expect(canvas.getByText(profile.cached_displayName)).toBeInTheDocument()
      }
    })
  },
}

export const Empty: Story = {
  args: { profiles: [] },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Empty state slot renders when there are zero profiles', async () => {
      await expect(canvas.getByText(/manifest pending compilation/i)).toBeInTheDocument()
    })
  },
}
