import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'
import { NavCenteredStack } from './NavCenteredStack'
import { MOCK_ROLE_GATES, MOCK_ROLE_GATES_DENIED } from './_mock'

const meta = {
  title: 'Components/Shared/Header/NavCenteredStack',
  component: NavCenteredStack,
  args: {
    onNavigate: fn(),
    isLoggedIn: true,
    roleGates: MOCK_ROLE_GATES,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof NavCenteredStack>

export default meta
type Story = StoryObj<typeof meta>

export const Authenticated: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders at least one nav row', async () => {
      await expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(0)
    })
  },
}

export const Anonymous: Story = {
  args: { isLoggedIn: false, roleGates: {} },
}

export const RoleDenied: Story = {
  args: { isLoggedIn: true, roleGates: MOCK_ROLE_GATES_DENIED },
}
