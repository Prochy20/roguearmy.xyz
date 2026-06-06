import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import type { TOCHeading } from '@/lib/toc'
import { MobileTOC } from './MobileTOC'

const MOCK_HEADINGS: TOCHeading[] = [
  { id: 'h-intro', text: 'Introduction', level: 1 },
  { id: 'h-onboarding', text: 'Onboarding', level: 2 },
  { id: 'h-comms', text: 'Comms', level: 2 },
]

const meta = {
  title: 'Components/Content/TOC/MobileTOC',
  component: MobileTOC,
  args: { headings: MOCK_HEADINGS },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MobileTOC>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Header shows section count', async () => {
      await expect(canvas.getByText(/3 sections/i)).toBeInTheDocument()
    })
    await step('Clicking the toggle expands the list', async () => {
      // The component is `lg:hidden` so the button sits inside a display:none
      // wrapper at desktop viewports — getByRole excludes hidden elements by
      // default, so we opt-in with { hidden: true } to query it anyway.
      const toggle = canvas.getByRole('button', { name: /3 sections/i, hidden: true })
      await userEvent.click(toggle)
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    })
  },
}

export const Empty: Story = { args: { headings: [] } }
