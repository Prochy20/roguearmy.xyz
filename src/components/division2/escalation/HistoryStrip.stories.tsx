import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { HistoryStrip } from './HistoryStrip'
import { MOCK_WEEKS_LIST_FAIL, MOCK_WEEKS_LIST_OK } from '../_mock'

const meta = {
  title: 'Components/Division2/Escalation/HistoryStrip',
  component: HistoryStrip,
  args: { weeksList: MOCK_WEEKS_LIST_OK },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1080 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HistoryStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Strip renders the week start labels', async () => {
      await expect(canvas.getAllByText(/week_of/i).length).toBeGreaterThan(0)
    })
  },
}

export const FetchFailed: Story = {
  args: { weeksList: MOCK_WEEKS_LIST_FAIL },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Falls through to a FailRow inside the strip slot', async () => {
      await expect(canvas.getByText(/ashley session|unavailable|retry/i)).toBeInTheDocument()
    })
  },
}
