import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { UserAvatar } from './UserAvatar'

const meta = {
  title: 'Components/Auth/UserAvatar',
  component: UserAvatar,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  args: {
    discordId: '100000000000000001',
    avatar: null,
    username: 'axis',
    size: 'md',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof UserAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Avatar exposes the username via alt text', async () => {
      await expect(canvas.getByAltText(`${args.username}'s avatar`)).toBeInTheDocument()
    })
  },
}

export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <UserAvatar
          key={size}
          discordId="100000000000000001"
          avatar={null}
          username={size}
          size={size}
        />
      ))}
    </div>
  ),
}
