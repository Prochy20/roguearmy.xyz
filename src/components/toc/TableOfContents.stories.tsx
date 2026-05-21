import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import type { TOCHeading } from '@/lib/toc'
import { TableOfContents } from './TableOfContents'

const MOCK_HEADINGS: TOCHeading[] = [
  { id: 'h-intro', text: 'Introduction', level: 1 },
  { id: 'h-onboarding', text: 'Onboarding', level: 2 },
  { id: 'h-handshake', text: 'Handshake protocol', level: 3 },
  { id: 'h-roles', text: 'Game roles', level: 3 },
  { id: 'h-comms', text: 'Comms', level: 2 },
]

const meta = {
  title: 'Components/TOC/TableOfContents',
  component: TableOfContents,
  args: { headings: MOCK_HEADINGS },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '120vh', padding: '4rem' }}>
        <p style={{ color: '#888', fontFamily: 'monospace', fontSize: 12 }}>
          (Fixed TOC sits in the left gutter on lg+ viewports.)
        </p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TableOfContents>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ step }) => {
    const body = within(document.body)
    await step('Back-to-articles link is in the panel', async () => {
      await expect(body.getByRole('link', { name: /back to articles/i })).toBeInTheDocument()
    })
  },
}

export const NoHeadings: Story = { args: { headings: [] } }
