import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { RoleStrip, type AshleyMe } from './RoleStrip'

const EMPTY_USER: AshleyMe['user'] = {
  discordId: '184920113770528768',
  avatarUrls: null,
  serverAvatarUrls: null,
  joinedAt: '2020-03-14T00:00:00Z',
  discordRoles: [],
}

const POPULATED: AshleyMe = {
  user: {
    ...EMPTY_USER,
    discordRoles: [
      { id: '1', name: 'BOOSTER', color: '#FF73FA', managed: false },
      { id: '2', name: 'VETERAN', color: '#00FF41', managed: false },
      { id: '3', name: 'DARK ZONE', color: '#00FFFF', managed: false },
      { id: '4', name: 'DIV2 MAIN', color: '#FF8800', managed: false },
      { id: '5', name: 'Discord Nitro', color: '#FF00FF', managed: true },
      { id: '6', name: '@everyone', color: null, managed: false },
    ],
  },
}

const meta = {
  title: 'Components/Me/RoleStrip',
  component: RoleStrip,
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof RoleStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { ashleyMe: { ok: true, data: POPULATED } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Role chips render and @everyone is filtered out', async () => {
      await expect(canvas.getByText('BOOSTER')).toBeInTheDocument()
      await expect(canvas.queryByText('@everyone')).not.toBeInTheDocument()
    })
    await step('Managed roles show SYS marker', async () => {
      await expect(canvas.getByText('SYS')).toBeInTheDocument()
    })
  },
}

export const Empty: Story = {
  args: { ashleyMe: { ok: true, data: { user: EMPTY_USER } } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Empty state copy renders', async () => {
      await expect(canvas.getByText(/NO ASSIGNMENTS ON RECORD/)).toBeInTheDocument()
    })
  },
}

export const FailNetwork: Story = {
  args: {
    ashleyMe: {
      ok: false,
      error: { code: 'unavailable', status: 503, message: 'upstream timeout' },
    },
  },
}
