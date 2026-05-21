import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ScrollReveal, ScrollRevealContainer, ScrollRevealItem } from './ScrollReveal'

const Card = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '1.5rem', border: '1px solid rgba(0,255,65,0.2)', background: '#0A0A0A', color: '#FFFFFF', fontFamily: 'monospace', fontSize: '0.875rem' }}>
    {children}
  </div>
)

const meta = {
  title: 'Components/Shared/ScrollReveal',
  component: ScrollReveal,
  argTypes: {
    direction: { control: 'inline-radio', options: ['up', 'down', 'left', 'right', 'none'] },
    delay: { control: { type: 'number', min: 0, step: 50 } },
    duration: { control: { type: 'number', min: 0.1, step: 0.1 } },
    once: { control: 'boolean' },
    amount: { control: { type: 'number', min: 0, max: 1, step: 0.1 } },
  },
  args: {
    direction: 'up',
    duration: 0.6,
    once: true,
    amount: 0.3,
    children: <Card>Revealed on scroll into view</Card>,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ScrollReveal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Child content renders', async () => {
      await expect(canvas.getByText('Revealed on scroll into view')).toBeInTheDocument()
    })
  },
}

export const DirectionsRow: Story = {
  args: { children: null },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
      {(['up', 'down', 'left', 'right', 'none'] as const).map((d) => (
        <ScrollReveal key={d} direction={d}>
          <Card>{d}</Card>
        </ScrollReveal>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All 5 directions render', async () => {
      for (const d of ['up', 'down', 'left', 'right', 'none']) {
        await expect(canvas.getByText(d)).toBeInTheDocument()
      }
    })
  },
}

export const StaggeredContainer: Story = {
  args: { children: null },
  render: () => (
    <ScrollRevealContainer staggerDelay={0.15}>
      <ScrollRevealItem>
        <Card>Item 1</Card>
      </ScrollRevealItem>
      <ScrollRevealItem>
        <Card>Item 2</Card>
      </ScrollRevealItem>
      <ScrollRevealItem>
        <Card>Item 3</Card>
      </ScrollRevealItem>
    </ScrollRevealContainer>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All staggered items render', async () => {
      await expect(canvas.getByText('Item 1')).toBeInTheDocument()
      await expect(canvas.getByText('Item 2')).toBeInTheDocument()
      await expect(canvas.getByText('Item 3')).toBeInTheDocument()
    })
  },
}
