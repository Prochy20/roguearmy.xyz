import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { AroundMeStrip } from './AroundMeStrip'
import { MOCK_ME } from './_mock'

/**
 * AroundMeStrip fetches a 5-around-me cohort via a server action on mount.
 * In Storybook the action isn't wired, so the strip stays in its "loading"
 * branch — that's the variant we showcase here.
 */
const meta = {
  title: 'Components/Community/Leaderboard/AroundMeStrip',
  component: AroundMeStrip,
  args: {
    myRank: MOCK_ME.rank,
    myDiscordId: MOCK_ME.discordId,
    active: true,
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 820, border: '1px solid rgba(0,255,65,0.2)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AroundMeStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Strip renders one of the post-mount branches', async () => {
      // The server action isn't wired in Storybook, so the effect either
      // resolves to a `fail` state (rejected promise) or stays in `loading`
      // (pending promise) depending on the bundler stub. Either copy is fine
      // — we just want to confirm the effect ran past the `idle` branch.
      await canvas.findByText(
        /loading cohort|cohort unavailable|no entries/i,
        {},
        { timeout: 2000 },
      )
    })
  },
}

export const Inactive: Story = {
  args: { active: false },
}
