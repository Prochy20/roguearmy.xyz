import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { FormationBlock } from './FormationBlock'

const meta = {
  title: 'Components/Community/Leaderboard/Formation/FormationBlock',
  component: FormationBlock,
  argTypes: {
    status: { control: 'inline-radio', options: ['live', 'relieved', 'standby'] },
  },
  args: {
    status: 'live',
    children: (
      <div className="border border-rga-green/20 bg-[rgba(0,0,0,0.4)] p-6 text-text-secondary font-mono text-xs">
        (POINT CARD · TIER BAND · PROGRESS STRIP slot here)
      </div>
    ),
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FormationBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Live: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Status label reads LIVE for the default state', async () => {
      await expect(canvas.getByText(/formation hud · live/i)).toBeInTheDocument()
    })
  },
}

export const Relieved: Story = { args: { status: 'relieved' } }
export const Standby: Story = { args: { status: 'standby' } }
