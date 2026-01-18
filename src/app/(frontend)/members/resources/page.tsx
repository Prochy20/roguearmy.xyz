import { GlitchText } from '@/components/effects/GlitchText'

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-void">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <GlitchText className="text-3xl sm:text-4xl font-bold text-rga-cyan mb-2">
            RESOURCES
          </GlitchText>
          <p className="text-rga-gray">
            Member-only resources and guides.
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 border border-rga-cyan/20 rounded-lg bg-void/50">
            <h3 className="text-rga-cyan font-bold text-lg mb-2">Getting Started</h3>
            <p className="text-rga-gray text-sm mb-4">
              New to the community? Start here for an overview of how things work.
            </p>
            <span className="text-rga-gray/40 text-sm italic">Coming soon...</span>
          </div>

          <div className="p-6 border border-rga-cyan/20 rounded-lg bg-void/50">
            <h3 className="text-rga-cyan font-bold text-lg mb-2">Game Guides</h3>
            <p className="text-rga-gray text-sm mb-4">
              Tips, builds, and strategies for the games we play.
            </p>
            <span className="text-rga-gray/40 text-sm italic">Coming soon...</span>
          </div>

          <div className="p-6 border border-rga-cyan/20 rounded-lg bg-void/50">
            <h3 className="text-rga-cyan font-bold text-lg mb-2">Event Calendar</h3>
            <p className="text-rga-gray text-sm mb-4">
              Upcoming community events and game nights.
            </p>
            <span className="text-rga-gray/40 text-sm italic">Coming soon...</span>
          </div>

          <div className="p-6 border border-rga-cyan/20 rounded-lg bg-void/50">
            <h3 className="text-rga-cyan font-bold text-lg mb-2">Archives</h3>
            <p className="text-rga-gray text-sm mb-4">
              Past events, highlights, and community history.
            </p>
            <span className="text-rga-gray/40 text-sm italic">Coming soon...</span>
          </div>
        </div>
      </main>
    </div>
  )
}
