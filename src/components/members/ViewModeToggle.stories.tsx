import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import type { ViewMode } from '@/hooks/useViewMode'
import { ViewModeToggle } from './ViewModeToggle'

interface DemoProps {
  initial: ViewMode
  disableFeatured: boolean
  onViewModeChange: (mode: ViewMode) => void
}

function ViewModeToggleDemo({ initial, disableFeatured, onViewModeChange }: DemoProps) {
  const [mode, setMode] = useState<ViewMode>(initial)
  return (
    <ViewModeToggle
      viewMode={mode}
      disableFeatured={disableFeatured}
      onViewModeChange={(next) => {
        setMode(next)
        onViewModeChange(next)
      }}
    />
  )
}

const meta = {
  title: 'Components/Members/ViewModeToggle',
  component: ViewModeToggleDemo,
  argTypes: {
    initial: { control: 'inline-radio', options: ['featured', 'grid', 'list'] },
    disableFeatured: { control: 'boolean' },
  },
  args: {
    initial: 'grid',
    disableFeatured: false,
    onViewModeChange: fn(),
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ViewModeToggleDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Clicking "List view" fires onViewModeChange("list")', async () => {
      await userEvent.click(canvas.getByRole('radio', { name: /list view/i }))
      await expect(args.onViewModeChange).toHaveBeenCalledWith('list')
    })
  },
}

export const FeaturedDisabled: Story = {
  args: { disableFeatured: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Featured button is disabled when filters are active', async () => {
      await expect(canvas.getByRole('radio', { name: /featured view/i })).toBeDisabled()
    })
  },
}
