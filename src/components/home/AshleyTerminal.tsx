"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useMotionValueEvent, useMotionTemplate, type MotionValue } from "motion/react"
import { HeroGlitch } from "@/components/effects/HeroGlitch"
import { Bot, Zap, AlertTriangle, Skull } from "lucide-react"
import { useState } from "react"

const SKILLS = [
  { label: "Raid Coordination", value: 95, color: "green" as const },
  { label: "Build Assistance", value: 88, color: "cyan" as const },
  { label: "Meme Generation", value: 100, color: "magenta" as const },
  { label: "Drama Prevention", value: 99, color: "green" as const },
]

const HACK_STEPS = [
  { text: "Scanning target...", status: "OK", color: "cyan" },
  { text: "Bypassing firewall...", status: "DONE", color: "cyan" },
  { text: "Injecting payload...", status: "OK", color: "cyan" },
  { text: "Decrypting credentials...", status: "DONE", color: "cyan" },
  { text: "Escalating privileges...", status: "ROOT", color: "magenta" },
  { text: "ACCESS GRANTED", status: null, color: "green", bold: true },
]

const colorClasses = {
  green: { bar: "bg-rga-green", glow: "shadow-[0_0_10px_rgba(0,255,65,0.5)]" },
  cyan: { bar: "bg-rga-cyan", glow: "shadow-[0_0_10px_rgba(0,255,255,0.5)]" },
  magenta: { bar: "bg-rga-magenta", glow: "shadow-[0_0_10px_rgba(255,0,255,0.5)]" },
}

/** Scroll-controlled skill progress bar */
function ScrollControlledSkill({
  label,
  progress,
  color,
}: {
  label: string
  progress: MotionValue<number>
  color: "green" | "cyan" | "magenta"
}) {
  const widthStr = useMotionTemplate`${progress}%`
  const [displayValue, setDisplayValue] = useState(0)
  useMotionValueEvent(progress, "change", (v) => setDisplayValue(Math.round(v)))

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className={`font-mono ${colorClasses[color].bar.replace('bg-', 'text-')}`}>
          {displayValue}%
        </span>
      </div>
      <div className="h-2 bg-bg-elevated rounded-full overflow-hidden border border-border">
        <motion.div
          className={`h-full ${colorClasses[color].bar} ${colorClasses[color].glow}`}
          style={{ width: widthStr }}
        />
      </div>
    </div>
  )
}

/** Compact mobile skills display - inline text with percentages */
function CompactSkillsDisplay({
  skillProgresses,
}: {
  skillProgresses: MotionValue<number>[]
}) {
  const [values, setValues] = useState([0, 0, 0, 0])

  // Subscribe to each skill progress
  useMotionValueEvent(skillProgresses[0], "change", (v) =>
    setValues((prev) => [Math.round(v), prev[1], prev[2], prev[3]])
  )
  useMotionValueEvent(skillProgresses[1], "change", (v) =>
    setValues((prev) => [prev[0], Math.round(v), prev[2], prev[3]])
  )
  useMotionValueEvent(skillProgresses[2], "change", (v) =>
    setValues((prev) => [prev[0], prev[1], Math.round(v), prev[3]])
  )
  useMotionValueEvent(skillProgresses[3], "change", (v) =>
    setValues((prev) => [prev[0], prev[1], prev[2], Math.round(v)])
  )

  const compactSkills = [
    { label: "Raids", value: values[0], color: "text-rga-green" },
    { label: "Builds", value: values[1], color: "text-rga-cyan" },
    { label: "Memes", value: values[2], color: "text-rga-magenta" },
    { label: "Drama", value: values[3], color: "text-rga-green" },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm font-mono">
      {compactSkills.map((skill, i) => (
        <span key={skill.label}>
          <span className="text-text-muted">{skill.label}:</span>{" "}
          <span className={skill.color}>{skill.value}%</span>
          {i < compactSkills.length - 1 && (
            <span className="text-text-muted ml-3">•</span>
          )}
        </span>
      ))}
    </div>
  )
}

