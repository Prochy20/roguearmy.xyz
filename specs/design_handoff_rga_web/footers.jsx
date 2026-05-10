/* global React */
const { useEffect, useState, useRef } = React;

// ═════════════════════════════════════════════════════════════════════
// Shared primitives — all match the RGA design system
// ═════════════════════════════════════════════════════════════════════

const RGA = {
  green: "#00FF41",
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  void: "#030303",
  bg: "#0A0A0A",
  elevated: "#111111",
  surface: "#1A1A1A",
  text: "#FFFFFF",
  text2: "#888888",
  muted: "#555555",
};

const DiscordGlyph = ({ size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const Caret = () => (
  <span
    style={{
      display: "inline-block",
      width: 8,
      height: 14,
      background: RGA.green,
      marginLeft: 6,
      verticalAlign: "middle",
      animation: "rgablink 1s step-end infinite",
      boxShadow: "0 0 6px rgba(0,255,65,0.6)",
    }}
  />
);

// Subtle persistent scanlines layer
const Scanlines = ({ opacity = 0.05 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      opacity,
      backgroundImage:
        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
    }}
  />
);

// Noise overlay
const Noise = ({ opacity = 0.04 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      opacity,
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
    }}
  />
);

// Glitch separator strip (like SectionGlitch minimal)
const GlitchSeparator = ({ primary = RGA.cyan, secondary = RGA.magenta }) => (
  <div style={{ position: "relative", height: 16, width: "100%" }} aria-hidden="true">
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        height: 1,
        transform: "translateY(-50%)",
        background: `linear-gradient(90deg, transparent 0%, ${primary}66 20%, ${secondary}4d 50%, ${primary}66 80%, transparent 100%)`,
        boxShadow: `0 0 20px ${primary}33`,
      }}
    />
  </div>
);

