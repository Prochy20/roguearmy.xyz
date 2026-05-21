import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { MenuProvider } from '@/components/shared/header/MenuContext'
import { BlogNavMenuTrigger } from './BlogNavMenuTrigger'

const meta = {
  title: 'Components/Blog/BlogNavMenuTrigger',
  component: BlogNavMenuTrigger,
  decorators: [
    (Story) => (
      <MenuProvider>
        <Story />
      </MenuProvider>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BlogNavMenuTrigger>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Trigger has the "Open site menu" aria-label', async () => {
      await expect(canvas.getByRole('button', { name: /open site menu/i })).toBeInTheDocument()
    })
  },
}
