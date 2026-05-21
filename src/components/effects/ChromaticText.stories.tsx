import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ChromaticText } from './ChromaticText'

const meta = {
  title: 'Components/Effects/ChromaticText',
  component: ChromaticText,
  argTypes: {
    as: { control: 'select', options: ['h1', 'h2', 'h3', 'span', 'p', 'div'] },
    animated: { control: 'boolean' },
  },
  args: {
    as: 'h2',
    animated: false,
    children: 'ROGUE ARMY',
    className: 'font-display text-5xl uppercase text-white',
  },
} satisfies Meta<typeof ChromaticText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Animated: Story = {
  args: { animated: true, children: 'ANIMATED PULSE' },
}

export const InContext: Story = {
  args: { children: null },
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ maxWidth: '32rem', textAlign: 'center', padding: '2rem' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>
        // 04 — GRADIENTS
      </p>
      <ChromaticText as="h2" className="font-display text-5xl uppercase text-white" animated>
        GRADIENTS
      </ChromaticText>
      <p style={{ color: '#888', fontSize: '0.875rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
        Gradients bridge our accent colors and add energy to flat surfaces.
      </p>
    </div>
  ),
}
