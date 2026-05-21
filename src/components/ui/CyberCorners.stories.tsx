import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { CyberCorners } from './CyberCorners'

const ALL_COLORS = [
  'green',
  'cyan',
  'magenta',
  'orange',
  'red',
  'gray',
  'dev',
  'admin',
  'mod',
  'source-youtube',
  'source-reddit',
  'source-ubisoft',
] as const

const SampleContent = ({ label }: { label: string }) => (
  <div style={{ padding: '1.5rem 2rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#FFFFFF', background: '#0A0A0A', minWidth: '12rem', textAlign: 'center' }}>
    {label}
  </div>
)

const meta = {
  title: 'Components/UI/CyberCorners',
  component: CyberCorners,
  argTypes: {
    color: { control: 'select', options: ALL_COLORS },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    glow: { control: 'boolean' },
    corners: { control: 'check', options: ['tl', 'tr', 'bl', 'br'] },
  },
  args: {
    color: 'green',
    size: 'md',
    glow: true,
    corners: ['tl', 'tr', 'bl', 'br'],
    children: <SampleContent label="content" />,
  },
} satisfies Meta<typeof CyberCorners>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: <SampleContent label="hover me" /> },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const target = canvas.getByText('hover me')
    await step('Hover triggers bracket-shift animation', async () => {
      await userEvent.hover(target.parentElement ?? target)
    })
  },
}

export const NoGlow: Story = {
  args: { glow: false, children: <SampleContent label="no glow" /> },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const target = canvas.getByText('no glow')
    await step('Hover still triggers bracket-shift without the shadow', async () => {
      await userEvent.hover(target.parentElement ?? target)
    })
  },
}

export const TopCornersOnly: Story = {
  args: { corners: ['tl', 'tr'], children: <SampleContent label="top frame" /> },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const target = canvas.getByText('top frame')
    await step('Hover over a half-framed container', async () => {
      await userEvent.hover(target.parentElement ?? target)
    })
  },
}

export const BottomCornersOnly: Story = {
  args: { corners: ['bl', 'br'], children: <SampleContent label="bottom frame" /> },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const target = canvas.getByText('bottom frame')
    await step('Hover over a half-framed container', async () => {
      await userEvent.hover(target.parentElement ?? target)
    })
  },
}

export const DiagonalCorners: Story = {
  args: { corners: ['tl', 'br'], children: <SampleContent label="diagonal" /> },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const target = canvas.getByText('diagonal')
    await step('Hover over the diagonal-accent variant', async () => {
      await userEvent.hover(target.parentElement ?? target)
    })
  },
}

export const AllColors: Story = {
  args: { children: null },
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
      {ALL_COLORS.map((c) => (
        <CyberCorners key={c} color={c} size="sm">
          <SampleContent label={c} />
        </CyberCorners>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step(`All ${ALL_COLORS.length} colour variants render`, async () => {
      for (const color of ALL_COLORS) {
        await expect(canvas.getByText(color)).toBeInTheDocument()
      }
    })
  },
}

export const AllSizes: Story = {
  args: { children: null },
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <CyberCorners key={s} color="cyan" size={s}>
          <SampleContent label={s} />
        </CyberCorners>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders sm / md / lg side by side', async () => {
      await expect(canvas.getByText('sm')).toBeInTheDocument()
      await expect(canvas.getByText('md')).toBeInTheDocument()
      await expect(canvas.getByText('lg')).toBeInTheDocument()
    })
  },
}
