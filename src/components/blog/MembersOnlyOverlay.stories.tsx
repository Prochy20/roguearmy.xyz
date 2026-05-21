import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { MembersOnlyOverlay } from './MembersOnlyOverlay'

const meta = {
  title: 'Components/Blog/MembersOnlyOverlay',
  component: MembersOnlyOverlay,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  args: { size: 'lg' },
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 320, height: 200, background: '#222' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MembersOnlyOverlay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Lock-icon trigger renders inside the overlay', async () => {
      // Lucide icons render as <svg> with a `lucide-lock` class but no role,
      // so we query by class rather than by accessibility role.
      const lock = canvasElement.querySelector('svg.lucide-lock')
      await expect(lock).toBeTruthy()
    })
  },
}

export const Small: Story = { args: { size: 'sm' } }
export const Medium: Story = { args: { size: 'md' } }
