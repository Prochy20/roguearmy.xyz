import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { MarkdownRenderer } from './MarkdownRenderer'

const SAMPLE = `# AGENT BOOTSTRAP HANDBOOK

A short field guide.

## 1. Onboarding

Every operative starts with a handshake and a sigil.

- Greet in #general
- Drop a timezone
- Pick your game roles

:::tip OPERATOR HINT
Ashley DMs you the next steps within 60 seconds.
:::

\`\`\`ts
export function deploy(): boolean {
  return true
}
\`\`\`
`

const meta = {
  title: 'Components/Content/Markdown/MarkdownRenderer',
  component: MarkdownRenderer,
  argTypes: {
    content: { control: 'text' },
  },
  args: { content: SAMPLE },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MarkdownRenderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Headings + paragraphs render through react-markdown', async () => {
      await expect(canvas.getByText(/agent bootstrap handbook/i)).toBeInTheDocument()
      await expect(canvas.getByText(/onboarding/i)).toBeInTheDocument()
    })
  },
}

export const Minimal: Story = {
  args: { content: '# Hello\n\nA single paragraph.' },
}
