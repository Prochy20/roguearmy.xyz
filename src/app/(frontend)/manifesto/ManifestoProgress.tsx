'use client'

interface ManifestoProgressProps {
  progress: number
}

export function ManifestoProgress({ progress }: ManifestoProgressProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 h-0.5 bg-transparent z-40 pointer-events-none"
      aria-hidden="true"
    >
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg, #00FF41, #00FFFF, #FF00FF)',
          boxShadow: '0 0 10px #00FF41',
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  )
}
