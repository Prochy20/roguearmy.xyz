import type { LucideIcon } from "lucide-react"
import {
  Skull,
  Lock,
  ShieldOff,
  AlertTriangle,
  ServerCrash,
  WifiOff,
  CloudOff,
} from "lucide-react"

export type ErrorCode = "404" | "401" | "403" | "400" | "500" | "502" | "503"

export interface TerminalLine {
  prefix: "$" | ">" | "!"
  text: string
  status?: string
  color: "green" | "cyan" | "magenta" | "red" | "yellow" | "white"
}

export interface ErrorConfig {
  code: ErrorCode
  title: string
  subtitle: string
  ashleyMessage: string[]
  terminalLog: TerminalLine[]
  color: "red" | "cyan" | "magenta"
  icon: LucideIcon
  glitchColors: [string, string]
}

export const ERROR_CONFIGS: Record<ErrorCode, ErrorConfig> = {
  "404": {
    code: "404",
    title: "SIGNAL LOST",
    subtitle: "Target not found in database",
    ashleyMessage: [
      "Hey Agent... that page doesn't exist.",
      "I've scanned every sector. Nothing here.",
      "Maybe try the homepage? I'll guide you back.",
    ],
    terminalLog: [
      { prefix: "$", text: "scan --target /unknown", color: "cyan" },
      { prefix: ">", text: "Initializing sector scan...", color: "white" },
      { prefix: ">", text: "Searching 2,847 nodes...", color: "white" },
      { prefix: ">", text: "Target not found", status: "FAIL", color: "red" },
      { prefix: "$", text: "suggest --redirect /home", color: "green" },
    ],
    color: "cyan",
    icon: Skull,
    glitchColors: ["#00ffff", "#ff00ff"],
  },

  "401": {
    code: "401",
    title: "ACCESS DENIED",
    subtitle: "Authentication required",
    ashleyMessage: [
      "Whoa there, Agent. No credentials detected.",
      "You need to authenticate first.",
      "Log in and I'll let you through.",
    ],
    terminalLog: [
      { prefix: "$", text: "auth --verify session", color: "cyan" },
      { prefix: ">", text: "Checking credentials...", color: "white" },
      { prefix: ">", text: "Token: NULL", color: "yellow" },
      { prefix: "!", text: "No valid token found", status: "DENIED", color: "red" },
      { prefix: "$", text: "redirect --to /login", color: "magenta" },
    ],
    color: "magenta",
    icon: Lock,
    glitchColors: ["#ff00ff", "#00ffff"],
  },

  "403": {
    code: "403",
    title: "RESTRICTED",
    subtitle: "Insufficient clearance level",
    ashleyMessage: [
      "Nice try, Agent. But you don't have clearance.",
      "This sector is off-limits to your access level.",
      "Contact command if you think this is a mistake.",
    ],
    terminalLog: [
      { prefix: "$", text: "access --request sector-7", color: "cyan" },
      { prefix: ">", text: "Verifying permissions...", color: "white" },
      { prefix: ">", text: "Clearance: LEVEL 2", color: "yellow" },
      { prefix: ">", text: "Required: LEVEL 5", color: "red" },
      { prefix: "!", text: "ACCESS BLOCKED", status: "FORBIDDEN", color: "red" },
    ],
    color: "red",
    icon: ShieldOff,
    glitchColors: ["#ff0000", "#ff00ff"],
  },

  "400": {
    code: "400",
    title: "MALFORMED",
    subtitle: "Invalid request syntax",
    ashleyMessage: [
      "Uh... what did you just send me?",
      "That request made zero sense.",
      "Try again, but this time... correctly?",
    ],
    terminalLog: [
      { prefix: "$", text: "parse --request incoming", color: "cyan" },
      { prefix: ">", text: "Analyzing input stream...", color: "white" },
      { prefix: ">", text: "Syntax validation: FAILED", color: "yellow" },
      { prefix: "!", text: "Malformed data detected", status: "ERROR", color: "red" },
      { prefix: "$", text: "reject --code 400", color: "magenta" },
    ],
    color: "magenta",
    icon: AlertTriangle,
    glitchColors: ["#ff00ff", "#ffff00"],
  },

  "500": {
    code: "500",
    title: "SYSTEM CRASH",
    subtitle: "Internal error detected",
    ashleyMessage: [
      "ALERT: Something broke on my end.",
      "Running diagnostics... yep, it's bad.",
      "Give me a sec to fix this. Try again soon.",
    ],
    terminalLog: [
      { prefix: "$", text: "system --status", color: "cyan" },
      { prefix: "!", text: "CRITICAL: Core malfunction", status: "CRASH", color: "red" },
      { prefix: ">", text: "Stack trace: 0x7FF3A2B...", color: "yellow" },
      { prefix: ">", text: "Initiating recovery...", color: "white" },
      { prefix: "$", text: "restart --graceful", color: "green" },
    ],
    color: "red",
    icon: ServerCrash,
    glitchColors: ["#ff0000", "#ff00ff"],
  },

  "502": {
    code: "502",
    title: "UPSTREAM FAIL",
    subtitle: "Gateway received invalid response",
    ashleyMessage: [
      "The upstream server is being difficult.",
      "I'm getting garbage responses.",
      "This usually fixes itself. Hang tight.",
    ],
    terminalLog: [
      { prefix: "$", text: "gateway --check upstream", color: "cyan" },
      { prefix: ">", text: "Pinging origin server...", color: "white" },
      { prefix: ">", text: "Response: MALFORMED", color: "yellow" },
      { prefix: "!", text: "Invalid response received", status: "BAD", color: "red" },
      { prefix: "$", text: "retry --timeout 30", color: "cyan" },
    ],
    color: "cyan",
    icon: WifiOff,
    glitchColors: ["#00ffff", "#ff0000"],
  },

  "503": {
    code: "503",
    title: "OFFLINE",
    subtitle: "Service temporarily unavailable",
    ashleyMessage: [
      "We're doing maintenance. Or something broke.",
      "Either way, the service is down.",
      "Check back in a few minutes, Agent.",
    ],
    terminalLog: [
      { prefix: "$", text: "service --status", color: "cyan" },
      { prefix: ">", text: "Querying service health...", color: "white" },
      { prefix: "!", text: "Service status: OFFLINE", status: "DOWN", color: "red" },
      { prefix: ">", text: "Maintenance mode: ACTIVE", color: "magenta" },
      { prefix: "$", text: "eta --recovery", color: "cyan" },
    ],
    color: "magenta",
    icon: CloudOff,
    glitchColors: ["#ff00ff", "#00ffff"],
  },
}

export function getErrorConfig(code: ErrorCode | string): ErrorConfig {
  const normalizedCode = code.toString() as ErrorCode
  return ERROR_CONFIGS[normalizedCode] || ERROR_CONFIGS["500"]
}
