import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { DivisionLogo } from './DivisionLogo'

const meta = {
  title: 'Components/Division2/Landing/DivisionLogo',
  component: DivisionLogo,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 680,
          height: 680,
          background: '#000',
          position: 'relative',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DivisionLogo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Renders the decorative host (aria-hidden, no a11y surface)', async () => {
      // No semantic text or roles — assert the host is present and marked
      // as decorative, matching how StaffRadar's story handles purely
      // visual components.
      const host = canvasElement.querySelector('[aria-hidden="true"]')
      await expect(host).toBeTruthy()
    })
  },
}
