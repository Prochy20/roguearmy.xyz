import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { TOCItem } from './TOCItem'

const meta = {
  title: 'Components/TOC/TOCItem',
  component: TOCItem,
  argTypes: {
    isActive: { control: 'boolean' },
  },
  args: {
    heading: { id: 'sec-onboarding', text: 'Onboarding', level: 2 },
    isActive: false,
    onClick: fn(),
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 240, padding: '1rem', borderLeft: '1px solid rgba(0,255,65,0.15)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TOCItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Clicking the item fires onClick with the heading id', async () => {
      await userEvent.click(canvas.getByRole('button'))
      await expect(args.onClick).toHaveBeenCalledWith(args.heading.id)
    })
  },
}

export const Active: Story = { args: { isActive: true } }

export const Level3: Story = {
  args: { heading: { id: 'sec-subsection', text: 'Detail subsection', level: 3 } },
}
