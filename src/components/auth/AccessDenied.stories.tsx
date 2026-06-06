import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'
import { AccessDenied } from './AccessDenied'

const ALL_REASONS = ['not_authenticated', 'not_member', 'banned', 'left_server', 'error'] as const

const meta = {
  title: 'Components/Auth/AccessDenied',
  component: AccessDenied,
  argTypes: {
    reason: { control: 'inline-radio', options: ALL_REASONS },
  },
  args: { reason: 'not_member' },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/members' } },
  },
} satisfies Meta<typeof AccessDenied>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders the "MEMBERSHIP REQUIRED" headline', async () => {
      await canvas.findByText(/membership required/i, {}, { timeout: 2000 })
    })
  },
}

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {ALL_REASONS.map((reason) => (
        <div key={reason} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <AccessDenied reason={reason} />
        </div>
      ))}
    </div>
  ),
}
