import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AfkTicker } from './AfkTicker'

const meta = {
  title: 'Components/AFK/AfkTicker',
  component: AfkTicker,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AfkTicker>

export default meta
type Story = StoryObj<typeof meta>

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

export const Loud: Story = {
  args: { createdAt: minutesAgo(2), variant: 'loud' },
}

export const Compact: Story = {
  args: { createdAt: minutesAgo(134), variant: 'compact' },
}

/**
 * Spans every block window the ticker can land in. Use this when reasoning
 * about visual hierarchy or layout at extremes — short AFK, all-day, 3
 * months, multi-year forgotten session.
 */
export const LoudGallery: Story = {
  args: { createdAt: minutesAgo(0), variant: 'loud' },
  render: () => (
    <div className="flex flex-col gap-10">
      <Row label="Under 1 hour · H/M/S">
        <AfkTicker variant="loud" createdAt={minutesAgo(2)} />
      </Row>
      <Row label="Mid-day · H/M/S">
        <AfkTicker variant="loud" createdAt={minutesAgo(60 * 6 + 30)} />
      </Row>
      <Row label="Multi-day · D/H/M">
        <AfkTicker variant="loud" createdAt={daysAgo(3) /* 3d window */} />
      </Row>
      <Row label="Months scale · MO/D/H">
        <AfkTicker variant="loud" createdAt={daysAgo(95) /* ~3mo 5d */} />
      </Row>
      <Row label="Years scale · Y/MO/D">
        <AfkTicker variant="loud" createdAt={daysAgo(580) /* ~1y 7mo */} />
      </Row>
    </div>
  ),
}

export const CompactGallery: Story = {
  args: { createdAt: minutesAgo(0), variant: 'compact' },
  render: () => (
    <div className="flex flex-col gap-3 font-mono text-[13px] text-text-muted">
      <Line label="40s">
        <AfkTicker variant="compact" createdAt={minutesAgo(0.67)} />
      </Line>
      <Line label="12m">
        <AfkTicker variant="compact" createdAt={minutesAgo(12)} />
      </Line>
      <Line label="6h 30m">
        <AfkTicker variant="compact" createdAt={minutesAgo(60 * 6 + 30)} />
      </Line>
      <Line label="3d 4h">
        <AfkTicker variant="compact" createdAt={daysAgo(3.17)} />
      </Line>
      <Line label="3mo 5d">
        <AfkTicker variant="compact" createdAt={daysAgo(95)} />
      </Line>
      <Line label="1y 7mo">
        <AfkTicker variant="compact" createdAt={daysAgo(580)} />
      </Line>
    </div>
  ),
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
        {label}
      </span>
      {children}
    </div>
  )
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="w-20 uppercase tracking-[0.2em] text-text-muted/70">{label}</span>
      <span className="text-text-primary">{children}</span>
    </div>
  )
}
