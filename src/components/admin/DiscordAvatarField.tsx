'use client'

import { useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

export const DiscordAvatarField: TextFieldClientComponent = () => {
  const discordId = useFormFields(([fields]) => fields.discordId?.value as string | undefined)
  const avatar = useFormFields(([fields]) => fields.avatar?.value as string | undefined)
  const username = useFormFields(([fields]) => fields.username?.value as string | undefined)

  if (!discordId) {
    return null
  }

  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${Number(discordId) % 5}.png`

  const fullAvatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png?size=4096`
    : `https://cdn.discordapp.com/embed/avatars/${Number(discordId) % 5}.png`

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        Discord Avatar
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={username || 'Avatar'}
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--theme-elevation-150)',
          }}
        />
        <a
          href={fullAvatarUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            backgroundColor: 'var(--theme-elevation-100)',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: '4px',
            color: 'inherit',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          View Full Size
        </a>
      </div>
    </div>
  )
}
