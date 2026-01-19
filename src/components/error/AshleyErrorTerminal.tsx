"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import { Bot } from "lucide-react"
import { TypeWriter } from "@/components/effects"
import type { ErrorConfig, TerminalLine } from "./error-config"

interface AshleyErrorTerminalProps {
  config: ErrorConfig
  /** Delay before terminal animation starts (ms) */
  startDelay?: number
  /** The path that was requested (for 404 errors) */
  requestedPath?: string | null
}

const colorClasses: Record<TerminalLine["color"], string> = {
  green: "text-rga-green",
  cyan: "text-rga-cyan",
  magenta: "text-rga-magenta",
  red: "text-red-500",
  yellow: "text-yellow-500",
  white: "text-text-secondary",
}

const statusClasses: Record<string, string> = {
  FAIL: "bg-red-500/20 text-red-500",
  DENIED: "bg-red-500/20 text-red-500",
  FORBIDDEN: "bg-red-500/20 text-red-500",
  ERROR: "bg-red-500/20 text-red-500",
  CRASH: "bg-red-500/20 text-red-500",
  BAD: "bg-red-500/20 text-red-500",
  DOWN: "bg-red-500/20 text-red-500",
  "NOT FOUND": "bg-red-500/20 text-red-500",
  REVOKED: "bg-red-500/20 text-red-500",
  OK: "bg-rga-green/20 text-rga-green",
  DONE: "bg-rga-green/20 text-rga-green",
}

const prefixClasses: Record<TerminalLine["prefix"], string> = {
  $: "text-rga-green",
  ">": "text-text-muted",
  "!": "text-red-500",
}

/**
 * Terminal-style error display with Ashley's commentary.
 * Features sequential line reveal and typewriter message effect.
 */
export function AshleyErrorTerminal({
  config,
  startDelay = 800,
  requestedPath,
}: AshleyErrorTerminalProps) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [showMessage, setShowMessage] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  const Icon = config.icon

  // Generate dynamic terminal lines for 404 with the actual requested path
  const terminalLines = useMemo((): TerminalLine[] => {
    if (config.code === "404" && requestedPath) {
      return [
        { prefix: "$", text: `curl -I ${requestedPath}`, color: "cyan" },
        { prefix: ">", text: "Connecting to roguearmy.xyz...", color: "white" },
        { prefix: ">", text: "HTTP/1.1 404 Not Found", color: "yellow" },
        { prefix: "!", text: `Target: ${requestedPath}`, status: "NOT FOUND", color: "red" },
        { prefix: "$", text: "suggest --redirect /", color: "green" },
      ]
    }
    return config.terminalLog
  }, [config.code, config.terminalLog, requestedPath])

  // Animate terminal lines sequentially
  useEffect(() => {
    const lineDelay = 150 // ms between each line

    const timers: NodeJS.Timeout[] = []

    // Start after initial delay
    const startTimer = setTimeout(() => {
      terminalLines.forEach((_, index) => {
        const timer = setTimeout(() => {
          setVisibleLines(index + 1)
        }, index * lineDelay)
        timers.push(timer)
      })

      // Show Ashley's message after all lines are visible
      const messageTimer = setTimeout(() => {
        setShowMessage(true)
      }, terminalLines.length * lineDelay + 200)
      timers.push(messageTimer)
    }, startDelay)

    timers.push(startTimer)

    return () => timers.forEach(clearTimeout)
  }, [terminalLines, startDelay])

  const handleMessageComplete = () => {
    if (currentMessageIndex < config.ashleyMessage.length - 1) {
      setTimeout(() => {
        setCurrentMessageIndex((prev) => prev + 1)
      }, 500)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: startDelay / 1000 - 0.3 }}
      className="w-full max-w-lg"
    >
      <div className="bg-black/95 border border-rga-green/50 rounded-lg font-mono overflow-hidden backdrop-blur-sm">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-rga-green/10 border-b border-rga-green/30">
          <div className="flex items-center gap-3">
            {/* Window controls */}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-rga-green text-xs hidden sm:inline">
              ashley@roguearmy ~ ERROR_HANDLER
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-500 text-xs uppercase tracking-wider">
              LIVE
            </span>
          </div>
        </div>

        {/* Terminal Body - Command Output */}
        <div className="px-4 py-4 space-y-1.5 min-h-35">
          {terminalLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: index < visibleLines ? 1 : 0,
                x: index < visibleLines ? 0 : -10,
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className={prefixClasses[line.prefix]}>{line.prefix}</span>
                <span className={colorClasses[line.color]}>{line.text}</span>
              </div>
              {line.status && (
                <span
                  className={`text-xs px-2 py-0.5 rounded ${statusClasses[line.status] || "bg-white/10 text-white"}`}
                >
                  [{line.status}]
                </span>
              )}
            </motion.div>
          ))}

          {/* Blinking cursor on last line */}
          {visibleLines === terminalLines.length && !showMessage && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-rga-green">$</span>
              <span className="w-2 h-4 bg-rga-green animate-blink" />
            </div>
          )}
        </div>

        {/* Ashley's Message Section */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: showMessage ? 1 : 0,
            height: showMessage ? "auto" : 0,
          }}
          transition={{ duration: 0.3 }}
          className="border-t border-rga-green/30 overflow-hidden"
        >
          <div className="px-4 py-4">
            {/* Ashley identifier */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative">
                <Bot className="w-5 h-5 text-rga-cyan" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rga-green animate-pulse" />
              </div>
              <span className="text-rga-cyan text-xs uppercase tracking-widest">
                ASHLEY v2.0
              </span>
            </div>

            {/* Message with typewriter effect */}
            <div className="text-text-secondary text-sm leading-relaxed space-y-2">
              {config.ashleyMessage.map((message, index) => (
                <div key={index} className="min-h-[1.5em]">
                  {showMessage && index <= currentMessageIndex && (
                    <TypeWriter
                      text={message}
                      speed={30}
                      delay={index === 0 ? 0 : 100}
                      cursor={index === currentMessageIndex}
                      onComplete={
                        index === currentMessageIndex
                          ? handleMessageComplete
                          : undefined
                      }
                      className="text-text-secondary"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Terminal Footer */}
        <div className="px-4 py-2 bg-black/50 border-t border-rga-green/20 flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5" />
            <span>error_code: {config.code}</span>
          </div>
          <span className={`${colorClasses[config.color === "red" ? "red" : config.color]}`}>
            ■ {config.title}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
