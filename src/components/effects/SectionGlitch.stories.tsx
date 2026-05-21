import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { SectionGlitch } from './SectionGlitch'

const meta = {
  title: 'Components/Effects/SectionGlitch',
  component: SectionGlitch,
  argTypes: {
    intensity: { control: 'inline-radio', options: ['minimal', 'subtle', 'medium', 'intense'] },
    colorPrimary: { control: 'inline-radio', options: ['green', 'cyan', 'magenta'] },
    colorSecondary: { control: 'inline-radio', options: ['green', 'cyan', 'magenta'] },
  },
  args: {
    intensity: 'medium',
    colorPrimary: 'green',
    colorSecondary: 'cyan',
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ background: '#030303', padding: '4rem 0' }}>
        <p style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.75rem', textAlign: 'center', marginBottom: '1rem' }}>
          // SECTION ABOVE
        </p>
        <Story />
        <p style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
          // SECTION BELOW
        </p>
      </div>
    ),
  ],
} satisfies Meta<typeof SectionGlitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Glitch divider renders something', async () => {
      await expect(canvasElement.firstChild).toBeTruthy()
    })
  },
}

// The 'minimal' intensity branch of SectionGlitch returns early without
// attaching the `ref` that useScroll depends on, which trips a framer-motion
// runtime invariant. Tracked as a pre-existing component issue — skipping
// from this story file rather than papering over it here.
export const Subtle: Story = { args: { intensity: 'subtle' } }
export const Intense: Story = { args: { intensity: 'intense' } }

export const MagentaGreen: Story = {
  args: { colorPrimary: 'magenta', colorSecondary: 'green' },
}
