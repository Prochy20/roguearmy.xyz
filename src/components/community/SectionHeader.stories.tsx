import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { SectionHeader } from './SectionHeader'

const meta = {
  title: 'Components/Community/SectionHeader',
  component: SectionHeader,
  argTypes: {
    align: { control: 'inline-radio', options: ['left', 'center'] },
  },
  args: {
    num: '01',
    eyebrow: 'LIVE METRICS',
    kicker: '// SNAPSHOT 18:42 UTC',
    title: 'BY THE NUMBERS',
    align: 'left',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const LeftAligned: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('SEC_NN prefix + title render', async () => {
      await expect(canvas.getByText(`SEC_${args.num}`)).toBeInTheDocument()
      await expect(canvas.getByText(args.title)).toBeInTheDocument()
    })
  },
}

export const CenterAligned: Story = {
  args: { align: 'center', num: '04', eyebrow: 'JOIN', title: 'STAND THE WATCH' },
}