const CornerBrackets = ({ color = RGA.green, size = 14, inset = 0, glow = true }) => {
  const g = glow ? `0 0 6px ${color}` : "none";
  const lineStyle = (w, h) => ({ position: "absolute", background: color, boxShadow: g, width: w, height: h });
  return (
    <div style={{ position: "absolute", inset, pointerEvents: "none" }} aria-hidden="true">
      <div style={{ ...lineStyle(size, 1), top: 0, left: 0 }} />
      <div style={{ ...lineStyle(1, size), top: 0, left: 0 }} />
      <div style={{ ...lineStyle(size, 1), top: 0, right: 0 }} />
      <div style={{ ...lineStyle(1, size), top: 0, right: 0 }} />
      <div style={{ ...lineStyle(size, 1), bottom: 0, left: 0 }} />
      <div style={{ ...lineStyle(1, size), bottom: 0, left: 0 }} />
      <div style={{ ...lineStyle(size, 1), bottom: 0, right: 0 }} />
      <div style={{ ...lineStyle(1, size), bottom: 0, right: 0 }} />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════
// V1 — TERMINAL SESSION FOOTER
// The footer as a live shell prompt. Commands are links. A trailing
// output shows system status. Low-chrome, very on-brand.
// ═════════════════════════════════════════════════════════════════════

const TerminalFooter = () => {
  const year = new Date().getFullYear();
  const groups = [
    {
      label: "community",
      items: [
        { cmd: "./join-discord", href: "#", tag: "primary" },
        { cmd: "./rules",        href: "#" },
        { cmd: "./members",      href: "#" },
        { cmd: "./events",       href: "#" },
      ],
    },
    {
      label: "content",
      items: [
        { cmd: "cat blog/*",     href: "#" },
        { cmd: "cat series/*",   href: "#" },
        { cmd: "./bookmarks",    href: "#" },
      ],
    },
    {
      label: "squads",
      items: [
        { cmd: "grep division-2",  href: "#" },
        { cmd: "grep destiny-2",   href: "#" },
        { cmd: "grep helldivers-2",href: "#" },
        { cmd: "grep deep-rock",   href: "#" },
      ],
    },
    {
      label: "system",
      items: [
        { cmd: "man privacy",     href: "#" },
        { cmd: "man terms",       href: "#" },
        { cmd: "whois rga",       href: "#" },
      ],
    },
  ];

  return (
    <footer style={{ position: "relative", background: RGA.void, color: RGA.text2, fontFamily: "'JetBrains Mono', monospace", overflow: "hidden" }}>
      <GlitchSeparator primary={RGA.green} secondary={RGA.cyan} />
      <Scanlines />

      {/* ambient radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 70% at 85% 30%, rgba(0,255,65,0.06) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 10% 90%, rgba(0,255,255,0.05) 0%, transparent 55%)",
        }}
      />

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 48px 0" }}>
        {/* session line */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: RGA.muted, marginBottom: 28 }}>
          <span style={{ color: RGA.green }}>●</span>
          <span>session_0420 · uptime 14d · 0 incidents</span>
          <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${RGA.green}33, transparent)` }} />
          <span style={{ color: RGA.text2 }}>last commit · main@<span style={{ color: RGA.cyan }}>a4f2c9b</span></span>
        </div>

        {/* brand + prompt hero */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "end", marginBottom: 56 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.3em", color: RGA.muted, marginBottom: 14 }}>// ROOT/BROADCAST</div>
            <div style={{ fontFamily: "'Hanson Bold','Black Ops One',sans-serif", fontSize: 92, lineHeight: 0.85, letterSpacing: "0.02em", color: RGA.text, textTransform: "uppercase" }}>
              ROGUE<br />ARMY
              <span style={{ color: RGA.green, textShadow: "0 0 18px rgba(0,255,65,0.5)" }}>.</span>
            </div>
            <div style={{ fontSize: 13, color: RGA.text2, marginTop: 18, maxWidth: 440, lineHeight: 1.5, fontFamily: "Outfit, system-ui, sans-serif" }}>
              Casual gaming community for adults 25+. 200 operators, six active squads,
              one Discord that refuses to die quietly.
            </div>
          </div>

          {/* live terminal prompt */}
          <div style={{ position: "relative", border: `1px solid ${RGA.green}33`, background: "rgba(5,10,5,0.6)", padding: "20px 22px" }}>
            <CornerBrackets color={RGA.green} size={10} />
            <div style={{ fontSize: 11, color: RGA.muted, letterSpacing: "0.2em", marginBottom: 10 }}>
              /rga/shell — visitor@void
            </div>
            <div style={{ fontSize: 13, color: RGA.text, lineHeight: 1.9 }}>
              <div><span style={{ color: RGA.green }}>rga@void</span><span style={{ color: RGA.muted }}>:</span><span style={{ color: RGA.cyan }}>~/footer</span><span style={{ color: RGA.muted }}>$ </span>./connect --discord</div>
              <div style={{ color: RGA.muted }}>&gt; resolving dc.roguearmy.xyz … <span style={{ color: RGA.green }}>ok</span></div>
              <div style={{ color: RGA.muted }}>&gt; handshake … <span style={{ color: RGA.green }}>200 OK</span></div>
              <div><span style={{ color: RGA.green }}>rga@void</span><span style={{ color: RGA.muted }}>:</span><span style={{ color: RGA.cyan }}>~/footer</span><span style={{ color: RGA.muted }}>$ </span><Caret /></div>
            </div>
            <a
              href="#"
              style={{
                marginTop: 18,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 18px",
                border: `1px solid ${RGA.green}`,
                color: RGA.green,
                fontSize: 12,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                textDecoration: "none",
                boxShadow: `0 0 18px rgba(0,255,65,0.18), inset 0 0 18px rgba(0,255,65,0.06)`,
              }}
            >
              <DiscordGlyph size={14} /> Join Discord <span style={{ color: RGA.green }}>&gt;&gt;</span>
            </a>
          </div>
        </div>

        {/* link columns — presented as man pages */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, paddingBottom: 44, borderBottom: `1px solid ${RGA.green}14` }}>
          {groups.map((g) => (
            <div key={g.label}>
              <div style={{ fontSize: 10, letterSpacing: "0.35em", color: RGA.green, marginBottom: 14, textTransform: "uppercase" }}>
                <span style={{ color: RGA.muted }}>[</span>{g.label}<span style={{ color: RGA.muted }}>]</span>
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {g.items.map((it) => (
                  <li key={it.cmd}>
                    <a
                      href={it.href}
                      style={{
                        display: "inline-flex",
                        gap: 8,
                        alignItems: "baseline",
                        fontSize: 13,
                        textDecoration: "none",
                        color: it.tag === "primary" ? RGA.green : RGA.text2,
                      }}
                    >
                      <span style={{ color: RGA.muted }}>$</span>
                      <span>{it.cmd}</span>
                      {it.tag === "primary" && <span style={{ color: RGA.green }}>★</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* status strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "22px 0", fontSize: 11, letterSpacing: "0.18em", color: RGA.muted, textTransform: "uppercase" }}>
          <span style={{ color: RGA.green }}>[SYS]</span>
          <span>ROGUE_ARMY</span>
          <span style={{ color: RGA.muted }}>//</span>
          <span style={{ color: RGA.green }}>ONLINE</span>
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 12,
              background: RGA.green,
              opacity: 0.6,
              animation: "rgablink 1s step-end infinite",
            }}
          />
          <span style={{ flex: 1 }} />
          <span>© {year} ROGUE ARMY</span>
          <span style={{ color: RGA.muted }}>//</span>
          <span>
            built with <span style={{ color: RGA.green }}>&lt;/&gt;</span> and <span style={{ color: RGA.magenta }}>♥</span>
          </span>
        </div>
      </div>

      <style>{`@keyframes rgablink { 0%,100% { opacity:1 } 50% { opacity:0 } }`}</style>
    </footer>
  );
};

// ═════════════════════════════════════════════════════════════════════
// V2 — TACTICAL HUD FOOTER
// Dense command-center layout. Live-looking telemetry on the left,
// link grid in the middle, massive Discord CTA on the right.
// ═════════════════════════════════════════════════════════════════════

const HudFooter = () => {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => p + 1), 1200);
    return () => clearInterval(id);
  }, []);

  const squads = [
    { name: "DIVISION 2",     status: "LIVE", count: 42, color: RGA.green },
    { name: "DESTINY 2",      status: "LIVE", count: 38, color: RGA.green },
    { name: "HELLDIVERS 2",   status: "LIVE", count: 27, color: RGA.green },
    { name: "DEEP ROCK",      status: "IDLE", count: 14, color: RGA.cyan },
    { name: "MONSTER HUNTER", status: "LIVE", count: 19, color: RGA.green },
    { name: "ARMORED CORE",   status: "DARK", count:  3, color: RGA.muted },
  ];

  const navGroups = [
    { title: "OPERATIONS", items: ["Homepage", "Blog", "Series", "Bookmarks", "History"] },
    { title: "COMMUNITY",  items: ["Rules", "Members", "Events", "Streams", "Merch"] },
    { title: "DIVISIONS",  items: ["Division 2", "Destiny 2", "Helldivers 2", "Deep Rock", "All squads →"] },
    { title: "LEGAL",      items: ["Privacy", "Terms", "Contact", "Press kit"] },
  ];

  return (
    <footer style={{ position: "relative", background: RGA.void, color: RGA.text, fontFamily: "Outfit, system-ui, sans-serif", overflow: "hidden" }}>
      {/* top scanner bar */}
      <div style={{ position: "relative", height: 34, borderTop: `1px solid ${RGA.green}33`, borderBottom: `1px solid ${RGA.green}1a`, background: "rgba(0,255,65,0.03)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", height: "100%", gap: 40, padding: "0 32px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.3em", color: RGA.text2, textTransform: "uppercase" }}>
          <span><span style={{ color: RGA.green, marginRight: 8 }}>■</span>COMMS · OPEN</span>
          <span>TICK <span style={{ color: RGA.cyan }}>{String(pulse).padStart(6, "0")}</span></span>
          <span>LAT <span style={{ color: RGA.green }}>24ms</span></span>
          <span>NODES 06</span>
          <span>OPS 200</span>
          <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${RGA.green}33, transparent 60%)` }} />
          <span style={{ color: RGA.green }}>▲ REC</span>
          <span style={{ color: RGA.magenta }}>● TX</span>
          <span style={{ color: RGA.cyan }}>◆ SYNC</span>
        </div>
      </div>

      <Scanlines opacity={0.04} />
      <Noise opacity={0.035} />

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "56px 48px 0" }}>
        {/* hero row — title + subtext + cta */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 56, alignItems: "end", marginBottom: 56, paddingBottom: 40, borderBottom: `1px solid ${RGA.green}14` }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.4em", color: RGA.green, marginBottom: 20 }}>
              // BROADCAST_FOOTER · CH-042
            </div>
            <h2 style={{ fontFamily: "'Hanson Bold','Black Ops One',sans-serif", margin: 0, fontSize: 108, lineHeight: 0.86, letterSpacing: "0.01em", textTransform: "uppercase" }}>
              YOU LOST<br />
              <span style={{ color: RGA.green, textShadow: "0 0 28px rgba(0,255,65,0.45)" }}>SIGNAL?</span>
            </h2>
            <p style={{ fontSize: 17, color: RGA.text2, marginTop: 22, maxWidth: 520, lineHeight: 1.55 }}>
              The uplink stays open. Drop into Discord and squad up with 200 operators who chose friendship over frustration.
            </p>
          </div>

          <div style={{ position: "relative", padding: 28, background: "rgba(0,255,65,0.04)", border: `1px solid ${RGA.green}33` }}>
            <CornerBrackets color={RGA.green} size={14} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.3em", color: RGA.muted, marginBottom: 16 }}>
              <span>UPLINK · PRIMARY</span>
              <span style={{ color: RGA.green }}>● READY</span>
            </div>
            <div style={{ fontFamily: "'Hanson Bold','Black Ops One',sans-serif", fontSize: 44, lineHeight: 1, letterSpacing: "0.02em", marginBottom: 18, textTransform: "uppercase" }}>
              Join the<br /><span style={{ color: RGA.green, textShadow: "0 0 20px rgba(0,255,65,0.5)" }}>Discord</span>
            </div>
            <a
              href="#"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                padding: "16px 20px",
                background: RGA.green,
                color: RGA.void,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontSize: 13,
                textDecoration: "none",
                boxShadow: "0 0 28px rgba(0,255,65,0.35)",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <DiscordGlyph size={16} /> dc.roguearmy.xyz
              </span>
              <span>→</span>
            </a>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.25em", color: RGA.muted, marginTop: 12, display: "flex", justifyContent: "space-between" }}>
              <span>NO AUTH REQUIRED</span>
              <span style={{ color: RGA.cyan }}>17 ONLINE</span>
            </div>
          </div>
        </div>

        {/* telemetry + nav grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 48, paddingBottom: 56 }}>
          {/* LEFT: squad telemetry */}
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.35em", color: RGA.green, marginBottom: 16 }}>
              &gt;&gt; SQUAD TELEMETRY
            </div>
            <div style={{ border: `1px solid ${RGA.green}1f`, background: "rgba(10,10,10,0.6)" }}>
              {squads.map((s, i) => (
                <div
                  key={s.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 14px",
                    borderBottom: i === squads.length - 1 ? "none" : `1px solid ${RGA.green}10`,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11.5,
                  }}
                >
                  <span style={{ color: s.color, fontSize: 10 }}>■</span>
                  <span style={{ color: RGA.text, letterSpacing: "0.12em" }}>{s.name}</span>
                  <span style={{ color: s.color, letterSpacing: "0.25em" }}>{s.status}</span>
                  <span style={{ color: RGA.muted, minWidth: 32, textAlign: "right" }}>{String(s.count).padStart(3, "0")}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.25em", color: RGA.muted, display: "flex", justifyContent: "space-between" }}>
              <span>LIVE · REFRESH 60s</span>
              <span>TOTAL <span style={{ color: RGA.green }}>143</span></span>
            </div>
          </div>

          {/* RIGHT: nav columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
            {navGroups.map((g) => (
              <div key={g.title}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.35em", color: RGA.green, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, background: RGA.green, boxShadow: `0 0 6px ${RGA.green}` }} />
                  {g.title}
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {g.items.map((it) => (
                    <li key={it}>
                      <a href="#" style={{ fontSize: 14, color: RGA.text2, textDecoration: "none", letterSpacing: "0.02em" }}>
                        {it}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* bottom strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "22px 0 28px", borderTop: `1px solid ${RGA.green}14`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: RGA.muted, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <span style={{ color: RGA.green }}>[SYS]</span>
            <span>ROGUE_ARMY · v4.2.0</span>
            <span style={{ color: RGA.muted }}>//</span>
            <span style={{ color: RGA.green }}>ALL SYSTEMS NOMINAL</span>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            <span>© {new Date().getFullYear()} ROGUE ARMY</span>
            <span style={{ color: RGA.muted }}>//</span>
            <span>PRIVACY</span>
            <span>TERMS</span>
            <span>PRESS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ═════════════════════════════════════════════════════════════════════
// V3 — GIGANTIQUE WORDMARK FOOTER
// Minimalist. Everything is subordinate to an enormous "ROGUE ARMY"
// that doubles as a scroll-to-top anchor. Link row above, status below.
// ═════════════════════════════════════════════════════════════════════

const WordmarkFooter = () => {
  const linkGroups = [
    { label: "Community", items: ["Discord", "Rules", "Members", "Events"] },
    { label: "Content",   items: ["Blog", "Series", "Bookmarks", "History"] },
    { label: "Squads",    items: ["Division 2", "Destiny 2", "Helldivers 2", "More →"] },
    { label: "Legal",     items: ["Privacy", "Terms", "Contact"] },
  ];

  return (
    <footer style={{ position: "relative", background: RGA.void, color: RGA.text, fontFamily: "Outfit, system-ui, sans-serif", overflow: "hidden" }}>
      <GlitchSeparator primary={RGA.magenta} secondary={RGA.cyan} />
      <Scanlines opacity={0.04} />

      {/* colour wash */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,255,65,0.12) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 10% 10%, rgba(0,255,255,0.06) 0%, transparent 55%), radial-gradient(ellipse 40% 40% at 90% 30%, rgba(255,0,255,0.05) 0%, transparent 55%)",
        }}
      />

      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "72px 48px 0" }}>
        {/* upper stripe: kicker + CTA + social */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 32, alignItems: "center", paddingBottom: 40, borderBottom: `1px solid ${RGA.green}1a` }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.4em", color: RGA.muted, textTransform: "uppercase" }}>
            // END OF TRANSMISSION · SCROLL 100%
          </div>

          <a
            href="#"
            style={{
              justifySelf: "center",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 28px",
              background: "transparent",
              border: `1px solid ${RGA.green}`,
              color: RGA.green,
              textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.3em",
              fontSize: 12,
              textTransform: "uppercase",
              boxShadow: "0 0 18px rgba(0,255,65,0.18)",
            }}
          >
            <DiscordGlyph size={14} /> Join Discord <span style={{ color: RGA.green }}>▸</span>
          </a>

          <div style={{ justifySelf: "end", display: "flex", gap: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.3em", color: RGA.muted, textTransform: "uppercase" }}>
            <a href="#" style={{ color: RGA.text2, textDecoration: "none" }}>Twitch</a>
            <span style={{ color: RGA.muted }}>/</span>
            <a href="#" style={{ color: RGA.text2, textDecoration: "none" }}>YouTube</a>
            <span style={{ color: RGA.muted }}>/</span>
            <a href="#" style={{ color: RGA.text2, textDecoration: "none" }}>Bluesky</a>
            <span style={{ color: RGA.muted }}>/</span>
            <a href="#" style={{ color: RGA.text2, textDecoration: "none" }}>RSS</a>
          </div>
        </div>

        {/* link columns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, padding: "44px 0 40px" }}>
          {linkGroups.map((g) => (
            <div key={g.label}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.35em", color: RGA.green, marginBottom: 14, textTransform: "uppercase" }}>
                {g.label}
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                {g.items.map((it) => (
                  <li key={it}>
                    <a
                      href="#"
                      style={{
                        fontSize: 15,
                        color: RGA.text2,
                        textDecoration: "none",
                      }}
                    >
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* MASSIVE WORDMARK — goes edge to edge */}
      <div style={{ position: "relative", padding: "36px 0 12px", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Hanson Bold','Black Ops One',sans-serif",
            fontSize: "clamp(100px, 18vw, 300px)",
            lineHeight: 0.82,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            color: RGA.text,
            whiteSpace: "nowrap",
            background: `linear-gradient(180deg, ${RGA.text} 0%, ${RGA.text} 55%, rgba(255,255,255,0.15) 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ROGUE<span style={{
            background: `linear-gradient(90deg, ${RGA.green} 0%, ${RGA.cyan} 50%, ${RGA.magenta} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}> ARMY</span>
        </div>
        {/* chromatic echo */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            fontFamily: "'Hanson Bold','Black Ops One',sans-serif",
            fontSize: "clamp(100px, 18vw, 300px)",
            lineHeight: 0.82,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            textAlign: "center",
            padding: "36px 0 12px",
            whiteSpace: "nowrap",
            color: "transparent",
            textShadow: `-3px 0 ${RGA.cyan}33, 3px 0 ${RGA.magenta}33`,
            mixBlendMode: "screen",
          }}
        >
          ROGUE ARMY
        </div>
      </div>

      {/* baseline */}
      <div style={{ borderTop: `1px solid ${RGA.green}14`, padding: "20px 48px", maxWidth: 1480, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.22em", color: RGA.muted, textTransform: "uppercase" }}>
        <span>© {new Date().getFullYear()} ROGUE ARMY · ALL SIGNALS RESERVED</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 6, height: 6, background: RGA.green, boxShadow: `0 0 6px ${RGA.green}`, display: "inline-block" }} />
          STATUS · ONLINE
        </span>
      </div>
    </footer>
  );
};

// ═════════════════════════════════════════════════════════════════════
// V4 — CORRUPTED BROADCAST FOOTER
// Leans hardest into the brand: an ASCII skull, a scrolling marquee,
// RGB-split type, and a "channel guide" sitemap styled like an old
// cable overlay. High-personality, editorial close.
// ═════════════════════════════════════════════════════════════════════

const SKULL = [
  "         ▄▄███████████▄▄",
  "      ▄██▀▀           ▀▀██▄",
  "    ▄█▀                   ▀█▄",
  "   █▀    ▄█▀▀▀█▄   ▄█▀▀▀█▄   ▀█",
  "  █▌    ██  ▀  █▌ █▌  ▀  ██   ▐█",
  "  █     ██     █▌ █▌     ██    █",
  "  █▌    ▀█▄▄▄█▀   ▀█▄▄▄█▀    ▐█",
  "   █▄        ▄▄█████▄▄        ▄█",
  "    █▄      █▄█ █ █ █▄█      ▄█",
  "     ▀█▄▄     ▀▀▀▀▀▀▀     ▄▄█▀",
  "        ▀▀██▄▄▄▄▄▄▄▄▄▄▄██▀▀",
];

const CorruptedFooter = () => {
  const marqueeItems = [
    "NO TOXICITY", "NO SWEATS", "ADULTS 25+", "SIX ACTIVE SQUADS",
    "WEEKLY OPS", "BLOG UPDATED DAILY", "200 OPERATORS ONLINE",
    "BROADCAST FROM THE VOID", "JOIN THE DISCORD", "⟁ SIGNAL STABLE ⟁",
  ];
  const loop = [...marqueeItems, ...marqueeItems];

  const channels = [
    { ch: "01", name: "HOMEPAGE",   status: "LIVE" },
    { ch: "02", name: "BLOG",       status: "LIVE" },
    { ch: "03", name: "SERIES",     status: "LIVE" },
    { ch: "04", name: "DISCORD",    status: "LIVE" },
    { ch: "05", name: "EVENTS",     status: "LIVE" },
    { ch: "06", name: "MEMBERS",    status: "AUTH" },
    { ch: "07", name: "RULES",      status: "LIVE" },
    { ch: "08", name: "PRIVACY",    status: "LIVE" },
    { ch: "09", name: "TERMS",      status: "LIVE" },
    { ch: "10", name: "PRESS KIT",  status: "LIVE" },
    { ch: "11", name: "CONTACT",    status: "LIVE" },
    { ch: "12", name: "VOID",       status: "DARK" },
  ];

  return (
    <footer style={{ position: "relative", background: RGA.void, color: RGA.text, fontFamily: "Outfit, system-ui, sans-serif", overflow: "hidden" }}>
      {/* scrolling marquee top */}
      <div
        style={{
          position: "relative",
          borderTop: `1px solid ${RGA.magenta}40`,
          borderBottom: `1px solid ${RGA.magenta}40`,
          background: "rgba(255,0,255,0.04)",
          overflow: "hidden",
          height: 42,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 48,
            alignItems: "center",
            height: "100%",
            animation: "rga-marquee 38s linear infinite",
            whiteSpace: "nowrap",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.35em",
            color: RGA.text,
            textTransform: "uppercase",
            paddingLeft: 48,
          }}
        >
          {loop.map((t, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 48 }}>
              <span style={{ color: RGA.magenta }}>◆</span>
              <span style={{ color: i % 3 === 0 ? RGA.green : i % 3 === 1 ? RGA.cyan : RGA.text }}>{t}</span>
            </span>
          ))}
        </div>
        <Scanlines opacity={0.07} />
      </div>

      {/* main body */}
      <div style={{ position: "relative", padding: "64px 48px 0", maxWidth: 1480, margin: "0 auto" }}>
        {/* atmospheric vignette */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 70% 60% at 20% 40%, rgba(0,255,255,0.06) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 80%, rgba(255,0,255,0.07) 0%, transparent 55%)",
          }}
        />
        <Noise opacity={0.05} />

        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 56, alignItems: "start", position: "relative" }}>
          {/* ASCII skull */}
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.35em", color: RGA.muted, marginBottom: 14 }}>
              // RENDER: /assets/skull.ascii
            </div>
            <pre
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                lineHeight: 1.05,
                color: RGA.green,
                margin: 0,
                textShadow: `-1.5px 0 ${RGA.cyan}aa, 1.5px 0 ${RGA.magenta}aa`,
                filter: "drop-shadow(0 0 12px rgba(0,255,65,0.35))",
              }}
            >
              {SKULL.join("\n")}
            </pre>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.3em", color: RGA.muted, marginTop: 14, textAlign: "center" }}>
              ▄ EST. 2019 · WE NEVER LOG OFF ▄
            </div>
          </div>

          {/* headline + channel grid */}
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.4em", color: RGA.magenta, marginBottom: 14 }}>
              // CHANNEL GUIDE · CH 001–012
            </div>
            <h2
              style={{
                fontFamily: "'Hanson Bold','Black Ops One',sans-serif",
                fontSize: 96,
                lineHeight: 0.85,
                letterSpacing: "0.01em",
                margin: 0,
                textTransform: "uppercase",
                color: RGA.text,
                textShadow: `-2px 0 ${RGA.cyan}, 2px 0 ${RGA.magenta}`,
              }}
            >
              Still<br />broadcasting.
            </h2>
            <p style={{ fontSize: 16, color: RGA.text2, marginTop: 18, maxWidth: 540, lineHeight: 1.55 }}>
              Twelve channels, one Discord, zero cover charge. Pick a signal and join the transmission.
            </p>

            {/* channel grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0, marginTop: 32, border: `1px solid ${RGA.magenta}2e` }}>
              {channels.map((c, i) => {
                const col = c.status === "DARK" ? RGA.muted : c.status === "AUTH" ? RGA.cyan : RGA.green;
                return (
                  <a
                    key={c.ch}
                    href="#"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      padding: "14px 14px 16px",
                      borderRight: (i + 1) % 6 === 0 ? "none" : `1px solid ${RGA.magenta}1f`,
                      borderBottom: i < 6 ? `1px solid ${RGA.magenta}1f` : "none",
                      textDecoration: "none",
                      background: "rgba(0,0,0,0.25)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, letterSpacing: "0.25em", color: RGA.muted }}>
                      <span>CH·{c.ch}</span>
                      <span style={{ color: col }}>{c.status}</span>
                    </div>
                    <div style={{ fontSize: 14, color: RGA.text, letterSpacing: "0.08em" }}>{c.name}</div>
                  </a>
                );
              })}
            </div>

            {/* CTA + tuning row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginTop: 32 }}>
              <a
                href="#"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "16px 22px",
                  background: RGA.magenta,
                  color: RGA.void,
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  fontSize: 13,
                  textDecoration: "none",
                  boxShadow: "0 0 28px rgba(255,0,255,0.4)",
                }}
              >
                <DiscordGlyph size={16} /> Tune into Discord <span>⟶</span>
              </a>

              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.3em", color: RGA.muted, display: "flex", gap: 14 }}>
                <span>TUNING 94.7</span>
                <span style={{ color: RGA.magenta }}>■</span>
                <span style={{ color: RGA.cyan }}>■</span>
                <span style={{ color: RGA.green }}>■</span>
                <span>STABLE</span>
              </div>
            </div>
          </div>
        </div>

        {/* baseline */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 22,
            paddingBottom: 24,
            borderTop: `1px solid ${RGA.magenta}22`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.22em",
            color: RGA.muted,
            textTransform: "uppercase",
          }}
        >
          <span>© {new Date().getFullYear()} ROGUE ARMY · TRANSMITTING FROM THE VOID</span>
          <span>
            BUILT WITH <span style={{ color: RGA.green }}>&lt;/&gt;</span> &nbsp;AND&nbsp;
            <span style={{ color: RGA.magenta }}>♥</span>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes rga-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </footer>
  );
};

// ═════════════════════════════════════════════════════════════════════
// Export all
// ═════════════════════════════════════════════════════════════════════

Object.assign(window, {
  TerminalFooter,
  HudFooter,
  WordmarkFooter,
  CorruptedFooter,
});
