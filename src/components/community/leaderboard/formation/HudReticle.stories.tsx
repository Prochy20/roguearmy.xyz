import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { HudReticle } from './HudReticle'

interface HostProps {
  state: 'locked' | 'relieved' | 'scanning'
}

function ReticleHost({ state }: HostProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: 220,
        height: 220,
        background: '#000',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <HudReticle state={state} />
    </div>
  )
}

const meta = {
  title: 'Components/Community/Leaderboard/Formation/HudReticle',
  component: ReticleHost,
  argTypes: {
    state: { control: 'inline-radio', options: ['locked', 'relieved', 'scanning'] },
  },
  args: { state: 'locked' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ReticleHost>

export default meta
type Story = StoryObj<typeof meta>

export const Locked: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Four corner coordinate labels render', async () => {
      await expect(canvas.getByText('T·L')).toBeInTheDocument()
      await expect(canvas.getByText('B·R')).toBeInTheDocument()
    })
  },
}

export const Scanning: Story = { args: { state: 'scanning' } }
export const Relieved: Story = { args: { state: 'relieved' } }
