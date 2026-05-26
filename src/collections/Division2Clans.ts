import type { CollectionConfig, FieldAccess } from 'payload'
import { APIError } from 'payload'
import type { AvatarBundle } from '@/lib/discord/avatar'

/**
 * Members-only field gate. The page surface hides leader info from anonymous
 * visitors via `isAuthenticated` filtering, but the REST/GraphQL API would
 * still expose these fields without this guard. Belt-and-suspenders so a
 * direct hit on `/api/division2-clans` matches the page's contract.
 */
const memberOnly: FieldAccess = ({ req }) => Boolean(req.user)

/**
 * Refresh leader cache fields from Ashley. Mirrors StaffProfiles —
 * dynamic imports keep `server-only` modules out of the importmap pass.
 */
type RefreshOutcome =
  | { kind: 'ok' }
  | { kind: 'ashley_down' }
  | { kind: 'member_not_found' }

async function refreshLeaderCacheFromAshley(
  data: Record<string, unknown>,
  discordId: string,
): Promise<RefreshOutcome> {
  const [{ fetchAshleyService }, { pickBestAvatar }] = await Promise.all([
    import('@/lib/api/server'),
    import('@/lib/discord/avatar'),
  ])
  const result = await fetchAshleyService((client) =>
    client.GET('/api/community/members/lookup', {
      params: { query: { ids: discordId } },
    }),
  )
  if (!result.ok) return { kind: 'ashley_down' }
  const member = result.data?.[0]
  if (!member) return { kind: 'member_not_found' }

  data.cached_leaderUsername = (member.username ?? null) as string | null
  data.cached_leaderDisplayName = member.displayName
  data.cached_leaderAvatarUrl = pickBestAvatar(
    member.serverAvatarUrls as AvatarBundle,
    member.avatarUrls as AvatarBundle,
  )
  data.cached_leaderAt = new Date().toISOString()
  return { kind: 'ok' }
}

/**
 * In-game Division 2 clans listed on `/division-2/clans`. Each row pairs the
 * public clan identity (name, tag, banner, accent) with a single optional
 * Discord-linked clan leader that's shown only to signed-in members.
 *
 * The leader cache fields are hydrated via the StaffDiscordPicker + a
 * beforeChange Ashley sync, identical in shape to StaffProfiles so the lazy
 * TTL refresh on `/division-2/clans` can stay symmetric.
 */
export const Division2Clans: CollectionConfig = {
  slug: 'division2-clans',
  labels: {
    singular: 'Clan',
    plural: 'Clans',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Division 2',
    description:
      'In-game clans shown on /division-2/clans. Order ascending. Banner image and accent color carry each clan’s identity; the optional leader is members-only.',
    defaultColumns: ['order', 'name', 'tag', 'accent', 'isPublished'],
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc }) => {
        const newId = (data?.leaderDiscordId as string | undefined)?.trim()
        if (!newId) {
          // No leader assigned (or cleared) — wipe the cache fields so the
          // card doesn't show a stale name/avatar.
          if (originalDoc?.leaderDiscordId) {
            data.cached_leaderUsername = null
            data.cached_leaderDisplayName = null
            data.cached_leaderAvatarUrl = null
            data.cached_leaderAt = null
          }
          return data
        }

        const idChanged =
          operation === 'create' || originalDoc?.leaderDiscordId !== newId

        const outcome = await refreshLeaderCacheFromAshley(data, newId)
        if (outcome.kind === 'ok') return data

        if (idChanged) {
          if (outcome.kind === 'member_not_found') {
            throw new APIError(
              `No Discord member found for ID ${newId}. Pick a different leader or check Ashley.`,
              400,
            )
          }
          throw new APIError(
            'Could not verify leader against Ashley (upstream unreachable). Try again in a moment.',
            503,
          )
        }

        console.warn(
          `Division2Clans leader refresh skipped for ${newId}: ${outcome.kind}. Cached fields left as-is; lazy TTL will retry on next render.`,
        )
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Full clan name as displayed in Discord (e.g., Rogue Army SDC).' },
    },
    {
      name: 'tag',
      type: 'text',
      required: true,
      maxLength: 8,
      admin: {
        description: 'Short clan tag (e.g., RGA, SDC, RGS). Up to 8 characters.',
      },
    },
    {
      name: 'banner',
      type: 'text',
      required: true,
      admin: {
        description:
          'Path to the clan banner emblem. Drop the PNG into /public/division2/img/clans/ and reference it here, e.g. /division2/img/clans/rga.png. Target aspect ratio ~4:7 vertical (Discord pennant), ~600px wide minimum, transparent background recommended. Local files only — keeps emblems versioned with the code instead of going through Vercel Blob.',
      },
    },
    {
      name: 'accent',
      type: 'select',
      required: true,
      defaultValue: 'green',
      options: [
        { label: 'Green (RGA)', value: 'green' },
        { label: 'Amber (SDC)', value: 'amber' },
        { label: 'Azure (RGS)', value: 'azure' },
        { label: 'Cyan', value: 'cyan' },
        { label: 'Magenta', value: 'magenta' },
      ],
      admin: {
        description:
          'Card accent color — drives the left rail, banner halo, and tag chip tint. Pick the value that matches the clan’s Discord banner.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      admin: {
        description:
          'Display sort, ascending. Lower numbers appear first. Leave gaps (10, 20, 30…) so reordering is cheap.',
        step: 10,
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Uncheck to hide from /division-2/clans without deleting the row.',
      },
    },
    {
      name: 'leaderDiscordId',
      type: 'text',
      access: { read: memberOnly },
      admin: {
        description:
          'Optional clan leader. Search Discord members by name and pick one. Display name and avatar are hydrated from Ashley on save and refreshed lazily on page render. Leader info is shown only to signed-in members.',
        components: {
          Field: '@/components/admin/StaffDiscordPicker',
        },
      },
    },
    {
      type: 'collapsible',
      label: 'Discord Sync (read-only)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'cached_leaderUsername',
          type: 'text',
          access: { read: memberOnly },
          admin: {
            readOnly: true,
            description:
              'Latest known Discord username (the @handle) for the leader. Refreshed lazily on page render past TTL.',
          },
        },
        {
          name: 'cached_leaderDisplayName',
          type: 'text',
          access: { read: memberOnly },
          admin: {
            readOnly: true,
            description: 'Latest known display name from Discord for the leader.',
          },
        },
        {
          name: 'cached_leaderAvatarUrl',
          type: 'text',
          access: { read: memberOnly },
          admin: {
            readOnly: true,
            description: 'Latest known Discord avatar URL for the leader.',
          },
        },
        {
          name: 'cached_leaderAt',
          type: 'date',
          access: { read: memberOnly },
          admin: {
            readOnly: true,
            description: 'When the cached leader fields were last refreshed from Ashley.',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
      ],
    },
  ],
}
