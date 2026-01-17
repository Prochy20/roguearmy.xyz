'use client'

import type { DefaultCellComponentProps } from 'payload'
import Link from 'next/link'

export const DiscordAvatarCell: React.FC<DefaultCellComponentProps> = ({ rowData }) => {
  const id = rowData?.id as string | undefined
  const discordId = rowData?.discordId as string | undefined
  const avatar = rowData?.avatar as string | undefined
  const username = rowData?.username as string | undefined

  if (!discordId) {
    return <span>—</span>
  }

  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png?size=32`
    : `https://cdn.discordapp.com/embed/avatars/${Number(discordId) % 5}.png`

  return (
    <Link href={`/admin/collections/members/${id}`}>
      <img
        src={avatarUrl}
        alt={username || 'Avatar'}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
    </Link>
  )
}

export const UsernameCell: React.FC<DefaultCellComponentProps> = ({ rowData, cellData }) => {
  const id = rowData?.id as string | undefined
  const username = cellData as string | undefined

  return (
    <Link
      href={`/admin/collections/members/${id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {username || '—'}
    </Link>
  )
}
