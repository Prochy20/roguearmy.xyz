import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { GlitchOnChange } from './GlitchOnChange'
import { Button } from '@/components/ui/button'

function GlitchOnChangeDemo({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState('A')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {['A', 'B', 'C'].map((p) => (
          <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}>
            {p}
          </Button>
        ))}
      </div>
      <GlitchOnChange triggerKey={page}>
        <div style={{ padding: '2rem', border: '1px solid rgba(0,255,65,0.2)', background: '#0A0A0A', minWidth: '20rem' }}>
          <p className="font-mono text-rga-green">Page {page}</p>
          <p className="text-text-secondary text-sm">{children}</p>
        </div>
      </GlitchOnChange>
    </div>
  )
}

const meta = {
  title: 'Components/Effects/GlitchOnChange',
  component: GlitchOnChangeDemo,
  args: {
    children: 'Click a different page button — the content transitions with a screen-tearing glitch.',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof GlitchOnChangeDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const buttonB = canvas.getByRole('button', { name: 'B' })

    await step('Initial mount renders the demo page A content', async () => {
      await expect(canvas.getAllByText(/Page A/i).length).toBeGreaterThan(0)
    })

    await step('Changing triggerKey fires the glitch sequence', async () => {
      await userEvent.click(buttonB)
      await expect(canvas.getAllByText(/Page B/i).length).toBeGreaterThan(0)
    })
  },
}
