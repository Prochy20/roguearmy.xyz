import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import type { AfkRecord } from '@/components/afk/types'
import { BottomRail } from './BottomRail'
import { MOCK_MEMBER, MOCK_MEMBER_BOOSTER, MOCK_MEMBER_DEV } from './_mock'

const meta = {
  title: 'Components/Chrome/Header/BottomRail',
  component: BottomRail,
  args: {
    member: MOCK_MEMBER,
    onLogout: fn(),
    presenceOverride: { kind: 'active' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BottomRail>

export default meta
type Story = StoryObj<typeof meta>

const FAKE_AFK_START = new Date(Date.now() - 1000 * 60 * 47).toISOString()

const MOCK_AFK_RECORD: AfkRecord = {
  id: 'afk_mock_01',
  discordId: MOCK_MEMBER.discordId,
  guildId: '888000000000000000',
  reason: 'Out for coffee',
  isValid: true,
  createdAt: FAKE_AFK_START,
  updatedAt: FAKE_AFK_START,
  endedAt: null,
  durationMs: 1000 * 60 * 47,
}

export const LoggedIn: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const logout = canvas.getByRole('button', { name: /logout/i })
    await step('Logout button fires onLogout', async () => {
      await userEvent.click(logout)
      await expect(args.onLogout).toHaveBeenCalledTimes(1)
    })
  },
}

export const Anonymous: Story = { args: { member: null } }
export const BoosterMember: Story = { args: { member: MOCK_MEMBER_BOOSTER } }
export const DeveloperMember: Story = { args: { member: MOCK_MEMBER_DEV } }

export const DeveloperBooster: Story = {
  args: { member: { ...MOCK_MEMBER_DEV, isBooster: true } },
}

export const AfkActive: Story = {
  args: { presenceOverride: { kind: 'afk', record: MOCK_AFK_RECORD } },
}

export const AfkUnresolved: Story = {
  args: { presenceOverride: { kind: 'unresolved' } },
}
