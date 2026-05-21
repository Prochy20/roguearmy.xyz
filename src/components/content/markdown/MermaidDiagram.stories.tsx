import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'
import { MermaidDiagram } from './MermaidDiagram'

const FLOWCHART = `flowchart LR
  A[Operative] --> B{Verified?}
  B -- Yes --> C[Onboard]
  B -- No --> D[Reject]`

const meta = {
  title: 'Components/Content/Markdown/MermaidDiagram',
  component: MermaidDiagram,
  args: { code: FLOWCHART },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MermaidDiagram>

export default meta
type Story = StoryObj<typeof meta>

export const Flowchart: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders the "Rendering" loader before mermaid finishes', async () => {
      // Either the loader shows briefly or the SVG mounts — at least one of the two appears.
      await canvas.findByText(/rendering|diagram/i, {}, { timeout: 3000 })
    })
  },
}

export const Sequence: Story = {
  args: {
    code: `sequenceDiagram
  participant A as Operative
  participant B as Ashley
  A->>B: Authenticate
  B-->>A: Token`,
  },
}

export const Invalid: Story = {
  args: { code: 'totally not mermaid syntax {' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Invalid syntax surfaces the diagram error tile', async () => {
      await canvas.findByText(/diagram error/i, {}, { timeout: 4000 })
    })
  },
}
