import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'
import { BootOverlay } from './BootOverlay'

const meta = {
  title: 'Components/Community/Leaderboard/Formation/BootOverlay',
  component: BootOverlay,
  argTypes: {
    durationMs: { control: { type: 'number', min: 400, step: 100 } },
    cohortSize: { control: { type: 'number', min: 0 } },
  },
  args: {
    operativeName: 'axis',
    cohortSize: 412,
    durationMs: 1200,
    onComplete: fn(),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BootOverlay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ step }) => {
    const body = within(document.body)
    await step('Header chip renders inside the dialog', async () => {
      await expect(body.getByRole('dialog', { name: /initializing formation hud/i })).toBeInTheDocument()
      await expect(body.getByText(/rga · tactical hud · v2\.0/i)).toBeInTheDocument()
    })
  },
}

export const Anonymous: Story = {
  args: { operativeName: null, cohortSize: null },
}

export const FastBoot: Story = { args: { durationMs: 400 } }
