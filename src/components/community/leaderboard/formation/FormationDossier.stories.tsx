import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { FormationDossier } from './FormationDossier'

const meta = {
  title: 'Components/Community/Leaderboard/Formation/FormationDossier',
  component: FormationDossier,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FormationDossier>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Starts collapsed (aria-expanded=false)', async () => {
      const btn = canvas.getByRole('button')
      await expect(btn).toHaveAttribute('aria-expanded', 'false')
    })
    await step('Clicking the toggle expands the dossier', async () => {
      const btn = canvas.getByRole('button')
      await userEvent.click(btn)
      await expect(btn).toHaveAttribute('aria-expanded', 'true')
      // Body content is now visible
      await expect(canvas.getByText(/what is a point/i)).toBeInTheDocument()
    })
  },
}
