import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BlogAuthProvider, type BlogAuthState, type MemberInfo } from '@/contexts/BlogAuthContext'
import { BlogNavUserMenu } from './BlogNavUserMenu'

const MEMBER: MemberInfo = {
  discordId: '100000000000000001',
  username: 'axis',
  globalName: 'AXIS',
  avatar: null,
}

const AUTH: BlogAuthState = {
  authenticated: true,
  member: MEMBER,
  memberId: 'mbr_axis',
}

const meta = {
  title: 'Components/Blog/BlogNavUserMenu',
  component: BlogNavUserMenu,
  decorators: [
    (Story) => (
      <BlogAuthProvider authState={AUTH}>
        <Story />
      </BlogAuthProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof BlogNavUserMenu>

export default meta
type Story = StoryObj<typeof meta>

export const LoggedIn: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Avatar trigger shows the member display name', async () => {
      await expect(canvas.getByText(MEMBER.globalName!)).toBeInTheDocument()
    })
  },
}
