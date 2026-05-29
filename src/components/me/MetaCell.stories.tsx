import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { MetaCell } from './MetaCell'

const meta = {
  title: 'Components/Me/MetaCell',
  component: MetaCell,
  args: { label: 'MEMBER_SINCE', value: 'MAR 14, 2020' },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <dl className="max-w-[280px]">
        <Story />
      </dl>
    ),
  ],
} satisfies Meta<typeof MetaCell>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Label and value render', async () => {
      await expect(canvas.getByText('MEMBER_SINCE')).toBeInTheDocument()
      await expect(canvas.getByText('MAR 14, 2020')).toBeInTheDocument()
    })
  },
}

export const WithStatusDot: Story = {
  args: {
    label: 'STATUS',
    value: 'ACTIVE',
    statusDot: { tone: 'green', pulse: true },
  },
}

export const LongValue: Story = {
  args: { label: 'DISCORD_ID', value: '184920113770528768' },
}
