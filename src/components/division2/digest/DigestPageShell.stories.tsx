import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestPageShell } from './DigestPageShell'

const meta = {
  title: 'Components/Division2/Digest/DigestPageShell',
  component: DigestPageShell,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
  },
  args: {
    accent: 'cyan',
    header: (
      <div style={{ padding: '1rem', border: '1px solid rgba(0,255,255,0.25)' }}>
        <p className="font-mono text-xs text-rga-cyan">// HEADER SLOT · breadcrumb + tags + title</p>
      </div>
    ),
    toc: (
      <div style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.12)' }}>
        <p className="font-mono text-xs text-text-muted">// TOC SLOT</p>
      </div>
    ),
    body: (
      <div style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.12)' }}>
        <p className="font-mono text-xs text-text-muted">// BODY SLOT · doc strip + briefing</p>
      </div>
    ),
    reading: (
      <div style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.12)' }}>
        <p className="font-mono text-xs text-text-muted">// READING WIDGET SLOT</p>
      </div>
    ),
    footer: (
      <div style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.12)' }}>
        <p className="font-mono text-xs text-text-muted">// FOOTER SLOT · prev/next</p>
      </div>
    ),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DigestPageShell>

export default meta
type Story = StoryObj<typeof meta>

export const WithToc: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All four named slots render their placeholders', async () => {
      await expect(canvas.getByText(/header slot/i)).toBeInTheDocument()
      await expect(canvas.getByText(/toc slot/i)).toBeInTheDocument()
      await expect(canvas.getByText(/body slot/i)).toBeInTheDocument()
      await expect(canvas.getByText(/footer slot/i)).toBeInTheDocument()
    })
  },
}

export const WithoutToc: Story = { args: { toc: null } }
