#!/usr/bin/env bash
#
# Set up portless for local development of RGA-WEB on https://rga.local.
#
# Usage:  ./scripts/setup-portless.sh
#
# What it does:
#   1. Verifies Node 24+ and pnpm are installed.
#   2. Installs portless globally (npm install -g portless).
#   3. Trusts the portless local CA in the system keychain (prompts sudo).
#   4. Installs project dependencies via pnpm.
#   5. Starts the portless proxy in LAN mode (mDNS + HTTPS on port 443).
#
# Tested on macOS and Linux. Windows users should follow the README at
# https://github.com/vercel-labs/portless manually.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="rga"

bold()   { printf "\033[1m%s\033[0m\n" "$*"; }
green()  { printf "  \033[32m✓\033[0m %s\n" "$*"; }
yellow() { printf "  \033[33m!\033[0m %s\n" "$*"; }
red()    { printf "  \033[31m✗\033[0m %s\n" "$*"; }

# ─── 1. Prerequisites ───────────────────────────────────────────────────────

bold "▶ Checking prerequisites"

if ! command -v node >/dev/null 2>&1; then
  red "Node.js is not installed."
  yellow "Install Node 24+ (nvm install 24, fnm use 24, or https://nodejs.org)."
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "${NODE_MAJOR}" -lt 24 ]; then
  red "Node $(node -v) detected — portless requires Node 24+."
  yellow "Switch via: nvm install 24 && nvm use 24   (or: fnm use 24)"
  exit 1
fi
green "Node $(node -v)"

if ! command -v pnpm >/dev/null 2>&1; then
  red "pnpm is not installed."
  yellow "Install via: npm install -g pnpm   (or: corepack enable)"
  exit 1
fi
green "pnpm $(pnpm -v)"

# ─── 2. Install portless ────────────────────────────────────────────────────

bold "▶ Installing portless"
if command -v portless >/dev/null 2>&1; then
  green "portless already installed"
else
  npm install -g portless
  green "portless installed globally"
fi

# ─── 3. Trust the local CA ──────────────────────────────────────────────────

bold "▶ Trusting portless local CA (may prompt for sudo)"
portless trust
green "CA trusted in system keychain"

# ─── 4. Install repo dependencies ───────────────────────────────────────────

bold "▶ Installing project dependencies"
( cd "${REPO_ROOT}" && pnpm install )
green "Dependencies installed"

# ─── 5. .env sanity check (don't auto-create — contains secrets) ────────────

bold "▶ Checking .env"
if [ ! -f "${REPO_ROOT}/.env" ]; then
  yellow "No .env file at ${REPO_ROOT}/.env"
  yellow "Copy it from a teammate (it carries Discord/Mongo/Ashley secrets)."
  yellow "Without .env, the dev server will start but auth and DB calls will fail."
else
  green ".env present"
fi

# ─── 6. Start the proxy in LAN mode ─────────────────────────────────────────

bold "▶ Starting portless proxy in LAN mode"
# portless refuses to start over an existing proxy with different settings,
# so stop any running proxy first to guarantee a clean LAN-mode start.
portless proxy stop >/dev/null 2>&1 || true
portless proxy start --lan
green "Proxy running on port 443 in LAN mode"

# ─── 7. mDNS collision warning ──────────────────────────────────────────────

bold "▶ Checking for mDNS name collisions on the LAN"
COLLISION=""
if command -v dns-sd >/dev/null 2>&1; then
  # macOS: probe for the .local hostname for 2s.
  COLLISION="$(timeout 2 dns-sd -G v4v6 "${APP_NAME}.local" 2>/dev/null | awk 'NR>1 && $5 != "" {print $5; exit}' || true)"
elif command -v avahi-resolve >/dev/null 2>&1; then
  COLLISION="$(avahi-resolve -n "${APP_NAME}.local" 2>/dev/null | awk '{print $2}' || true)"
fi

OWN_IP="$(portless proxy status 2>/dev/null | awk -F': ' '/IP:/ {print $2; exit}' || true)"
if [ -n "${COLLISION}" ] && [ -n "${OWN_IP}" ] && [ "${COLLISION}" != "${OWN_IP}" ]; then
  yellow "Another device on the LAN is already serving ${APP_NAME}.local at ${COLLISION}."
  yellow "Either coordinate with that dev to stop their proxy, or edit"
  yellow "${REPO_ROOT}/portless.json to use a unique name (e.g. rga-${USER:-dev2})."
  yellow "Note: a custom name means Discord OAuth callbacks must also be re-registered."
else
  green "No conflicting ${APP_NAME}.local advertisement detected"
fi

# ─── Done ──────────────────────────────────────────────────────────────────

cat <<EOF

═══════════════════════════════════════════════════════════════
$(bold "portless is set up.")

  Next:
    cd ${REPO_ROOT}
    pnpm dev
    open https://${APP_NAME}.local

  Useful commands:
    portless list                   List active routes
    portless proxy stop / start     Control the proxy
    PORTLESS=0 pnpm dev             Bypass the proxy entirely
═══════════════════════════════════════════════════════════════
EOF
