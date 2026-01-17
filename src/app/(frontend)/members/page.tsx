import { cookies } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import { UserAvatar, LogoutButton } from '@/components/auth'
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

export default async function MembersDashboard() {
  const member = await getMember()

  if (!member) {
    return null // Layout handles auth
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <header className="border-b border-rga-green/20 bg-void/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-rga-green font-bold text-xl">
            RGA
          </Link>
          <div className="flex items-center gap-4">
            <UserAvatar
              discordId={member.discordId}
              avatar={member.avatar ?? null}
              username={member.username}
              size="sm"
            />
            <span className="text-rga-gray hidden sm:inline">
              {member.globalName || member.username}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <GlitchText className="text-3xl sm:text-4xl font-bold text-rga-green mb-2">
            MEMBERS AREA
          </GlitchText>
          <p className="text-rga-gray">
            Welcome back, {member.globalName || member.username}!
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/members/profile"
            className="block p-6 border border-rga-green/20 rounded-lg bg-void/50 hover:border-rga-green/50 transition-colors"
          >
            <h3 className="text-rga-green font-bold text-lg mb-2">Profile</h3>
            <p className="text-rga-gray text-sm">
              View your member profile and Discord information.
            </p>
          </Link>

          <Link
            href="/members/resources"
            className="block p-6 border border-rga-cyan/20 rounded-lg bg-void/50 hover:border-rga-cyan/50 transition-colors"
          >
            <h3 className="text-rga-cyan font-bold text-lg mb-2">Resources</h3>
            <p className="text-rga-gray text-sm">
              Access member-only resources and guides.
            </p>
          </Link>

          <a
            href="https://discord.gg/roguearmy"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 border border-rga-magenta/20 rounded-lg bg-void/50 hover:border-rga-magenta/50 transition-colors"
          >
            <h3 className="text-rga-magenta font-bold text-lg mb-2">Discord</h3>
            <p className="text-rga-gray text-sm">
              Jump back to the Discord server.
            </p>
          </a>
        </div>

        {/* Member Stats */}
        <div className="mt-12 p-6 border border-rga-green/20 rounded-lg bg-void/50">
          <h3 className="text-rga-green font-bold text-lg mb-4">Your Stats</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-rga-gray/60 text-sm">Member Since</p>
              <p className="text-rga-gray">
                {new Date(member.joinedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-rga-gray/60 text-sm">Last Login</p>
              <p className="text-rga-gray">
                {new Date(member.lastLogin).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
