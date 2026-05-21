import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'

interface DropdownDemoProps {
  onSelect: (value: string) => void
}

function DropdownDemo({ onSelect }: DropdownDemoProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onSelect('profile')}>Profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('settings')}>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onSelect('logout')}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const meta = {
  title: 'Components/UI/DropdownMenu',
  component: DropdownDemo,
  args: { onSelect: fn() },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DropdownDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /open menu/i })

    await step('Click trigger opens menu', async () => {
      await userEvent.click(trigger)
      const profile = await within(document.body).findByText('Profile')
      await expect(profile).toBeInTheDocument()
    })

    await step('Selecting Profile fires onSelect("profile")', async () => {
      const profile = within(document.body).getByText('Profile')
      await userEvent.click(profile)
      await expect(args.onSelect).toHaveBeenCalledWith('profile')
    })
  },
}

function CheckboxDemo() {
  const [bookmarks, setBookmarks] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Preferences</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
          Show bookmarks
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={fullscreen} onCheckedChange={setFullscreen}>
          Fullscreen
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const WithCheckboxes: Story = {
  render: () => <CheckboxDemo />,
}

function RadioDemo() {
  const [theme, setTheme] = useState('void')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Theme: {theme}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Background</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="void">Void</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="primary">Primary</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="elevated">Elevated</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const WithRadioGroup: Story = {
  render: () => <RadioDemo />,
}
