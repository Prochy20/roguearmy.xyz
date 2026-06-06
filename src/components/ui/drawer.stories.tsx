import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Button } from './button'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from './drawer'

interface DrawerDemoProps {
  side: 'left' | 'right'
  accent: 'green' | 'cyan'
  onOpenChange: (open: boolean) => void
}

function DrawerDemo({ side, accent, onOpenChange }: DrawerDemoProps) {
  const [open, setOpen] = useState(false)
  const handleChange = (next: boolean) => {
    setOpen(next)
    onOpenChange(next)
  }
  return (
    <div>
      <Button onClick={() => handleChange(true)}>Open drawer</Button>
      <Drawer open={open} onOpenChange={handleChange} side={side} accent={accent}>
        <DrawerHeader onClose={() => handleChange(false)} accent={accent}>
          Drawer header
        </DrawerHeader>
        <DrawerContent>
          <p className="text-text-secondary text-sm">
            Drawer body content. Press <kbd>Esc</kbd> or click the backdrop to dismiss.
          </p>
        </DrawerContent>
        <DrawerFooter>
          <Button variant="ghost" onClick={() => handleChange(false)}>Cancel</Button>
          <Button onClick={() => handleChange(false)}>Confirm</Button>
        </DrawerFooter>
      </Drawer>
    </div>
  )
}

const meta = {
  title: 'Components/UI/Drawer',
  component: DrawerDemo,
  argTypes: {
    side: { control: 'inline-radio', options: ['left', 'right'] },
    accent: { control: 'inline-radio', options: ['green', 'cyan'] },
  },
  args: {
    side: 'right',
    accent: 'green',
    onOpenChange: fn(),
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DrawerDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const opener = canvas.getByRole('button', { name: /open drawer/i })

    await step('Click trigger opens drawer (fires onOpenChange)', async () => {
      await userEvent.click(opener)
      await expect(args.onOpenChange).toHaveBeenCalledWith(true)
    })

    await step('Drawer header is rendered in portal', async () => {
      const header = await within(document.body).findByText('Drawer header')
      await expect(header).toBeInTheDocument()
    })
  },
}

export const LeftSide: Story = {
  args: { side: 'left' },
}

export const CyanAccent: Story = {
  args: { accent: 'cyan' },
}
