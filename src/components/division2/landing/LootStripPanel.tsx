import { LootIcon } from '@/components/division2/escalation/LootIcon'
import { SpecimenFrame } from '@/components/division2/escalation/SpecimenFrame'
import { PanelHeader } from '@/components/division2/landing/PanelHeader'
import { formatDayWithWeekday } from '@/lib/division2/format'
import type {
  EscalationLootItem,
  EscalationMission,
  EscalationPrototypeCache,
  EscalationLootTypeRef,
} from '@/lib/division2/escalation.server'

interface LootStripPanelProps {
  missions: EscalationMission[]
  items: EscalationLootItem[]
  caches: EscalationPrototypeCache | null
  targetDay: string
}

interface SlotDescriptor {
  key: string
  loot: EscalationLootItem | EscalationLootTypeRef | null
}

/**
 * Today's escalation at a glance — a single horizontal row of loot icons.
 * Mission-targeted drops and vendor prototype caches are concatenated and
 * shuffled into one undifferentiated strip; each SpecimenFrame carries its
 * own corner brackets, so no outer panel chrome is needed. The caption
 * underneath each slot shows the loot name itself.
 *
 * The row sizes its slots evenly via `flex-1` so it adapts to any mission
 * count (typically 4–6) without hardcoded column math.
 */
export function LootStripPanel({
  missions,
  items,
  caches,
  targetDay,
}: LootStripPanelProps) {
  const byPosition = new Map<number, EscalationLootItem>()
  for (const it of items) byPosition.set(it.position, it)

  const slots: SlotDescriptor[] = shuffle<SlotDescriptor>([
    ...missions.map((m) => ({
      key: `mission-${m.position}-${m.slug}`,
      loot: byPosition.get(m.position) ?? null,
    })),
    {
      key: 'vendor-gear',
      loot: caches?.gear ?? null,
    },
    {
      key: 'vendor-wpn',
      loot: caches?.weapon ?? null,
    },
  ])

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <h2
          className="font-display uppercase leading-[0.9] tracking-[0.005em] text-balance"
          style={{ fontSize: 'clamp(32px, 5vw, 72px)' }}
        >
          <span className="text-text-primary">ACTIVE </span>
          <span
            className="text-rga-mod"
            style={{
              textShadow:
                '0 0 24px rgba(255,128,0,0.32), 0 0 56px rgba(255,128,0,0.14)',
            }}
          >
            ESCALATION
          </span>
        </h2>
        <PanelHeader
          code="SEC_02"
          label="// TODAY · DROPS + VENDOR"
          meta={formatDayWithWeekday(targetDay)}
          cta={{ href: '/division-2/escalation', label: 'OPEN ESCALATION →' }}
          accent="mod"
        />
      </div>

      <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
        {slots.map((slot) => (
          <SymbolSlot key={slot.key} loot={slot.loot} />
        ))}
      </div>
    </section>
  )
}

/**
 * One icon slot: SpecimenFrame holding a single LootIcon, with the loot
 * name as a mono-uppercase caption beneath. The frame itself carries the
 * corner-bracket chrome, so the strip needs no outer panel wrapper.
 */
function SymbolSlot({
  loot,
}: {
  loot: EscalationLootItem | EscalationLootTypeRef | null
}) {
  const name = loot?.name ?? 'PENDING UPSTREAM'
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2" title={name}>
      <SpecimenFrame color="mod" pending={!loot} padPx={10}>
        {loot && <LootIcon slug={loot.slug} name={loot.name} size={56} />}
      </SpecimenFrame>
      <span className="line-clamp-2 break-words text-center font-mono text-[10px] uppercase leading-snug tracking-[0.18em] text-rga-mod/85">
        {name}
      </span>
    </div>
  )
}

/**
 * Fisher-Yates shuffle. Server-side, fresh per request — paired with the
 * page's `force-dynamic` cache opt-out, every visit sees a new arrangement
 * so the eye can't memorize positions. Returns a new array; input untouched.
 */
function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

