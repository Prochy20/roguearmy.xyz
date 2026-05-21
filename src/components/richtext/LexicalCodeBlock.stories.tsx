import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'
import { LexicalCodeBlock } from './LexicalCodeBlock'

const meta = {
  title: 'Components/RichText/LexicalCodeBlock',
  component: LexicalCodeBlock,
  argTypes: {
    language: { control: 'text' },
  },
  args: {
    code: `function ping(host: string) {\n  return fetch('https://' + host)\n}`,
    language: 'typescript',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LexicalCodeBlock>

export default meta
type Story = StoryObj<typeof meta>

export const TypeScript: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Copy button is exposed', async () => {
      await canvas.findByRole('button', { name: /copy/i }, { timeout: 3000 })
    })
  },
}

export const Mermaid: Story = {
  args: {
    language: 'mermaid',
    code: 'flowchart LR\n  A --> B\n  B --> C',
  },
}
