import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { IdentityCard } from './IdentityCard'

const MOCK_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stop-color="#1a3320"/>
           <stop offset="100%" stop-color="#020202"/>
         </linearGradient>
       </defs>
       <rect width="256" height="256" fill="url(#g)"/>
       <text x="128" y="148" text-anchor="middle" font-family="monospace" font-size="84" fill="#00FF41" font-weight="700">RG</text>
     </svg>`,
  )

const BASE = {
  codename: 'RAGINGDAD',
  handle: 'ragingdad',
  discordId: '184920113770528768',
  memberSince: 'MAR 14, 2020',
  avatarUrl: MOCK_AVATAR,
}

const meta = {
  title: 'Components/Me/IdentityCard',
  component: IdentityCard,
  args: { ...BASE, badge: 'BOOSTER', isBooster: false },
  argTypes: {
    badge: {
      control: 'inline-radio',
      options: ['DEVELOPER', 'STAFF', 'BOOSTER', 'MEMBER'],
    },
    isBooster: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof IdentityCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Codename and clearance render', async () => {
      await expect(canvas.getByText('RAGINGDAD')).toBeInTheDocument()
      await expect(canvas.getByText('BOOSTER')).toBeInTheDocument()
    })
    await step('Discord ID is preserved verbatim', async () => {
      await expect(canvas.getByText('184920113770528768')).toBeInTheDocument()
    })
  },
}

export const StaffWithBooster: Story = {
  args: { badge: 'STAFF', isBooster: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Both clearance and booster decoration show', async () => {
      await expect(canvas.getByText('STAFF')).toBeInTheDocument()
      await expect(canvas.getByText('BOOSTER')).toBeInTheDocument()
    })
  },
}

export const Developer: Story = {
  args: { badge: 'DEVELOPER', isBooster: false },
}

export const PlainMember: Story = {
  args: { badge: 'MEMBER', isBooster: false },
}
