import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichTextRenderer } from './RichTextRenderer'

/**
 * Minimal Lexical document — the converter map renders paragraph + text nodes
 * the same way Payload does, so a hand-built tree is enough to exercise the
 * common case without needing a real editor instance.
 */
const HELLO_DOC: SerializedEditorState = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'heading',
        tag: 'h2',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          {
            type: 'text',
            text: 'Briefing',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
      },
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          {
            type: 'text',
            text: 'Operatives report at 0800 — channel sync is mandatory.',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
      },
    ],
  } as unknown as SerializedEditorState['root'],
}

const meta = {
  title: 'Components/Content/RichText/RichTextRenderer',
  component: RichTextRenderer,
  args: { data: HELLO_DOC },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RichTextRenderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Lexical document renders the heading + paragraph', async () => {
      await expect(canvas.getByText(/briefing/i)).toBeInTheDocument()
      await expect(canvas.getByText(/operatives report/i)).toBeInTheDocument()
    })
  },
}

export const Nullish: Story = {
  args: { data: null },
}
