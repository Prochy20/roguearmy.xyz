import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestActions } from './DigestActions'
import { DigestTitleBlock } from './DigestTitleBlock'

const meta = {
  title: 'Components/Division2/Digest/DigestTitleBlock',
  component: DigestTitleBlock,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
  },
  args: {
    accent: 'cyan',
    title: 'WEEK 21 · ESCALATION ROLL-UP',
    perex: 'Five missions, new vendor prototype caches, and the meta shift to AR-friendly builds.',
    dateLabel: 'WEEK OF MAY 19',
    readMinutes: 6,
    actions: <DigestActions accent="cyan" />,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DigestTitleBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Date label and read-time render in the byline', async () => {
      await expect(canvas.getByText(args.dateLabel)).toBeInTheDocument()
      await expect(canvas.getByText(/6 min read/i)).toBeInTheDocument()
    })
  },
}
