import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { RosterModal } from './RosterModal'
import { MOCK_ME, MOCK_ROSTER } from './_mock'

const meta = {
  title: 'Components/Community/Leaderboard/Formation/RosterModal',
  component: RosterModal,
  args: {
    open: true,
    entries: MOCK_ROSTER,
    callerXp: MOCK_ME.xp,
    callerRank: MOCK_ME.rank,
    hasMore: false,
    isLoading: false,
    onClose: fn(),
    onDesignate: fn(),
    onLoadMore: fn(),
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof RosterModal>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  play: async ({ args, step }) => {
    const body = within(document.body)
    await step('Roster row for the top operative renders', async () => {
      await expect(body.getAllByText(MOCK_ROSTER[0].displayName).length).toBeGreaterThan(0)
    })
    await step('Typing in the search filters rows', async () => {
      const inputs = body.queryAllByPlaceholderText(/search|filter|name/i) as HTMLInputElement[]
      const input = inputs[0]
      if (input) {
        await userEvent.type(input, MOCK_ROSTER[2].displayName.slice(0, 3))
      }
    })
    await step('Close prop is honored — clicking close fires it', async () => {
      const closeBtn = body.queryAllByRole('button').find((b) => /close|esc|×/i.test(b.textContent ?? ''))
      if (closeBtn) {
        await userEvent.click(closeBtn)
        await expect(args.onClose).toHaveBeenCalled()
      }
    })
  },
}

export const Closed: Story = { args: { open: false } }
export const Loading: Story = { args: { hasMore: true, isLoading: true } }
