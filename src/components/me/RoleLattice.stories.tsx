import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import type { DiscordRole } from '@/payload-types'
import { RoleLattice } from './RoleLattice'

function baseRole(overrides: Partial<DiscordRole> & { name: string; position: number }): DiscordRole {
  return {
    id: `cms-${overrides.discordId ?? overrides.name.toLowerCase().replace(/\s+/g, '-')}`,
    discordId: overrides.discordId ?? `discord-${overrides.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: overrides.name,
    color: overrides.color ?? null,
    position: overrides.position,
    mentionable: overrides.mentionable ?? false,
    managed: overrides.managed ?? false,
    iconUrls: null,
    unicodeEmoji: null,
    lastSyncedAt: '2026-06-06T00:00:00Z',
    isPrimary: overrides.isPrimary ?? false,
    badgeLabel: overrides.badgeLabel ?? null,
    accentOverride: overrides.accentOverride ?? null,
    updatedAt: '2026-06-06T00:00:00Z',
    createdAt: '2026-06-06T00:00:00Z',
  }
}

const mockupRoles: DiscordRole[] = [
  baseRole({ name: 'CAPTAIN',         position: 30, isPrimary: true,  color: '#00FF41', mentionable: true, unicodeEmoji: '⭐' }),
  baseRole({ name: 'RAID LEAD',       position: 26, isPrimary: true,  color: '#00FF41', mentionable: true }),
  baseRole({ name: 'DIVISION 2',      position: 22, isPrimary: true,  color: '#FF8000', unicodeEmoji: '🎯' }),
  baseRole({ name: 'HELLDIVERS 2',    position: 21, color: '#00FF41', unicodeEmoji: '🪖' }),
  baseRole({ name: 'VOICE REGULAR',   position: 15, color: '#00FF41' }),
  baseRole({ name: 'MOVIE NIGHT',     position: 12, color: '#FF00FF', mentionable: true, unicodeEmoji: '🎬' }),
  baseRole({ name: 'EARLY SUPPORTER', position: 10, color: '#00FF41', badgeLabel: 'banner' }),
  baseRole({ name: 'NIGHT OWL',       position:  8, color: null,      badgeLabel: 'level' }),
  baseRole({ name: 'SERVER BOOSTER',  position:  6, managed: true,    color: null }),
  baseRole({ name: 'VERIFIED',        position:  2, managed: true,    color: null }),
]

const meta = {
  title: 'Components/Me/RoleLattice',
  component: RoleLattice,
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof RoleLattice>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { roles: mockupRoles },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('PRIMARY roles render with PRIMARY badge', async () => {
      await expect(canvas.getByText('CAPTAIN')).toBeInTheDocument()
      await expect(canvas.getByText('RAID LEAD')).toBeInTheDocument()
      await expect(canvas.getByText('DIVISION 2')).toBeInTheDocument()
    })
    await step('Footer counts PRIMARY separately', async () => {
      await expect(canvas.getByText(/3 PRIMARY · DISPLAYED SEPARATELY/i)).toBeInTheDocument()
    })
    await step('Mentionable roles show @MENTION marker', async () => {
      await expect(canvas.getAllByText('@MENTION').length).toBeGreaterThan(0)
    })
  },
}

export const Empty: Story = {
  args: { roles: [] },
}

export const NoPrimary: Story = {
  args: { roles: mockupRoles.filter((r) => !r.isPrimary) },
}

export const Overflow: Story = {
  args: {
    roles: Array.from({ length: 35 }, (_, i) =>
      baseRole({ name: `ROLE ${i + 1}`, position: 100 - i, color: '#00FFFF' }),
    ),
  },
}
