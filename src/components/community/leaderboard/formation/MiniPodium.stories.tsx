import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { MiniPodium } from './MiniPodium'
import { MOCK_TOP3 } from './_mock'

const meta = {
  title: 'Components/Community/Leaderboard/Formation/MiniPodium',
  component: MiniPodium,
  args: { entries: MOCK_TOP3, myRank: null },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof MiniPodium>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Top 3 ranks render in order', async () => {
      await expect(canvas.getByText('#01')).toBeInTheDocument()
      await expect(canvas.getByText('#02')).toBeInTheDocument()
      await expect(canvas.getByText('#03')).toBeInTheDocument()
    })
  },
}

export const CallerOnPodium: Story = {
  args: { myRank: 2 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('"YOU" pill marks the caller card', async () => {
      await expect(canvas.getByText('YOU')).toBeInTheDocument()
    })
  },
}
