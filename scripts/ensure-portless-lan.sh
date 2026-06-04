#!/usr/bin/env bash
#
# Ensure portless proxy is running in LAN mode before `next dev` starts.
# Wired up via the `predev` / `predevsafe` pnpm lifecycle hooks.
#
# Fast path: if port 443 is listening and TLD=local, exit 0.
# Slow path: stop the running proxy (if any) and restart with --lan.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="${HOME}/.portless"
TLD_FILE="${STATE_DIR}/proxy.tld"
LAN_FILE="${STATE_DIR}/proxy.lan"

bold()   { printf "\n\033[1m▶ %s\033[0m\n" "$*"; }
green()  { printf "  \033[32m✓\033[0m %s\n" "$*"; }
yellow() { printf "  \033[33m!\033[0m %s\n" "$*"; }
link()   { printf "  \033[36m→\033[0m \033[1;36m%s\033[0m\n" "$*"; }
meta()   { printf "    \033[2m%s\033[0m\n" "$*"; }

app_name() {
  if [ -f "${REPO_ROOT}/portless.json" ]; then
    node -p "require('${REPO_ROOT}/portless.json').name" 2>/dev/null || echo "app"
  else
    echo "app"
  fi
}

lan_ip()  { [ -f "${LAN_FILE}" ] && cat "${LAN_FILE}" || echo ""; }

summary() {
  local name ip
  name="$(app_name)"
  ip="$(lan_ip)"
  link "https://${name}.local"
  if [ -n "${ip}" ]; then
    meta "LAN IP: ${ip}"
  fi
}

bold "portless"

# ─── Fast path: already in LAN mode? ────────────────────────────────────────
#
# Check `proxy.tld=local` + "port 443 is listening" rather than `proxy.pid`.
# The PID file goes stale (daemon respawns under a new PID without rewriting
# it), so trusting it caused spurious restarts. Port 443 + TLD reflect the
# actual observable state.

tld_is_local=0
if [ -f "${TLD_FILE}" ] && [ "$(cat "${TLD_FILE}")" = "local" ]; then
  tld_is_local=1
fi

port_443_open=0
if nc -z -w 1 localhost 443 >/dev/null 2>&1; then
  port_443_open=1
fi

if [ "${tld_is_local}" = "1" ] && [ "${port_443_open}" = "1" ]; then
  green "proxy ready in LAN mode"
  summary
  exit 0
fi

# ─── Slow path: restart in LAN mode ─────────────────────────────────────────

yellow "proxy not in LAN mode — restarting (may prompt for sudo)"
portless proxy stop >/dev/null 2>&1 || true
portless proxy start --lan
green "proxy now running in LAN mode"
summary
