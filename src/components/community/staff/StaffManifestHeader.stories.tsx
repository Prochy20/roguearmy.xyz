import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StaffManifestHeader } from './StaffManifestHeader'
import { MOCK_LAST_SYNC, MOCK_RADAR_CONTACTS } from './_mock'

const meta = {
  title: 'Components/Community/Staff/StaffManifestHeader',
  component: StaffManifestHeader,
  args: {
    content: undefined,
    rosterCount: 12,
    rosterContacts: MOCK_RADAR_CONTACTS,
    lastSyncedAt: MOCK_LAST_SYNC,
    showMemberSurface: false,
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof StaffManifestHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Manifest header announces at least one stat field', async () => {
      // StatRibbon renders multiple values — at least one numeric or label appears.
      await expect(canvas.queryAllByText(/\/\//).length).toBeGreaterThan(0)
    })
  },
}

export const MemberSurface: Story = { args: { showMemberSurface: true } }
export const NoContacts: Story = { args: { rosterContacts: [] } }
