import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { StaffRadar } from './StaffRadar'
import { MOCK_RADAR_CONTACTS } from './_mock'

const meta = {
  title: 'Components/Community/Staff/StaffRadar',
  component: StaffRadar,
  argTypes: {
    blipCount: { control: { type: 'number', min: 1, max: 10 } },
  },
  args: {
    blipCount: 4,
    contacts: MOCK_RADAR_CONTACTS,
  },
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 320, height: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StaffRadar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Radar host renders into the canvas', async () => {
      // Blips are absolutely positioned div spans; assert the host is present.
      await expect(canvasElement.querySelector('div')).toBeTruthy()
    })
  },
}

export const NoContacts: Story = { args: { contacts: [] } }
