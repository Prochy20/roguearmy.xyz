import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { EmptyDossier } from './EmptyDossier'

const ALL_KINDS = [
  'ROLE_REQUIRED',
  'FEATURE_PENDING',
  'AWAITING_FIRST_SYNC',
  'NO_RECORD',
  'BOOSTER_REQUIRED',
  'NO_DIGEST_FOR_WEEK',
] as const

const meta = {
  title: 'Components/Division2/EmptyDossier',
  component: EmptyDossier,
  argTypes: {
    kind: { control: 'select', options: ALL_KINDS },
    weekStart: { control: 'text' },
  },
  args: {
    kind: 'ROLE_REQUIRED',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EmptyDossier>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders the OPERATIVE TIER LOCKED heading for ROLE_REQUIRED', async () => {
      await expect(canvas.getByText(/operative tier locked/i)).toBeInTheDocument()
    })
  },
}

export const FeaturePending: Story = { args: { kind: 'FEATURE_PENDING' } }
export const AwaitingFirstSync: Story = { args: { kind: 'AWAITING_FIRST_SYNC' } }
export const NoRecord: Story = { args: { kind: 'NO_RECORD', weekStart: '2026-05-19' } }
export const BoosterRequired: Story = { args: { kind: 'BOOSTER_REQUIRED' } }
export const NoDigestForWeek: Story = { args: { kind: 'NO_DIGEST_FOR_WEEK', weekStart: '2026-05-19' } }