const CODE_LINES = [
  'async function breach(target) {',
  '  const wall = await scan(target);',
  '  if (wall.vulnerable) {',
  '    await inject(payload);',
  '    return { status: "GRANTED" };',
  '  }',
  '}',
  '',
  'class ExploitKit {',
  '  constructor(vector) {',
  '    this.vector = vector;',
  '    this.active = true;',
  '  }',
  '',
  '  async execute() {',
  '    const conn = this.connect();',
  '    await conn.elevate("root");',
  '    return conn.shell;',
  '  }',
  '}',
  '',
  '// INTRUSION SEQUENCE',
  'await bypass.firewall();',
  'exploit.run("CVE-2024-1337");',
  'credentials.dump();',
  'shell.spawn("/bin/bash");',
  '',
  'const rootkit = {',
  '  install: () => syscall(0x80),',
  '  hide: (pid) => mask(pid),',
  '  persist: () => cron.add()',
  '};',
  '',
  'try {',
  '  await payload.deliver(target);',
  '  await shell.reverse(IP);',
  '} catch (e) {',
  '  fallback.activate();',
  '}',
  '',
  'function scanPorts(host) {',
  '  const open = [];',
  '  for (let p of PORTS) {',
  '    if (probe(host, p)) {',
  '      open.push(p);',
  '    }',
  '  }',
  '  return open;',
  '}',
]

