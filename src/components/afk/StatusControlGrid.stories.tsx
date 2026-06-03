import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StatusControlGrid } from './StatusControlGrid'

const meta = {
  title: 'Components/AFK/StatusControlGrid',
  component: StatusControlGrid,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StatusControlGrid>

export default meta
type Story = StoryObj<typeof meta>

const Placeholder = ({ label }: { label: string }) => (
  <div className="flex h-64 items-center justify-center border border-dashed border-[rgba(255,255,255,0.15)] font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted">
    {label}
  </div>
)

export const Default: Story = {
  args: {
    handle: 'ragingdad',
    currentState: <Placeholder label="CurrentStateCard" />,
    setStatus: <Placeholder label="SetStatusForm" />,
  },
}
