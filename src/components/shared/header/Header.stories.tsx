import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { MenuProvider } from './MenuContext'
import { Header } from './Header'
import { MOCK_MEMBER, MOCK_ROLE_GATES } from './_mock'

interface HeaderHostProps {
  member: typeof MOCK_MEMBER | null
  roleGates: typeof MOCK_ROLE_GATES
}

/**
 * Header has two non-trivial dependencies — AuthProvider (which fetches
 * /api/auth/me unless seeded with `initialState`) and MenuProvider. We
 * seed both so the story renders without backend access.
 */
function HeaderHost({ member, roleGates }: HeaderHostProps) {
  return (
    <AuthProvider
      initialState={{
        isAuthenticated: member !== null,
        member,
        roleGates,
      }}
    >
      <MenuProvider>
        <Header />
        <div style={{ paddingTop: '8rem', textAlign: 'center', color: '#888' }}>
          (page content sits below the fixed header)
        </div>
      </MenuProvider>
    </AuthProvider>
  )
}

const meta = {
  title: 'Components/Shared/Header/Header',
  component: HeaderHost,
  args: {
    member: MOCK_MEMBER,
    roleGates: MOCK_ROLE_GATES,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/' },
    },
  },
} satisfies Meta<typeof HeaderHost>

export default meta
type Story = StoryObj<typeof meta>

export const LoggedIn: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Menu trigger renders', async () => {
      await expect(canvas.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
    })
  },
}

export const Anonymous: Story = {
  args: { member: null, roleGates: {} },
}
