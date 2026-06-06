import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { WeekStepper, type WeekStepperState } from './WeekStepper'

const STATE: WeekStepperState = {
  current: { periodStart: '2026-05-19', periodEnd: '2026-05-25', label: 'WEEK OF MAY 19' },
  prev: { periodStart: '2026-05-12', href: '/division-2/briefings?week=2026-05-12', label: 'WEEK OF MAY 12' },
  next: { periodStart: '2026-05-26', href: '/division-2/briefings?week=2026-05-26', label: 'WEEK OF MAY 26' },
}

const meta = {
  title: 'Components/Division2/Briefings/WeekStepper',
  component: WeekStepper,
  args: { state: STATE },
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof WeekStepper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Both prev + next links are present + render their aria-labels', async () => {
      await expect(canvas.getByRole('link', { name: /previous week/i })).toBeInTheDocument()
      await expect(canvas.getByRole('link', { name: /next week/i })).toBeInTheDocument()
    })
  },
}

export const AtFirstWeek: Story = {
  args: { state: { ...STATE, prev: null } },
}

export const AtLatestWeek: Story = {
  args: { state: { ...STATE, next: null } },
}
