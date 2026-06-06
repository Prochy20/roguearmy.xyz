import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { MembersLoginPage } from './MembersLoginPage'

const meta = {
  title: 'Components/Auth/MembersLoginPage',
  component: MembersLoginPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof MembersLoginPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Terminal window title reads MEMBERS PORTAL', async () => {
      // The title sits both in the visible terminal chrome and inside motion
      // wrappers that mirror it during the boot transition.
      await expect(canvas.getAllByText(/members portal/i).length).toBeGreaterThan(0)
    })
  },
}
