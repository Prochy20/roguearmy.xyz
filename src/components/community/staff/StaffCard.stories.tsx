import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StaffCard } from './StaffCard'
import {
  MOCK_STAFF_ADMIN,
  MOCK_STAFF_CYAN,
  MOCK_STAFF_DEV,
  MOCK_STAFF_GREEN,
  MOCK_STAFF_MAGENTA,
  MOCK_STAFF_MOD,
  MOCK_STAFF_ROSTER,
} from './_mock'

const meta = {
  title: 'Components/Community/Staff/StaffCard',
  component: StaffCard,
  args: {
    profile: MOCK_STAFF_CYAN,
    index: 0,
    showMemberSurface: false,
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StaffCard>

export default meta
type Story = StoryObj<typeof meta>

export const Public: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Display name + role title render', async () => {
      await expect(canvas.getByText(args.profile.cached_displayName)).toBeInTheDocument()
      // Component prefixes the role with "// " — match by substring.
      await expect(
        canvas.getByText(new RegExp(args.profile.roleTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))),
      ).toBeInTheDocument()
    })
  },
}

export const MemberSurface: Story = {
  args: { showMemberSurface: true, profile: MOCK_STAFF_GREEN },
}

export const Gallery: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
      {[MOCK_STAFF_GREEN, MOCK_STAFF_CYAN, MOCK_STAFF_MAGENTA, MOCK_STAFF_DEV, MOCK_STAFF_ADMIN, MOCK_STAFF_MOD].map(
        (profile, i) => (
          <StaffCard key={profile.discordId} profile={profile} index={i} showMemberSurface={false} />
        ),
      )}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All 6 accents render their cards', async () => {
      for (const profile of MOCK_STAFF_ROSTER) {
        await expect(canvas.getByText(profile.cached_displayName)).toBeInTheDocument()
      }
    })
  },
}