/** Background code - simple typewriter from top to bottom, no scroll */
function BackgroundCode({ ashleyOpacity }: { ashleyOpacity: MotionValue<number> }) {
  const [key, setKey] = useState(0)

  // Reset animation when Ashley section fades out
  useMotionValueEvent(ashleyOpacity, "change", (v) => {
    if (v < 0.1) {
      setKey(prev => prev + 1) // Force re-render to restart animations
    }
  })

  // Calculate cumulative start times based on line lengths
  let currentTime = 0
  const lineData = CODE_LINES.map((line) => {
    const startTime = currentTime
    const typeTime = Math.max(line.length * 0.03, 0.1) // 30ms per char, min 100ms
    currentTime += typeTime
    return { line, startTime, typeTime }
  })

  return (
    <motion.div
      key={key}
      style={{ opacity: ashleyOpacity }}
      className="absolute left-4 md:left-8 top-8 bottom-8 w-72 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes type-in {
          from { max-width: 0; opacity: 1; }
          to { max-width: 100%; opacity: 1; }
        }
      `}</style>
      <div className="font-mono text-[10px] leading-relaxed text-rga-green/30">
        {lineData.map(({ line, startTime, typeTime }, i) => (
          <div
            key={i}
            className="whitespace-nowrap overflow-hidden"
            style={{
              opacity: 0,
              animation: `type-in ${typeTime}s steps(${Math.max(line.length, 1)}) ${startTime}s forwards`,
            }}
          >
            {line || '\u00A0'}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/**
 * Ashley Terminal Section
 * Scroll-controlled "system breach" effect - Ashley hacks into the website
 * Uses fixed positioning until animation completes
 */
export function AshleyTerminal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFixed, setIsFixed] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Track when to fix/unfix the content
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Fix when we enter (progress > 0) and unfix only when fully scrolled past
    if (latest > 0 && latest < 0.995) {
      setIsFixed(true)
    } else {
      setIsFixed(false)
    }
  })

  // Animation phases - spread across scroll
  // ERROR: 0-25% - snaps in with glitch fragments
  const errorOpacity = useTransform(scrollYProgress, [0.02, 0.03, 0.18, 0.25], [0, 1, 1, 0])
  // Glitch fragments appear briefly during the "snap in" moment
  const glitchFragmentsOpacity = useTransform(scrollYProgress, [0.02, 0.025, 0.05, 0.06], [0, 1, 1, 0])
  // "System malfunction" text appears slightly after ERROR
  const malfunctionOpacity = useTransform(scrollYProgress, [0.08, 0.12, 0.18, 0.25], [0, 1, 1, 0])

  // BREACH: 18-42% - more steps for dramatic effect
  const breachOpacity = useTransform(scrollYProgress, [0.18, 0.22, 0.38, 0.42], [0, 1, 1, 0])
  // 6 hack lines appearing sequentially
  const hackLine1 = useTransform(scrollYProgress, [0.22, 0.235], [0, 1])
  const hackLine2 = useTransform(scrollYProgress, [0.245, 0.26], [0, 1])
  const hackLine3 = useTransform(scrollYProgress, [0.27, 0.285], [0, 1])
  const hackLine4 = useTransform(scrollYProgress, [0.295, 0.31], [0, 1])
  const hackLine5 = useTransform(scrollYProgress, [0.32, 0.335], [0, 1])
  const hackLine6 = useTransform(scrollYProgress, [0.35, 0.365], [0, 1])
  const hackLines = [hackLine1, hackLine2, hackLine3, hackLine4, hackLine5, hackLine6]
  // Progress bar: 0% at start of breach, 100% when last line appears
  const hackProgress = useTransform(scrollYProgress, [0.22, 0.365], [0, 100])
  const hackProgressWidth = useMotionTemplate`${hackProgress}%`
  const [displayProgress, setDisplayProgress] = useState(0)
  useMotionValueEvent(hackProgress, "change", (v) => setDisplayProgress(Math.round(v)))

  // ASHLEY: 35-80%
  const ashleyOpacity = useTransform(scrollYProgress, [0.35, 0.45, 0.75, 0.85], [0, 1, 1, 0])
  const ashleyY = useTransform(scrollYProgress, [0.35, 0.50], [60, 0])
  // Scroll-controlled typewriter for "Hey Agent" text
  const ashleyText = "Hey Agent. I run things around here. Need a raid organized? Build advice? Quality memes? I got you covered."
  const ashleyTextProgress = useTransform(scrollYProgress, [0.48, 0.58], [0, ashleyText.length])
  const [displayedAshleyText, setDisplayedAshleyText] = useState("")
  useMotionValueEvent(ashleyTextProgress, "change", (v) => {
    setDisplayedAshleyText(ashleyText.slice(0, Math.floor(v)))
  })
  // Skills appear and fill based on scroll
  const skillsOpacity = useTransform(scrollYProgress, [0.54, 0.58], [0, 1])
  const skill1Progress = useTransform(scrollYProgress, [0.58, 0.62], [0, 95])
  const skill2Progress = useTransform(scrollYProgress, [0.60, 0.64], [0, 88])
  const skill3Progress = useTransform(scrollYProgress, [0.62, 0.66], [0, 100])
  const skill4Progress = useTransform(scrollYProgress, [0.64, 0.68], [0, 99])
  const skillProgresses = [skill1Progress, skill2Progress, skill3Progress, skill4Progress]

  // EXIT: 72%+ - command line types out character by character
  const exitOpacity = useTransform(scrollYProgress, [0.72, 0.74], [0, 1])
  const commandText = "./continue.sh"
  const commandProgress = useTransform(scrollYProgress, [0.74, 0.82], [0, commandText.length])
  const [displayedCommand, setDisplayedCommand] = useState("")
  useMotionValueEvent(commandProgress, "change", (v) => {
    setDisplayedCommand(commandText.slice(0, Math.floor(v)))
  })

  return (
    <section
      ref={containerRef}
      className="relative min-h-[280vh]"
    >
      {/* Fixed/Absolute container based on scroll state */}
      <div
        className={`${isFixed ? 'fixed inset-0' : 'absolute inset-x-0 bottom-0 h-screen'} flex items-center justify-center overflow-hidden bg-bg-primary z-40`}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,65,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,65,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Scanlines overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)`,
          }}
        />

        {/* Background source code - typewriter with variable scroll timing */}
        <BackgroundCode ashleyOpacity={ashleyOpacity} />

        {/* ═══════════════════════════════════════════════════════════════════════
            PHASE 1: ERROR
            ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          style={{ opacity: errorOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6"
        >
          {/* Glitch fragments - appear briefly during snap-in with twitching */}
          <motion.div
            style={{ opacity: glitchFragmentsOpacity }}
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            {/* CSS keyframes for twitching - injected once */}
            <style>{`
              @keyframes glitch-twitch-1 {
                0%, 100% { transform: translate(0, 0); }
                25% { transform: translate(-3px, 1px); }
                50% { transform: translate(2px, -2px); }
                75% { transform: translate(-1px, 2px); }
              }
              @keyframes glitch-twitch-2 {
                0%, 100% { transform: translate(0, 0); }
                20% { transform: translate(4px, -1px); }
                40% { transform: translate(-2px, 3px); }
                60% { transform: translate(1px, -2px); }
                80% { transform: translate(-3px, 1px); }
              }
            `}</style>
            {/* Horizontal glitch bars */}
            <div
              className="absolute top-[35%] left-[10%] w-[25%] h-2 bg-red-500/80"
              style={{ animation: 'glitch-twitch-1 0.15s infinite' }}
            />
            <div
              className="absolute top-[42%] right-[15%] w-[20%] h-1 bg-rga-cyan/90"
              style={{ animation: 'glitch-twitch-2 0.12s infinite' }}
            />
            <div
              className="absolute top-[55%] left-[20%] w-[35%] h-1.5 bg-red-500/70"
              style={{ animation: 'glitch-twitch-1 0.1s infinite reverse' }}
            />
            <div
              className="absolute top-[48%] right-[25%] w-[15%] h-2 bg-rga-magenta/80"
              style={{ animation: 'glitch-twitch-2 0.18s infinite' }}
            />
            {/* Scattered pixels */}
            <div
              className="absolute top-[38%] left-[45%] w-3 h-3 bg-red-500"
              style={{ animation: 'glitch-twitch-2 0.08s infinite' }}
            />
            <div
              className="absolute top-[52%] left-[60%] w-2 h-2 bg-rga-cyan"
              style={{ animation: 'glitch-twitch-1 0.11s infinite' }}
            />
            <div
              className="absolute top-[45%] left-[30%] w-4 h-1 bg-white/90"
              style={{ animation: 'glitch-twitch-2 0.14s infinite reverse' }}
            />
            <div
              className="absolute top-[58%] right-[35%] w-2 h-4 bg-red-500/90"
              style={{ animation: 'glitch-twitch-1 0.09s infinite' }}
            />
          </motion.div>

          <div className="mb-8">
            <div className="relative">
              {/* RGB ghost copies */}
              <span
                className="absolute inset-0 font-display text-[15vw] md:text-[12vw] text-red-500/50 select-none"
                style={{ transform: "translate(-4px, 0)" }}
                aria-hidden="true"
              >
                ERROR
              </span>
              <span
                className="absolute inset-0 font-display text-[15vw] md:text-[12vw] text-rga-cyan/50 select-none"
                style={{ transform: "translate(4px, 0)" }}
                aria-hidden="true"
              >
                ERROR
              </span>
              <HeroGlitch
                minInterval={2}
                maxInterval={5}
                intensity={9}
                dataCorruption
                scanlines
                colors={["#ff0000", "#ff00ff"]}
              >
                <h2 className="font-display text-[15vw] md:text-[12vw] text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                  ERROR
                </h2>
              </HeroGlitch>
            </div>
          </div>

          <motion.div
            style={{ opacity: malfunctionOpacity }}
            className="flex items-center gap-3 text-red-500"
          >
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <span className="font-mono text-sm md:text-base uppercase tracking-widest">
              System malfunction detected
            </span>
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════
            PHASE 2: BREACH
            ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          style={{ opacity: breachOpacity }}
          className="absolute inset-0 flex items-center justify-center px-6"
        >
          <div className="bg-black/95 border border-rga-green/50 rounded-lg font-mono max-w-lg w-full overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center justify-between px-4 py-2 bg-rga-green/10 border-b border-rga-green/30">
              <div className="flex items-center gap-2 text-rga-green">
                <Skull className="w-4 h-4" />
                <span className="uppercase tracking-widest text-xs">INTRUSION DETECTED</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-500 text-xs uppercase tracking-wider">LIVE</span>
              </div>
            </div>

            {/* Terminal body */}
            <div className="px-4 py-4 space-y-1.5">
              {/* Blinking cursor keyframes */}
              <style>{`
                @keyframes blink-cursor {
                  0%, 50% { opacity: 1; }
                  51%, 100% { opacity: 0; }
                }
              `}</style>

              {HACK_STEPS.map((step, index) => (
                <motion.div
                  key={index}
                  style={{ opacity: hackLines[index] }}
                  className={`flex items-center justify-between text-sm ${step.bold ? 'font-bold' : ''}`}
                >
                  <div className="flex items-center">
                    <span className="text-rga-green mr-2">$</span>
                    <span className={
                      step.color === 'green' ? 'text-rga-green' :
                      step.color === 'magenta' ? 'text-rga-magenta' :
                      'text-rga-cyan'
                    }>
                      {step.text}
                    </span>
                    {/* Blinking cursor on last visible line */}
                    {index === HACK_STEPS.length - 1 && (
                      <span
                        className="ml-1 inline-block w-2 h-4 bg-rga-green"
                        style={{ animation: 'blink-cursor 0.8s infinite' }}
                      />
                    )}
                  </div>
                  {step.status && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      step.status === 'ROOT' ? 'bg-rga-magenta/20 text-rga-magenta' :
                      'bg-rga-green/20 text-rga-green'
                    }`}>
                      [{step.status}]
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Terminal footer with animated progress */}
            <div className="px-4 py-2 bg-black/50 border-t border-rga-green/20 flex items-center justify-between text-xs text-text-muted">
              <span>ashley@exploit:~</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-black/50 rounded-sm overflow-hidden border border-rga-green/30">
                  <motion.div
                    className="h-full bg-rga-green"
                    style={{ width: hackProgressWidth }}
                  />
                </div>
                <span className="text-rga-green w-8 text-right font-mono">
                  {displayProgress}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════
            PHASE 3: ASHLEY TAKEOVER
            ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          style={{ opacity: ashleyOpacity, y: ashleyY }}
          className="absolute inset-0 flex items-center"
        >
          <div className="w-full h-full flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-black/80 border-b border-rga-green/30">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="font-mono text-sm text-rga-green hidden sm:inline">
                  ashley@roguearmy ~ SYSTEM COMPROMISED
                </span>
              </div>
              <div className="flex items-center gap-2 text-rga-magenta font-mono text-xs uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-rga-magenta animate-pulse" />
                Breach Active
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex items-center px-6 md:px-12 lg:px-20 py-8">
              <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-[400px_1fr] gap-8 lg:gap-16 items-center">
                {/* Ashley Avatar */}
                <div className="relative mx-auto lg:mx-0 w-full max-w-[400px]">
                  <div className="absolute -inset-4 bg-linear-to-br from-rga-cyan/20 via-rga-green/10 to-rga-magenta/20 rounded-2xl blur-2xl" />

                  <div className="relative">
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-rga-cyan/30 bg-bg-elevated">
                      {/* RGB glitch layers */}
                      <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={{ x: [-2, 2, -2] }}
                        transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 4 }}
                      >
                        <Image
                          src="/images/ashley-avatar.png"
                          alt=""
                          fill
                          className="object-cover object-top"
                          style={{ filter: "hue-rotate(180deg)" }}
                          aria-hidden="true"
                        />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={{ x: [2, -2, 2] }}
                        transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 4, delay: 0.05 }}
                      >
                        <Image
                          src="/images/ashley-avatar.png"
                          alt=""
                          fill
                          className="object-cover object-top"
                          style={{ filter: "hue-rotate(-60deg)" }}
                          aria-hidden="true"
                        />
                      </motion.div>

                      <Image
                        src="/images/ashley-avatar.png"
                        alt="Ashley - Rogue Army Bot"
                        fill
                        className="object-cover object-top"
                        priority
                      />

                      <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)`,
                        }}
                      />

                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-bg-elevated to-transparent" />
                    </div>

                    {/* Name badge */}
                    <div className="absolute -bottom-4 left-4 right-4 bg-black/90 border border-rga-cyan/30 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Bot className="w-8 h-8 text-rga-cyan" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rga-green animate-pulse" />
                        </div>
                        <div>
                          <p className="font-display text-xl text-white">ASHLEY</p>
                          <p className="text-xs font-mono text-rga-green">v2.0 • ONLINE</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Info */}
                <div className="text-center lg:text-left">
                  <div className="mb-6">
                    <p className="text-rga-magenta font-mono text-sm uppercase tracking-widest mb-2">
                      {'// System Compromised'}
                    </p>
                    <HeroGlitch
                      minInterval={3}
                      maxInterval={7}
                      intensity={5}
                      dataCorruption={false}
                      colors={["#00ffff", "#00ff41"]}
                    >
                      <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-white uppercase mb-4">
                        I&apos;M IN.
                      </h2>
                    </HeroGlitch>
                    <p className="text-text-secondary text-lg md:text-xl max-w-xl">
                      {displayedAshleyText}
                      {displayedAshleyText.length < ashleyText.length && (
                        <span
                          className="inline-block w-0.5 h-5 bg-rga-green ml-0.5 align-middle"
                          style={{ animation: 'blink-cursor 0.8s infinite' }}
                        />
                      )}
                    </p>
                  </div>

                  {/* Skills - scroll-controlled progress */}
                  <motion.div style={{ opacity: skillsOpacity }} className="mt-8">
                    <div className="flex items-center gap-2 text-rga-cyan mb-4 justify-center lg:justify-start">
                      <Zap className="w-4 h-4" />
                      <span className="font-mono text-xs uppercase tracking-widest">System Capabilities</span>
                    </div>

                    {/* Mobile: Compact inline view (hidden on xs screens < 480px) */}
                    <div className="hidden min-[480px]:block sm:hidden">
                      <CompactSkillsDisplay skillProgresses={skillProgresses} />
                    </div>

                    {/* Desktop: Full progress bars */}
                    <div className="hidden sm:block space-y-3 max-w-md mx-auto lg:mx-0">
                      {SKILLS.map((skill, index) => (
                        <ScrollControlledSkill
                          key={skill.label}
                          label={skill.label}
                          progress={skillProgresses[index]}
                          color={skill.color}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="px-6 py-2 bg-black/60 border-t border-rga-green/20 font-mono text-xs text-text-muted flex items-center justify-between">
              <span>{'>'} ashley --status: all systems operational</span>
              <span className="text-rga-green">■ CONNECTED</span>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════
            EXIT PHASE - Terminal command types out as you scroll
            ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          style={{ opacity: exitOpacity }}
          className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none"
        >
          <div className="bg-black/90 border border-rga-green/50 rounded-lg font-mono max-w-md w-full overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-rga-green/10 border-b border-rga-green/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-rga-green text-xs">ashley@roguearmy</span>
            </div>

            {/* Terminal body with typing command */}
            <div className="px-4 py-4">
              <div className="flex items-center text-sm">
                <span className="text-rga-cyan mr-2">$</span>
                <span className="text-rga-green">{displayedCommand}</span>
                <span
                  className="ml-0.5 inline-block w-2 h-4 bg-rga-green"
                  style={{ animation: 'blink-cursor 0.8s infinite' }}
                />
              </div>

              {/* Output appears after command is typed */}
              {displayedCommand === commandText && (
                <div className="mt-3 pt-3 border-t border-rga-green/20">
                  <p className="text-text-muted text-xs mb-2">Executing transition sequence...</p>
                  <div className="flex items-center gap-2 text-rga-green text-sm">
                    <motion.span
                      animate={{ y: [0, 3, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ↓
                    </motion.span>
                    <span>Scroll to continue</span>
                    <motion.span
                      animate={{ y: [0, 3, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ↓
                    </motion.span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
