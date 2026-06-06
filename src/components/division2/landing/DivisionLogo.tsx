import { cn } from '@/lib/utils'

interface DivisionLogoProps {
  className?: string
}

export function DivisionLogo({ className }: DivisionLogoProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none relative hidden aspect-square w-[440px] opacity-15 lg:block xl:w-[560px] 2xl:w-[680px]',
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/division2/img/logo/division_logo.webp')",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 58% 58% at 50% 50%, ' +
              'transparent 0%, transparent 42%, ' +
              'rgba(0,0,0,0.35) 68%, rgba(0,0,0,0.75) 86%, ' +
              'rgba(0,0,0,0.94) 95%, #000 100%)',
        }}
      />
    </div>
  )
}
