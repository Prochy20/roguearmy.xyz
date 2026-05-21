import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { RotationGrid } from './RotationGrid'
import { MOCK_DAILIES, MOCK_MISSIONS } from '../_mock'

const meta = {
  title: 'Components/Division2/Escalation/RotationGrid',
  component: RotationGrid,
  args: {
    weekStart: '2026-05-19',
    missions: MOCK_MISSIONS,
    dailies: MOCK_DAILIES,
    highlightToday: true,
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1100, overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RotationGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Table header + all 5 mission rows render', async () => {
      await expect(canvas.getByText(/mission/i)).toBeInTheDocument()
      for (const mission of MOCK_MISSIONS) {
        await expect(canvas.getByText(mission.name)).toBeInTheDocument()
      }
    })
  },
}

export const NoTodayHighlight: Story = { args: { highlightToday: false } }
