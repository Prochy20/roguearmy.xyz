import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { BottomRail } from './BottomRail'
import { MOCK_MEMBER, MOCK_MEMBER_BOOSTER, MOCK_MEMBER_DEV } from './_mock'

const meta = {
  title: 'Components/Chrome/Header/BottomRail',
  component: BottomRail,
  args: {
    member: MOCK_MEMBER,
    onLogout: fn(),
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BottomRail>

export default meta
type Story = StoryObj<typeof meta>

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
