import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ScanlineOverlay } from './ScanlineOverlay'

const SceneBackdrop = ({ children }: { children?: React.ReactNode }) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      minHeight: '24rem',
      background: `
        radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,255,65,0.15) 0%, transparent 50%),
        radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0,255,255,0.10) 0%, transparent 40%),
        #030303
      `,
      overflow: 'hidden',
      padding: '3rem 2rem',
      textAlign: 'center',
    }}
  >
    <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#00FFFF', letterSpacing: '0.2em', margin: 0 }}>
      // SCENE
    </p>
    <h2 style={{ fontFamily: '"Hanson Bold", sans-serif', fontSize: '3rem', textTransform: 'uppercase', color: '#FFFFFF', margin: '0.5rem 0' }}>
      ROGUE ARMY
    </h2>
    <p style={{ color: '#888', fontSize: '0.875rem', maxWidth: '24rem', margin: '0.75rem auto', lineHeight: 1.6 }}>
      Scanlines layer on top, fixed to the viewport.
    </p>
    {children}
  </div>
)

const meta = {
  title: 'Components/Effects/ScanlineOverlay',
  component: ScanlineOverlay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A fixed, full-viewport overlay (`position: fixed; inset: 0; z-index: 50`). In Storybook, the scanlines cover the entire preview iframe — that\'s how it works in production too. Use `intensity="low"` for ambient page-wide texture.',
      },
    },
  },
  argTypes: {
    intensity: { control: 'inline-radio', options: ['low', 'medium', 'high'] },
    animated: { control: 'boolean' },
  },
  args: {
    intensity: 'medium',
    animated: true,
  },
  render: (args) => (
    <SceneBackdrop>
      <ScanlineOverlay {...args} />
    </SceneBackdrop>
  ),
} satisfies Meta<typeof ScanlineOverlay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Static: Story = {
  args: { animated: false },
}
