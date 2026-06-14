import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { TopBar } from './TopBar'
import { MOCK_MEMBER } from './_mock'

const meta = {
  title: 'Components/Chrome/Header/TopBar',
  component: TopBar,
  args: {
    member: null,
    onOpen: fn(),
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', minHeight: '8rem', background: '#030303' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TopBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const menu = canvas.getByRole('button', { name: /open menu/i })
    await step('Logged-out visitors see the sign-in shortcut', async () => {
      await expect(
        canvas.getByRole('button', { name: /sign in with discord/i }),
      ).toBeInTheDocument()
    })
    await step('Clicking the trigger fires onOpen', async () => {
      await userEvent.click(menu)
      await expect(args.onOpen).toHaveBeenCalledTimes(1)
    })
  },
}

export const LoggedIn: Story = {
  args: { member: MOCK_MEMBER },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Members do not see the sign-in shortcut', async () => {
      await expect(
        canvas.queryByRole('button', { name: /sign in with discord/i }),
      ).toBeNull()
    })
  },
}
