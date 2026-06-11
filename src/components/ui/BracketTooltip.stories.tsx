import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { BracketTooltip } from './BracketTooltip'

const meta = {
  title: 'Components/UI/BracketTooltip',
  component: BracketTooltip,
  parameters: { layout: 'centered' },
  args: {
    title: 'Profile',
    side: 'top',
    children: (
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center border border-rga-green/30 bg-rga-green/[0.05] text-rga-green/80"
      >
        ▣
      </button>
    ),
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'bottom'] },
    title: { control: 'text' },
    body: { control: 'text' },
  },
} satisfies Meta<typeof BracketTooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Hover trigger reveals the popover', async () => {
      await userEvent.hover(canvas.getByRole('button'))
      await expect(canvas.getByRole('tooltip')).toBeVisible()
    })
  },
}

export const WithBody: Story = {
  args: {
    title: 'Youtube',
    body: 'Creator content — channels covering Division 2 builds, guides, news, patch breakdowns.',
    side: 'bottom',
    accentText: 'text-source-youtube',
    accentBorder: 'border-source-youtube/60',
    cornerTick: 'border-source-youtube/80',
    widthClass: 'w-[280px]',
  },
}

export const Gallery: Story = {
  render: () => (
    <div className="flex items-center gap-10 py-16">
      <BracketTooltip title="Profile" side="top">
        <button type="button" className="border border-rga-green/40 px-3 py-2 text-rga-green">
          TOP
        </button>
      </BracketTooltip>
      <BracketTooltip
        title="Reddit"
        body="Community discussion — threads, AMAs, bug reports."
        side="bottom"
        accentText="text-source-reddit"
        accentBorder="border-source-reddit/60"
        cornerTick="border-source-reddit/80"
        widthClass="w-[260px]"
      >
        <button type="button" className="border border-source-reddit/60 px-3 py-2 text-source-reddit">
          BOTTOM + BODY
        </button>
      </BracketTooltip>
    </div>
  ),
}
