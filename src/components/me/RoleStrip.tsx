import { CyberTag } from '@/components/ui/CyberCorners'
import { FailRow } from '@/components/ui/FailRow'
import type { AshleyResult } from '@/lib/api/server'

export type AshleyMe = {
  user: {
    discordId: string
    avatarUrls: { '64': string; '128': string; '256': string; '512': string } | null
    serverAvatarUrls: { '64': string; '128': string; '256': string; '512': string } | null
    discordRoles: Array<{ id: string; name: string; color: string | null; managed: boolean }>
    joinedAt: string | null
  }
}

interface RoleStripProps {
  ashleyMe: AshleyResult<AshleyMe>
}

export function RoleStrip({ ashleyMe }: RoleStripProps) {
  if (!ashleyMe.ok) {
    return <FailRow code={ashleyMe.error.code} status={ashleyMe.error.status} returnTo="/me" />
  }

  const roles = ashleyMe.data.user.discordRoles
    .filter((r) => r.name !== '@everyone')
    .slice(0, 24)

  if (roles.length === 0) {
    return (
      <div className="font-mono text-[12px] tracking-[0.25em] text-text-muted">
        // NO ASSIGNMENTS ON RECORD
      </div>
    )
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {roles.map((role) => (
        <li key={role.id}>
          <CyberTag color={pickRoleAccent(role.color)}>
            <span className="flex items-center gap-2">
              <span>{role.name}</span>
              {role.managed && (
                <span className="text-[9px] tracking-[0.3em] opacity-60">SYS</span>
              )}
            </span>
          </CyberTag>
        </li>
      ))}
    </ul>
  )
}

type CyberTagColor = 'green' | 'cyan' | 'magenta' | 'orange' | 'red' | 'gray'

// Map an arbitrary Discord role color to one of CyberTag's six accent buckets,
// so role chips stay in voice (gradient + brackets + glow) while still hinting
// at the role's identity. Roles without a color or near-grey collapse to gray.
function pickRoleAccent(hex: string | null): CyberTagColor {
  if (!hex || hex === '#000000') return 'green'
  const m = hex.replace('#', '')
  if (m.length !== 6) return 'green'
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  if (Math.max(r, g, b) - Math.min(r, g, b) < 30) return 'gray'
  if (g > r && g > b) return 'green'
  if (b > r && b > g) return 'cyan'
  if (r >= g && r >= b && b > g) return 'magenta'
  if (r >= g && r >= b && g >= b) return r > 200 && g < 120 ? 'red' : 'orange'
  return 'green'
}
