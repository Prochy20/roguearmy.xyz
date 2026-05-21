import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { Avatar } from './Avatar'
import { MOCK_MEMBER, MOCK_MEMBER_BOOSTER } from './_mock'

const meta = {
  title: 'Components/Chrome/Header/Avatar',
  component: Avatar,
  argTypes: {
    size: { control: { type: 'number', min: 16, max: 96, step: 4 } },
    booster: { control: 'boolean' },
  },
  args: {
    member: MOCK_MEMBER,
    size: 48,
    booster: false,
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Initial letter renders when no avatar hash present', async () => {
      const initial = (args.member.globalName ?? args.member.username).charAt(0).toUpperCase()
      await expect(canvas.getByText(initial)).toBeInTheDocument()
    })
  },
}

export const BoosterDecoration: Story = {
  args: { member: MOCK_MEMBER_BOOSTER, booster: true },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Avatar member={MOCK_MEMBER} size={24} />
      <Avatar member={MOCK_MEMBER} size={36} />
      <Avatar member={MOCK_MEMBER} size={48} />
      <Avatar member={MOCK_MEMBER} size={72} />
    </div>
  ),
}
