import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'
import { CodeBlock } from './CodeBlock'

const TS_SAMPLE = `export function add(a: number, b: number) {
  return a + b
}`

const meta = {
  title: 'Components/Markdown/CodeBlock',
  component: CodeBlock,
  argTypes: {
    className: { control: 'text' },
  },
  args: {
    className: 'language-typescript',
    children: TS_SAMPLE,
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CodeBlock>

export default meta
type Story = StoryObj<typeof meta>

export const TypeScript: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Language badge surfaces in the header (once Shiki resolves)', async () => {
      await canvas.findByText(/typescript/i, {}, { timeout: 3000 })
    })
  },
}

export const Bash: Story = {
  args: {
    className: 'language-bash',
    children: 'pnpm devsafe && pnpm test:int',
  },
}

export const PlainText: Story = {
  args: { className: undefined, children: 'No language specified.' },
}
