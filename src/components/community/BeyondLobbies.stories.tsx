import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BeyondLobbies } from './BeyondLobbies'
import { MOCK_BEYOND_LOBBIES } from './_mock'

const meta = {
  title: 'Components/Community/BeyondLobbies',
  component: BeyondLobbies,
  args: { content: MOCK_BEYOND_LOBBIES },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BeyondLobbies>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Both column headers render', async () => {
      await expect(canvas.getByText(/^\/\/ ELSEWHERE$/)).toBeInTheDocument()
      await expect(canvas.getByText(/^\/\/ ROGUE ARMY$/)).toBeInTheDocument()
    })
  },
}
