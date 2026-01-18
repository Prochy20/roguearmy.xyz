import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import { UserAvatar } from '@/components/auth'
import { GlitchText } from '@/components/effects/GlitchText'

async function getMember() {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifyMemberToken(token)
  if (!session) return null

  const payload = await getPayload({ config })
  return payload.findByID({
    collection: 'members',
    id: session.memberId,
  })
}

export default async function ProfilePage() {
  const member = await getMember()

  if (!member) {
    return null // Layout handles auth
  }

  const guildMember = member.guildMember as {
    nickname?: string
    roles?: string[]
    joinedDiscordAt?: string
  } | null

  return (
    <div className="min-h-screen bg-void">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            <UserAvatar
              discordId={member.discordId}
              avatar={member.avatar ?? null}
              username={member.username}
              size="lg"
            />
            <div>
              <GlitchText className="text-2xl sm:text-3xl font-bold text-rga-green">
                {member.globalName || member.username}
              </GlitchText>
              <p className="text-rga-gray">@{member.username}</p>
            </div>
          </div>

          {/* Discord Info */}
          <div className="space-y-6">
            <div className="p-6 border border-rga-green/20 rounded-lg bg-void/50">
              <h3 className="text-rga-green font-bold text-lg mb-4">Discord Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-rga-gray/60 text-sm">Discord ID</dt>
                  <dd className="text-rga-gray font-mono">{member.discordId}</dd>
                </div>
                {member.email && (
                  <div>
                    <dt className="text-rga-gray/60 text-sm">Email</dt>
                    <dd className="text-rga-gray">{member.email}</dd>
                  </div>
                )}
                {guildMember?.nickname && (
                  <div>
                    <dt className="text-rga-gray/60 text-sm">Server Nickname</dt>
                    <dd className="text-rga-gray">{guildMember.nickname}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Guild Membership */}
            <div className="p-6 border border-rga-cyan/20 rounded-lg bg-void/50">
              <h3 className="text-rga-cyan font-bold text-lg mb-4">Guild Membership</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-rga-gray/60 text-sm">Joined Discord Server</dt>
                  <dd className="text-rga-gray">
                    {guildMember?.joinedDiscordAt
                      ? new Date(guildMember.joinedDiscordAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Unknown'}
                  </dd>
                </div>
                <div>
                  <dt className="text-rga-gray/60 text-sm">Joined This Site</dt>
                  <dd className="text-rga-gray">
                    {new Date(member.joinedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-rga-gray/60 text-sm">Status</dt>
                  <dd className="text-rga-green capitalize">{member.status}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
