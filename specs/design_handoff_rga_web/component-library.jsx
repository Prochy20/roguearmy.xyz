/* global React */
const { useEffect, useMemo, useRef, useState } = React;

// ═════════════════════════════════════════════════════════════════════
// RGA · About the Community
// Reuses the Corrupted Signal palette + numbered-section grammar from
// the manifesto, but rebuilt around story / values / people / numbers.
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
  text2: "#A8A8A8",
  text3: "#888888",
  muted: "#555555",
  border: "rgba(0,255,65,0.12)",
  borderHot: "rgba(0,255,65,0.35)",
};

const FONT_DISPLAY = "'Hanson Bold','Black Ops One',sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";
const FONT_BODY = "Outfit, system-ui, sans-serif";

// ═══════════════════════════════════════════════════════════════════════
// Atmosphere
// ═══════════════════════════════════════════════════════════════════════

const Scanlines = ({ opacity = 0.04 }) => (
  <div
    aria-hidden="true"
    style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      opacity,
      zIndex: 1,
      backgroundImage:
        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
    }}
  />
);

const Vignette = () => (
  <div
    aria-hidden="true"
    style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 0,
      background:
        "radial-gradient(ellipse 70% 50% at 80% -10%, rgba(0,255,65,0.10) 0%, transparent 55%)," +
        "radial-gradient(ellipse 50% 40% at 5% 5%, rgba(0,255,255,0.06) 0%, transparent 60%)," +
        "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(255,0,255,0.05) 0%, transparent 55%)",
    }}
  />
);

const StatusDot = ({ color = RGA.green, pulse = true }) => (
  <span
    aria-hidden="true"
    style={{
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: 1,
      background: color,
      boxShadow: `0 0 8px ${color}`,
      marginRight: 10,
      animation: pulse ? "rgaDotPulse 2s ease-in-out infinite" : "none",
    }}
  />
);

// Monospace striped placeholder — reusable for any image we don't have.
const Placeholder = ({ label, ratio = "1 / 1", tone = "green", style = {} }) => {
  const c = tone === "cyan" ? RGA.cyan : tone === "magenta" ? RGA.magenta : RGA.green;
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: ratio,
        background:
          `repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 12px), ` +
          `linear-gradient(180deg, #0d0d0d 0%, #060606 100%)`,
        border: `1px solid ${RGA.border}`,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 70% at 50% 50%, ${c}11 0%, transparent 60%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          fontFamily: FONT_MONO,
          fontSize: 9,
          letterSpacing: "0.3em",
          color: c,
          opacity: 0.85,
        }}
      >
        ◧ {label}
      </div>
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 10,
          fontFamily: FONT_MONO,
          fontSize: 9,
          letterSpacing: "0.25em",
          color: RGA.muted,
        }}
      >
        DROP_IMAGE
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Generic chrome
// ═══════════════════════════════════════════════════════════════════════

const SectionHeader = ({ num, kicker, title, eyebrow }) => (
  <header
    style={{
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      gap: 32,
      alignItems: "baseline",
      paddingBottom: 28,
      marginBottom: 36,
      borderBottom: `1px solid ${RGA.border}`,
    }}
  >
    <div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: "0.35em",
          color: RGA.green,
        }}
      >
        SEC_{num}
      </div>
      {eyebrow && (
        <div
          style={{
            marginTop: 10,
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.25em",
            color: RGA.muted,
          }}
        >
          {eyebrow}
        </div>
      )}
    </div>
    <div>
      {kicker && (
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 12,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: RGA.text3,
            marginBottom: 12,
          }}
        >
          {kicker}
        </div>
      )}
      <h2
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: "clamp(40px, 5.5vw, 88px)",
          lineHeight: 0.92,
          letterSpacing: "0.005em",
          textTransform: "uppercase",
          margin: 0,
          color: RGA.text,
          textWrap: "balance",
        }}
      >
        {title}
      </h2>
    </div>
  </header>
);

// Numbered cell used for values + how-we-operate items
const NumberedCell = ({ num, title, body, accent = RGA.green }) => (
  <div
    style={{
      position: "relative",
      padding: "32px 28px 30px",
      border: `1px solid ${RGA.border}`,
      background: "rgba(255,255,255,0.012)",
      transition: "background .25s, border-color .25s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(0,255,65,0.04)";
      e.currentTarget.style.borderColor = RGA.borderHot;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "rgba(255,255,255,0.012)";
      e.currentTarget.style.borderColor = RGA.border;
    }}
  >
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 14,
        right: 16,
        fontFamily: FONT_MONO,
        fontSize: 10,
        letterSpacing: "0.3em",
        color: accent,
      }}
    >
      V_{num}
    </span>
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 26,
        lineHeight: 1.05,
        letterSpacing: "0.01em",
        textTransform: "uppercase",
        color: RGA.text,
        marginBottom: 14,
        paddingRight: 40,
      }}
    >
      {title}
    </div>
    <p
      style={{
        margin: 0,
        fontFamily: FONT_BODY,
        fontSize: 15.5,
        lineHeight: 1.6,
        color: RGA.text2,
      }}
    >
      {body}
    </p>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// 1. HERO
// ═══════════════════════════════════════════════════════════════════════

const Hero = ({ glow }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const time = new Date(Date.now() + tick * 0).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <section
      data-screen-label="01 Hero"
      style={{
        position: "relative",
        padding: "120px 64px 88px",
        maxWidth: 1480,
        margin: "0 auto",
      }}
    >
      {/* breadcrumb / status strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: RGA.muted,
          marginBottom: 36,
        }}
      >
        <StatusDot />
        <span style={{ color: RGA.green }}>ROGUE_ARMY</span>
        <span>/</span>
        <span style={{ color: RGA.text2 }}>COMPONENTS</span>
        <span>/</span>
        <span style={{ color: RGA.text }}>INDEX</span>
        <span
          style={{
            flex: 1,
            maxWidth: 320,
            height: 1,
            background: `linear-gradient(90deg, ${RGA.green}33, transparent)`,
          }}
        />
        <span style={{ color: RGA.text3 }}>SIGNAL · STABLE</span>
        <span style={{ color: RGA.text }}>{time} UTC</span>
      </div>

      {/* kicker */}
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 13,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: RGA.green,
          marginBottom: 22,
        }}
      >
        // The Corrupted Signal component library · v1.0
      </div>

      {/* gigantic headline — split across two rows for rhythm */}
      <h1
        style={{
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontSize: "clamp(80px, 13vw, 220px)",
          lineHeight: 0.84,
          letterSpacing: "-0.005em",
          textTransform: "uppercase",
          color: RGA.text,
          textShadow:
            glow > 0
              ? `-${2 * glow}px 0 ${RGA.cyan}66, ${2 * glow}px 0 ${RGA.magenta}55, 0 0 ${30 * glow}px rgba(0,255,65,${0.2 * glow})`
              : "none",
        }}
      >
        We are
        <br />
        Component{" "}
        <span
          style={{
            color: RGA.green,
            textShadow:
              glow > 0
                ? `0 0 ${24 * glow}px rgba(0,255,65,${0.55 * glow}), 0 0 ${50 * glow}px rgba(0,255,65,${0.25 * glow})`
                : "none",
          }}
        >
          Library
        </span>
        <span style={{ color: RGA.green }}>.</span>
      </h1>

      {/* subdeck */}
      <div
        style={{
          marginTop: 44,
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 56,
          alignItems: "start",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: FONT_BODY,
            fontSize: 22,
            lineHeight: 1.45,
            color: RGA.text2,
            maxWidth: 720,
            textWrap: "pretty",
          }}
        >
          Every block on this page is a copy-pasteable component used across the
          Rogue Army site. Same palette, same grammar: <strong style={{ color: RGA.text }}>numbered
          sections</strong>, <strong style={{ color: RGA.text }}>monospace metadata</strong>,
          striped placeholders for any image we don't have yet. Pick one, copy the markup,
          swap the content.
        </p>

        <div
          style={{
            border: `1px solid ${RGA.border}`,
            background: "rgba(0,0,0,0.4)",
            padding: 22,
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.35em",
              color: RGA.green,
              marginBottom: 14,
            }}
          >
            // FILE_HEADER
          </div>
          <MetaRow label="System" value="Corrupted Signal" mono />
          <MetaRow label="Version" value="v1.0.4" mono />
          <MetaRow label="Components" value="24" mono />
          <MetaRow label="Tokens" value="green / cyan / magenta" />
          <MetaRow label="Type" value="Hanson · JetBrains · Outfit" />
          <MetaRow label="Status" value="▲ stable" />
        </div>
      </div>

      {/* anchor rail */}
      <div
        style={{
          marginTop: 64,
          display: "flex",
          gap: 0,
          borderTop: `1px solid ${RGA.border}`,
          borderBottom: `1px solid ${RGA.border}`,
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: "0.25em",
        }}
      >
        {[
          ["02", "Values"],
          ["03", "Numbers"],
          ["04", "Origin"],
          ["05", "The Mods"],
          ["06", "What we play"],
          ["07", "Voices"],
          ["08", "Compare"],
          ["09", "FAQ"],
          ["10", "Channels"],
          ["11", "Transmissions"],
          ["12", "Join"],
        ].map(([n, label], i, arr) => (
          <a
            key={n}
            href={`#sec-${n}`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(`sec-${n}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={{
              flex: 1,
              padding: "16px 18px",
              borderRight: i < arr.length - 1 ? `1px solid ${RGA.border}` : "none",
              color: RGA.text3,
              textDecoration: "none",
              textTransform: "uppercase",
              display: "flex",
              gap: 12,
              alignItems: "center",
              transition: "color .15s, background .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = RGA.text;
              e.currentTarget.style.background = "rgba(0,255,65,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = RGA.text3;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ color: RGA.green }}>{n}</span>
            <span>{label}</span>
          </a>
        ))}
      </div>
    </section>
  );
};

const MetaRow = ({ label, value, mono }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "7px 0",
      fontSize: 12,
      borderBottom: `1px dashed rgba(0,255,65,0.08)`,
    }}
  >
    <span
      style={{
        color: RGA.muted,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        fontFamily: FONT_MONO,
      }}
    >
      {label}
    </span>
    <span
      style={{
        color: RGA.text,
        fontFamily: mono ? FONT_MONO : FONT_BODY,
        letterSpacing: mono ? "0.05em" : "0",
      }}
    >
      {value}
    </span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// 2. PULL QUOTE / WHAT WE'RE NOT
// ═══════════════════════════════════════════════════════════════════════

const PullStrip = () => (
  <section
    data-screen-label="02 Pull"
    style={{
      borderTop: `1px solid ${RGA.border}`,
      borderBottom: `1px solid ${RGA.border}`,
      background: "rgba(0,255,65,0.025)",
      position: "relative",
    }}
  >
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        background:
          "repeating-linear-gradient(90deg, transparent 0 80px, rgba(0,255,65,0.04) 80px 81px)",
      }}
    />
    <div
      style={{
        position: "relative",
        maxWidth: 1480,
        margin: "0 auto",
        padding: "72px 64px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 56,
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            letterSpacing: "0.35em",
            color: RGA.green,
            marginBottom: 18,
          }}
        >
          // POSITION_STATEMENT
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(34px, 4vw, 54px)",
            lineHeight: 1.05,
            letterSpacing: "0.01em",
            textTransform: "uppercase",
            color: RGA.text,
            textWrap: "balance",
          }}
        >
          We're not a clan,
          <br />
          a guild, or a brand.
          <br />
          <span style={{ color: RGA.green }}>We're a group chat</span>{" "}
          that grew up.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {[
          { hot: false, label: "We're not", text: "a content engine, an esports org, or a recruiting funnel" },
          { hot: false, label: "We're not", text: "a place to grind for clout, badges, or a streamer position" },
          { hot: true, label: "We are", text: "a small, slow, mod-tended garden of friends who happen to play games" },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: 24,
              alignItems: "baseline",
              paddingBottom: 16,
              borderBottom: `1px solid ${RGA.border}`,
            }}
          >
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: row.hot ? RGA.green : RGA.muted,
              }}
            >
              {row.label}
            </div>
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: 18,
                lineHeight: 1.45,
                color: row.hot ? RGA.text : RGA.text2,
              }}
            >
              {row.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════
// 3. VALUES
// ═══════════════════════════════════════════════════════════════════════

const VALUES = [
  {
    num: "01",
    title: "Kindness with edges",
    body:
      "Everybody here can take a joke and most of us are funny. Nobody here punches down. Sharp wit, soft landing.",
  },
  {
    num: "02",
    title: "Slow over loud",
    body:
      "Drops in #news once a week. No notification spam. No engagement bait. The pace is set by what's actually worth saying.",
  },
  {
    num: "03",
    title: "Play your way",
    body:
      "Optimal builds and chill builds share a server. No backseating, no sweat-shaming, no lectures about how the game is 'supposed' to be played.",
  },
  {
    num: "04",
    title: "Mods are people",
    body:
      "Six volunteers, no algorithm. We read context, we get things wrong, we listen when you say so. Decisions are made in public.",
  },
  {
    num: "05",
    title: "Privacy by default",
    body:
      "No analytics, no ads, no data sales, no payment rails. We collect what we need to authenticate you and that's the whole list.",
  },
  {
    num: "06",
    title: "Adults only",
    body:
      "25+ for a reason. Childcare, mortgages, jobs that own us — that shared context is what lets the room talk like adults.",
  },
];

const ValuesSection = () => (
  <section
    id="sec-02"
    data-screen-label="03 Values"
    style={{
      maxWidth: 1480,
      margin: "0 auto",
      padding: "112px 64px",
      position: "relative",
    }}
  >
    <SectionHeader
      num="02"
      eyebrow="6 ITEMS"
      kicker="// What this place runs on"
      title={<>The values, written down.</>}
    />
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridAutoRows: "1fr",
        gap: 0,
        border: `1px solid ${RGA.border}`,
      }}
    >
      {VALUES.map((v, i) => (
        <div
          key={v.num}
          style={{
            borderRight: i % 3 < 2 ? `1px solid ${RGA.border}` : "none",
            borderBottom: i < 3 ? `1px solid ${RGA.border}` : "none",
          }}
        >
          <NumberedCell num={v.num} title={v.title} body={v.body} />
        </div>
      ))}
    </div>
    <div
      style={{
        marginTop: 22,
        display: "flex",
        justifyContent: "space-between",
        fontFamily: FONT_MONO,
        fontSize: 10,
        letterSpacing: "0.25em",
        color: RGA.muted,
        textTransform: "uppercase",
      }}
    >
      <span>// VALUES.LOG · v3.1 · last edited 04.12.2026</span>
      <a
        href="#"
        style={{ color: RGA.text3, textDecoration: "none", borderBottom: `1px solid ${RGA.border}` }}
      >
        See the rules →
      </a>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════
// 4. NUMBERS — odometer-ish stats
// ═══════════════════════════════════════════════════════════════════════

const useCountUp = (target, duration = 1400) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
};

const StatCell = ({ value, suffix = "", label, sub, tone = "green" }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const c = tone === "cyan" ? RGA.cyan : tone === "magenta" ? RGA.magenta : RGA.green;
  const display = useCountUp(visible ? value : 0);
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        padding: "40px 32px 32px",
        borderRight: `1px solid ${RGA.border}`,
        background: "rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: "0.3em",
          color: c,
          marginBottom: 16,
        }}
      >
        // {label}
      </div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: "clamp(54px, 5vw, 88px)",
          lineHeight: 0.88,
          letterSpacing: "0.005em",
          color: RGA.text,
          textShadow: `0 0 30px ${c}55`,
        }}
      >
        {display.toLocaleString()}
        <span style={{ color: c, fontSize: "0.55em" }}>{suffix}</span>
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: FONT_BODY,
          fontSize: 14,
          color: RGA.text3,
          letterSpacing: "0.04em",
          maxWidth: 230,
          lineHeight: 1.45,
        }}
      >
        {sub}
      </div>
    </div>
  );
};

const NumbersSection = () => (
  <section
    id="sec-03"
    data-screen-label="04 Numbers"
    style={{
      borderTop: `1px solid ${RGA.border}`,
      borderBottom: `1px solid ${RGA.border}`,
      background: "rgba(0,0,0,0.4)",
      position: "relative",
    }}
  >
    <div
      style={{
        maxWidth: 1480,
        margin: "0 auto",
        padding: "96px 64px",
      }}
    >
      <SectionHeader
        num="03"
        eyebrow="LIVE_FEED"
        kicker="// By the numbers, today"
        title={<>Small on purpose.</>}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          border: `1px solid ${RGA.border}`,
        }}
      >
        <StatCell value={2847} label="MEMBERS" sub="Active in the last 30 days. We don't pad the count." tone="green" />
        <StatCell value={6} label="MODS" sub="Six volunteers, in four countries, on first-name basis." tone="cyan" />
        <StatCell value={37} label="COUNTRIES" sub="From Tokyo to Bogotá. Voice nights work in your timezone." tone="green" />
        <StatCell value={0} suffix=" $" label="ANNUAL_FEE" sub="No paywall, no patreon, no merch funnel. Never has been." tone="magenta" />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          borderLeft: `1px solid ${RGA.border}`,
          borderRight: `1px solid ${RGA.border}`,
          borderBottom: `1px solid ${RGA.border}`,
        }}
      >
        <StatCell value={32} label="MEDIAN_AGE" sub="Members skew 25–40. The oldest is 61 and out-K/Ds most of us." tone="green" />
        <StatCell value={194} label="VOICE_NIGHTS_2025" sub="Scheduled co-op evenings. Plus countless unscheduled ones." tone="cyan" />
        <StatCell value={42} label="GAMES_PLAYED" sub="Across all squads in 2025. We don't lock to a single title." tone="green" />
        <StatCell value={3} label="BANS_2025" sub="Total. Two for racism, one for cheating. We document each one." tone="magenta" />
      </div>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: "0.25em",
          color: RGA.muted,
          textTransform: "uppercase",
        }}
      >
        <span>// pulled live from /api/community.json · refreshes hourly</span>
        <span>NEXT_REFRESH 00:42:11</span>
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════
// 5. ORIGIN — timeline
// ═══════════════════════════════════════════════════════════════════════

const TIMELINE = [
  {
    year: "2019",
    code: "T_00",
    title: "Six friends in a Discord",
    body:
      "Started as a private server for six players who'd hit their thirties and stopped finding each other in lobbies. Named on a dare. The 'Rogue Army' branding was a joke that stuck.",
  },
  {
    year: "2020",
    code: "T_01",
    title: "The lockdown bump",
    body:
      "Word-of-mouth tripled the count. The 25+ minimum was set the night somebody's cousin asked to join — not as a wall, but to keep the room talking like adults.",
  },
  {
    year: "2022",
    code: "T_02",
    title: "Manifesto v1",
    body:
      "Wrote the rules down. Banned the first cheater. Kicked the first dogpiler. Decided we'd document every removal in public from then on. Nothing has changed about that.",
  },
  {
    year: "2024",
    code: "T_03",
    title: "Site goes up",
    body:
      "Volunteer-built. No analytics, no ads, no payments. roguearmy.xyz is just somewhere to read what we've been talking about, in long form, when Discord eats it.",
  },
  {
    year: "2026",
    code: "T_NOW",
    title: "Where we are now",
    body:
      "Two thousand-something members. Six mods. Same rules, same vibe, same minimum age. We will turn down growth before we turn down quality.",
    current: true,
  },
];

const OriginSection = () => (
  <section
    id="sec-04"
    data-screen-label="05 Origin"
    style={{
      maxWidth: 1480,
      margin: "0 auto",
      padding: "112px 64px",
    }}
  >
    <SectionHeader
      num="04"
      eyebrow="LOG · 2019 → 2026"
      kicker="// How we got here"
      title={<>Seven years, six friends, no investors.</>}
    />

    <ol
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        position: "relative",
      }}
    >
      {/* spine */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 90,
          top: 6,
          bottom: 6,
          width: 1,
          background: `linear-gradient(180deg, transparent, ${RGA.green}55 6%, ${RGA.green}33 88%, transparent)`,
        }}
      />
      {TIMELINE.map((t, i) => (
        <li
          key={t.code}
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: 32,
            paddingBottom: i === TIMELINE.length - 1 ? 0 : 36,
            paddingTop: i === 0 ? 0 : 0,
            position: "relative",
          }}
        >
          {/* node */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 84,
              top: 8,
              width: 13,
              height: 13,
              border: `1px solid ${t.current ? RGA.green : RGA.borderHot}`,
              background: t.current ? RGA.green : RGA.void,
              boxShadow: t.current ? `0 0 14px ${RGA.green}` : "none",
              transform: "rotate(45deg)",
            }}
          />
          <div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 38,
                lineHeight: 1,
                color: t.current ? RGA.green : RGA.text,
                letterSpacing: "0.01em",
              }}
            >
              {t.year}
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: FONT_MONO,
                fontSize: 10,
                letterSpacing: "0.35em",
                color: RGA.muted,
              }}
            >
              {t.code}
            </div>
          </div>
          <div style={{ paddingLeft: 36, paddingTop: 4, maxWidth: 720 }}>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 22,
                letterSpacing: "0.01em",
                textTransform: "uppercase",
                color: RGA.text,
                marginBottom: 10,
              }}
            >
              {t.title}
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: FONT_BODY,
                fontSize: 16,
                lineHeight: 1.6,
                color: RGA.text2,
              }}
            >
              {t.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════
// 6. MOD SQUAD
// ═══════════════════════════════════════════════════════════════════════

const MODS = [
  { handle: "ashley", role: "Founder · Privacy", since: "2019", note: "Wrote the rules. Reads every report.", tone: "green" },
  { handle: "carter", role: "Voice nights", since: "2019", note: "Schedules the Friday co-op. Owns the bracket.", tone: "cyan" },
  { handle: "d3v", role: "Site & infra", since: "2024", note: "Volunteer-built the site you're reading.", tone: "green" },
  { handle: "june", role: "Onboarding", since: "2021", note: "Says hi to everyone in #welcome, by hand.", tone: "cyan" },
  { handle: "koyo", role: "APAC voice nights", since: "2022", note: "Tokyo timezone. Runs Saturday afternoon EU = morning JP.", tone: "magenta" },
  { handle: "q", role: "Strikes & appeals", since: "2020", note: "Owns the strike log. Always replies within 48h.", tone: "green" },
];

const ModCard = ({ mod }) => (
  <article
    style={{
      border: `1px solid ${RGA.border}`,
      background: "rgba(0,0,0,0.4)",
      padding: 22,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      position: "relative",
      transition: "border-color .2s, background .2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = RGA.borderHot;
      e.currentTarget.style.background = "rgba(0,255,65,0.04)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = RGA.border;
      e.currentTarget.style.background = "rgba(0,0,0,0.4)";
    }}
  >
    <Placeholder label={`PORTRAIT · @${mod.handle}`} ratio="4 / 5" tone={mod.tone} />
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 22,
            letterSpacing: "0.02em",
            color: RGA.text,
            textTransform: "uppercase",
          }}
        >
          @{mod.handle}
        </div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.3em",
            color: RGA.muted,
          }}
        >
          MOD · {mod.since}
        </div>
      </div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: "0.2em",
          color: RGA.green,
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {mod.role}
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: FONT_BODY,
          fontSize: 14.5,
          lineHeight: 1.55,
          color: RGA.text2,
        }}
      >
        {mod.note}
      </p>
    </div>
  </article>
);

const ModsSection = () => (
  <section
    id="sec-05"
    data-screen-label="06 Mods"
    style={{
      borderTop: `1px solid ${RGA.border}`,
      background: "rgba(0,255,65,0.018)",
    }}
  >
    <div
      style={{
        maxWidth: 1480,
        margin: "0 auto",
        padding: "112px 64px",
      }}
    >
      <SectionHeader
        num="05"
        eyebrow="6 HUMANS"
        kicker="// The volunteers running it"
        title={<>The mod team. No algorithm.</>}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
        }}
      >
        {MODS.map((m) => (
          <ModCard key={m.handle} mod={m} />
        ))}
      </div>
      <div
        style={{
          marginTop: 32,
          padding: "22px 28px",
          border: `1px solid ${RGA.border}`,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          gap: 22,
          alignItems: "center",
          fontFamily: FONT_MONO,
          fontSize: 12,
          letterSpacing: "0.15em",
          color: RGA.text2,
        }}
      >
        <span style={{ color: RGA.green, letterSpacing: "0.3em" }}>// REPORTING</span>
        <span style={{ color: RGA.text3 }}>
          See something? DM any mod, or @mod in any channel. Average response time:{" "}
          <span style={{ color: RGA.text }}>under 4 hours</span>. Every action is logged in #mod-actions.
        </span>
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════
// 7. WHAT WE PLAY
// ═══════════════════════════════════════════════════════════════════════

const ROTATION = [
  { tag: "RAID", name: "Helldivers 2", squad: "Wed nights · 8pm ET", count: 28, hot: true },
  { tag: "MMO", name: "Final Fantasy XIV", squad: "Free Company · Phantom", count: 64 },
  { tag: "COOP", name: "Deep Rock Galactic", squad: "Greenbeards welcome", count: 41 },
  { tag: "PVP", name: "The Finals", squad: "Friday squads", count: 19 },
  { tag: "SOLO", name: "Elden Ring · DLC", squad: "Spoiler-free in #spoilers", count: 53, hot: true },
  { tag: "INDIE", name: "Balatro", squad: "Slack-style runs in #cards", count: 37 },
];

const PlayingSection = () => (
  <section
    id="sec-06"
    data-screen-label="07 Playing"
    style={{
      maxWidth: 1480,
      margin: "0 auto",
      padding: "112px 64px",
    }}
  >
    <SectionHeader
      num="06"
      eyebrow="ROTATION · 2026.04"
      kicker="// Currently in voice"
      title={<>What we're actually playing.</>}
    />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
      }}
    >
      {ROTATION.map((r, i) => (
        <article
          key={r.name}
          style={{
            border: `1px solid ${r.hot ? RGA.borderHot : RGA.border}`,
            background: r.hot ? "rgba(0,255,65,0.05)" : "rgba(0,0,0,0.4)",
            padding: 0,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Placeholder
            label={`KEY_ART · ${r.name.toUpperCase()}`}
            ratio="16 / 9"
            tone={r.hot ? "green" : i % 2 ? "cyan" : "green"}
            style={{ borderLeft: 0, borderRight: 0, borderTop: 0 }}
          />
          <div style={{ padding: "22px 24px 24px" }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 12,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  letterSpacing: "0.3em",
                  padding: "4px 8px",
                  border: `1px solid ${r.hot ? RGA.borderHot : RGA.border}`,
                  color: r.hot ? RGA.green : RGA.text3,
                }}
              >
                {r.tag}
              </span>
              {r.hot && (
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    letterSpacing: "0.3em",
                    color: RGA.magenta,
                  }}
                >
                  ● HOT
                </span>
              )}
              <span style={{ flex: 1 }} />
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: RGA.text3,
                  letterSpacing: "0.1em",
                }}
              >
                {r.count} playing
              </span>
            </div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 26,
                lineHeight: 1.05,
                letterSpacing: "0.005em",
                textTransform: "uppercase",
                color: RGA.text,
                marginBottom: 8,
              }}
            >
              {r.name}
            </div>
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: 14,
                color: RGA.text3,
              }}
            >
              {r.squad}
            </div>
          </div>
        </article>
      ))}
    </div>

    <div
      style={{
        marginTop: 22,
        fontFamily: FONT_MONO,
        fontSize: 10,
        letterSpacing: "0.25em",
        color: RGA.muted,
        textTransform: "uppercase",
      }}
    >
      // Plus 36 more squads — see /games for the full list
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════
// 8. VOICES — testimonials
// ═══════════════════════════════════════════════════════════════════════

const QUOTES = [
  {
    handle: "ragingdad",
    age: 38,
    since: "2020",
    quote:
      "First server I've stayed in past the honeymoon. The 25+ thing matters more than I thought it would — the conversations are different.",
  },
  {
    handle: "miranda.exe",
    age: 31,
    since: "2022",
    quote:
      "I joined for raids, stayed for the cooking thread in #off-topic. Three years in, half my best friends are people I've never met in person.",
  },
  {
    handle: "kobu",
    age: 44,
    since: "2021",
    quote:
      "The mods actually mod. I've watched them handle stuff in real time and it has never felt like a corporate ban-bot.",
  },
  {
    handle: "halv",
    age: 27,
    since: "2024",
    quote:
      "I'm one of the youngest here and I love it. Nobody's posting clips. Nobody's chasing followers. We just play and talk.",
  },
];

const VoicesSection = () => (
  <section
    id="sec-07"
    data-screen-label="08 Voices"
    style={{
      borderTop: `1px solid ${RGA.border}`,
      borderBottom: `1px solid ${RGA.border}`,
      background: "rgba(0,0,0,0.45)",
    }}
  >
    <div
      style={{
        maxWidth: 1480,
        margin: "0 auto",
        padding: "112px 64px",
      }}
    >
      <SectionHeader
        num="07"
        eyebrow="MEMBER_LOG · UNEDITED"
        kicker="// Pulled from #welcome anniversaries"
        title={<>What members say, in their own words.</>}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 0,
          border: `1px solid ${RGA.border}`,
        }}
      >
        {QUOTES.map((q, i) => (
          <figure
            key={q.handle}
            style={{
              margin: 0,
              padding: "40px 36px",
              borderRight: i % 2 === 0 ? `1px solid ${RGA.border}` : "none",
              borderBottom: i < 2 ? `1px solid ${RGA.border}` : "none",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 18,
                left: 28,
                fontFamily: FONT_DISPLAY,
                fontSize: 80,
                lineHeight: 0.7,
                color: RGA.green,
                opacity: 0.18,
              }}
            >
              "
            </span>
            <blockquote
              style={{
                margin: 0,
                paddingTop: 14,
                fontFamily: FONT_BODY,
                fontSize: 19,
                lineHeight: 1.5,
                color: RGA.text,
                fontWeight: 400,
                textWrap: "pretty",
              }}
            >
              {q.quote}
            </blockquote>
            <figcaption
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: "0.18em",
                color: RGA.text3,
                textTransform: "uppercase",
                paddingTop: 12,
                borderTop: `1px dashed rgba(0,255,65,0.12)`,
              }}
            >
              <span style={{ color: RGA.green }}>@{q.handle}</span>
              <span>· age {q.age}</span>
              <span>· joined {q.since}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════
// 8B. COMPARISON TABLE — us vs the typical gaming server
// ═══════════════════════════════════════════════════════════════════════

const COMPARE_ROWS = [
  { label: "Minimum age verified",            us: true,  them: false, note: "25+, enforced" },
  { label: "Community-funded (no ads)",       us: true,  them: false, note: "$0 / forever" },
  { label: "Mods are members, not contractors", us: true, them: false, note: "6 volunteers" },
  { label: "Strike log is public",            us: true,  them: false, note: "#mod-actions" },
  { label: "Engagement-bait notifications",   us: false, them: true,  note: "#news only" },
  { label: "Sells data to advertisers",       us: false, them: true,  note: "never" },
  { label: "Algorithmic promotion",           us: false, them: true,  note: "chronological feed" },
  { label: "Owned by a parent company",       us: false, them: true,  note: "unincorporated" },
];

const CompareCell = ({ on, hot }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 28, height: 28,
      border: `1px solid ${on ? (hot ? RGA.borderHot : "rgba(255,0,255,0.35)") : RGA.border}`,
      background: on ? (hot ? "rgba(0,255,65,0.08)" : "rgba(255,0,255,0.06)") : "transparent",
      color: on ? (hot ? RGA.green : RGA.magenta) : RGA.muted,
      fontFamily: FONT_MONO,
      fontSize: 12,
      fontWeight: 700,
    }}
  >
    {on ? (hot ? "✓" : "✕") : "·"}
  </span>
);

const CompareSection = () => (
  <section
    id="sec-08"
    data-screen-label="08 Compare"
    style={{
      maxWidth: 1480,
      margin: "0 auto",
      padding: "112px 64px",
    }}
  >
    <SectionHeader
      num="08"
      eyebrow="DELTA · MATRIX"
      kicker="// Why we're different from the average gaming server"
      title={<>Us, vs. the typical server.</>}
    />

    <div style={{ border: `1px solid ${RGA.border}`, background: "rgba(0,0,0,0.4)" }}>
      {/* header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 140px 140px 200px",
          padding: "18px 28px",
          borderBottom: `1px solid ${RGA.borderHot}`,
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: RGA.muted,
        }}
      >
        <span style={{ color: RGA.green }}>// FEATURE</span>
        <span style={{ textAlign: "center", color: RGA.green }}>RGA</span>
        <span style={{ textAlign: "center" }}>TYPICAL</span>
        <span>NOTE</span>
      </div>

      {COMPARE_ROWS.map((r, i) => (
        <div
          key={r.label}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 140px 140px 200px",
            alignItems: "center",
            padding: "18px 28px",
            borderBottom: i < COMPARE_ROWS.length - 1 ? `1px solid ${RGA.border}` : "none",
            background: i % 2 ? "rgba(255,255,255,0.012)" : "transparent",
          }}
        >
          <span style={{ fontFamily: FONT_BODY, fontSize: 16, color: RGA.text }}>
            {r.label}
          </span>
          <span style={{ textAlign: "center" }}><CompareCell on={r.us} hot /></span>
          <span style={{ textAlign: "center" }}><CompareCell on={r.them} /></span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: "0.15em",
              color: RGA.text3,
              textTransform: "uppercase",
            }}
          >
            {r.note}
          </span>
        </div>
      ))}
    </div>
  </section>
);

// ══════════════════════════════════════════════════════════════════════
// 9. FAQ ACCORDION
// ══════════════════════════════════════════════════════════════════════

const FAQS = [
  {
    q: "Why 25+? Isn't that gatekeeping?",
    a: "Yes. The room reads differently when everybody in it has had a job, paid rent, and lost a few years to something. We're protecting that, not the games. There are great communities for younger players — this isn't one of them.",
  },
  {
    q: "Do I need to play a specific game to fit in?",
    a: "No. Members rotate through 40+ titles a year. Bring whatever you're playing. There's likely a squad already; if there isn't, post in #lfg and one starts.",
  },
  {
    q: "How do I actually join?",
    a: "Click the Discord link, accept the rules in #welcome, and lurk for a week. You'll be DM'd by June (a real human, our onboarding mod) within 48 hours. No application form, no interview.",
  },
  {
    q: "Can I bring my friend who's 22?",
    a: "No. We hate this answer too, sometimes. Tell them 'three years, then we'll talk.' We will absolutely remember.",
  },
  {
    q: "What if a mod gets it wrong?",
    a: "Email q@roguearmy.xyz — Q owns appeals and replies within 48 hours. Decisions are public in #mod-actions; if we reverse one, that's public too. We'd rather be wrong loudly than wrong quietly.",
  },
  {
    q: "Is this a paid community?",
    a: "No. There's no paywall, no patreon, no merch funnel, no premium tier. We pay for the site out of pocket and Discord covers itself. If we ever needed money, we'd ask first.",
  },
  {
    q: "Do you stream / have a YouTube?",
    a: "Some of us do, individually. The community itself does not. We've turned down two sponsorship offers and we'll turn down more.",
  },
];

const FAQItem = ({ item, idx, open, onToggle }) => (
  <div
    style={{
      borderBottom: `1px solid ${RGA.border}`,
      background: open ? "rgba(0,255,65,0.04)" : "transparent",
      transition: "background .2s",
    }}
  >
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      style={{
        display: "grid",
        gridTemplateColumns: "100px 1fr 60px",
        gap: 24,
        alignItems: "center",
        width: "100%",
        padding: "26px 28px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        color: "inherit",
        fontFamily: "inherit",
      }}
    >
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: "0.3em",
          color: open ? RGA.green : RGA.muted,
        }}
      >
        Q_{String(idx + 1).padStart(2, "0")}
      </span>
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 22,
          letterSpacing: "0.005em",
          textTransform: "uppercase",
          color: RGA.text,
          lineHeight: 1.15,
        }}
      >
        {item.q}
      </span>
      <span
        aria-hidden="true"
        style={{
          justifySelf: "end",
          width: 26, height: 26,
          border: `1px solid ${open ? RGA.green : RGA.border}`,
          color: open ? RGA.green : RGA.text3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_MONO,
          fontSize: 14,
          transition: "all .2s",
        }}
      >
        {open ? "−" : "+"}
      </span>
    </button>
    {open && (
      <div
        style={{
          padding: "0 28px 30px 152px",
          fontFamily: FONT_BODY,
          fontSize: 16,
          lineHeight: 1.6,
          color: RGA.text2,
          maxWidth: 880,
        }}
      >
        {item.a}
      </div>
    )}
  </div>
);

const FAQSection = () => {
  const [open, setOpen] = useState(0);
  return (
    <section
      id="sec-09"
      data-screen-label="09 FAQ"
      style={{
        borderTop: `1px solid ${RGA.border}`,
        background: "rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "112px 64px" }}>
        <SectionHeader
          num="09"
          eyebrow={`${FAQS.length} ENTRIES`}
          kicker="// What new members ask first"
          title={<>Frequently asked, plainly answered.</>}
        />

        <div style={{ border: `1px solid ${RGA.border}` }}>
          {FAQS.map((item, i) => (
            <FAQItem
              key={item.q}
              item={item}
              idx={i}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: 22,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.25em",
            color: RGA.muted,
            textTransform: "uppercase",
          }}
        >
          <span>// Got a question we didn't answer? — ask@roguearmy.xyz</span>
          <span>RESPONSE_TIME &lt; 48H</span>
        </div>
      </div>
    </section>
  );
};

// ══════════════════════════════════════════════════════════════════════
// 10. CHANNELS GRID — Discord channel directory
// ══════════════════════════════════════════════════════════════════════

const CHANNELS = [
  { kind: "TEXT", name: "welcome",       desc: "New-member intros, anniversaries, the rule check",        members: 2847, hot: false },
  { kind: "TEXT", name: "news",          desc: "Announcements only. ~1 post a week, ever",                members: 2847, hot: false },
  { kind: "TEXT", name: "lfg",           desc: "Looking-for-group pings, scheduling co-op nights",        members: 1840, hot: true  },
  { kind: "TEXT", name: "spoilers",      desc: "Two-week embargo on big releases, then it's a free-for-all", members: 1290, hot: false },
  { kind: "TEXT", name: "off-topic",     desc: "Kitchens, dogs, books, weather, the slow stuff",          members: 2104, hot: false },
  { kind: "TEXT", name: "mod-actions",   desc: "Every removal, every strike, in public",                  members: 2847, hot: false },
  { kind: "VOICE", name: "raid-night",    desc: "Wednesdays · runs whatever's hot",                         members: 28,   hot: true  },
  { kind: "VOICE", name: "chill-lobby",   desc: "Always-on, no agenda, mics optional",                      members: 12,   hot: false },
  { kind: "VOICE", name: "asia-pacific",  desc: "Weekend afternoons JST — Koyo's room",                      members: 19,   hot: false },
];

const ChannelGlyph = ({ kind }) => (
  <span
    aria-hidden="true"
    style={{
      fontFamily: FONT_MONO,
      fontSize: 18,
      color: kind === "VOICE" ? RGA.cyan : RGA.green,
      width: 22,
      flexShrink: 0,
      textAlign: "center",
    }}
  >
    {kind === "VOICE" ? "♫" : "#"}
  </span>
);

const ChannelsSection = () => (
  <section
    id="sec-10"
    data-screen-label="10 Channels"
    style={{
      maxWidth: 1480,
      margin: "0 auto",
      padding: "112px 64px",
    }}
  >
    <SectionHeader
      num="10"
      eyebrow="DIRECTORY"
      kicker="// Where the conversations actually happen"
      title={<>The channel directory.</>}
    />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        border: `1px solid ${RGA.border}`,
      }}
    >
      {CHANNELS.map((c, i) => (
        <a
          key={c.name}
          href="#"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: "26px 26px 22px",
            borderRight: i % 3 < 2 ? `1px solid ${RGA.border}` : "none",
            borderBottom: i < 6 ? `1px solid ${RGA.border}` : "none",
            textDecoration: "none",
            color: "inherit",
            background: c.hot ? "rgba(0,255,65,0.04)" : "transparent",
            transition: "background .2s, border-color .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,255,65,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = c.hot ? "rgba(0,255,65,0.04)" : "transparent";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ChannelGlyph kind={c.kind} />
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 22,
                letterSpacing: "0.01em",
                textTransform: "uppercase",
                color: RGA.text,
              }}
            >
              {c.name}
            </span>
            <span style={{ flex: 1 }} />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.3em",
                padding: "3px 7px",
                border: `1px solid ${c.kind === "VOICE" ? "rgba(0,255,255,0.35)" : RGA.border}`,
                color: c.kind === "VOICE" ? RGA.cyan : RGA.text3,
              }}
            >
              {c.kind}
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: FONT_BODY,
              fontSize: 14.5,
              lineHeight: 1.5,
              color: RGA.text2,
            }}
          >
            {c.desc}
          </p>
          <div
            style={{
              marginTop: "auto",
              paddingTop: 12,
              borderTop: `1px dashed rgba(0,255,65,0.12)`,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.2em",
              color: RGA.muted,
              textTransform: "uppercase",
            }}
          >
            <span>
              {c.kind === "VOICE" ? "NOW" : "MEMBERS"} ·{" "}
              <span style={{ color: c.hot ? RGA.green : RGA.text3 }}>
                {c.members.toLocaleString()}
              </span>
            </span>
            <span>OPEN ↗</span>
          </div>
        </a>
      ))}
    </div>
  </section>
);

// ══════════════════════════════════════════════════════════════════════
// 11. TRANSMISSION TERMINAL — newsletter signup as a CLI prompt
// ══════════════════════════════════════════════════════════════════════

const TransmissionSection = () => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | done

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setState("sending");
    setTimeout(() => setState("done"), 900);
  };

  return (
    <section
      id="sec-11"
      data-screen-label="11 Transmissions"
      style={{
        borderTop: `1px solid ${RGA.border}`,
        borderBottom: `1px solid ${RGA.border}`,
        background: "rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "96px 64px" }}>
        <SectionHeader
          num="11"
          eyebrow="OPT_IN · MONTHLY"
          kicker="// One email a month, no more"
          title={<>Receive transmissions.</>}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          {/* terminal */}
          <div
            style={{
              border: `1px solid ${RGA.borderHot}`,
              background: "#050505",
              fontFamily: FONT_MONO,
              boxShadow: `0 0 50px rgba(0,255,65,0.08)`,
            }}
          >
            {/* terminal chrome */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderBottom: `1px solid ${RGA.border}`,
                background: "rgba(0,0,0,0.6)",
              }}
            >
              <span style={{ display: "flex", gap: 6 }}>
                <span style={{ width: 10, height: 10, background: RGA.magenta, opacity: 0.7 }} />
                <span style={{ width: 10, height: 10, background: RGA.cyan, opacity: 0.7 }} />
                <span style={{ width: 10, height: 10, background: RGA.green }} />
              </span>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: "0.3em",
                  color: RGA.muted,
                  textTransform: "uppercase",
                  marginLeft: 8,
                }}
              >
                rga@transmissions — ~/subscribe
              </span>
            </div>

            <div style={{ padding: "24px 22px 28px", color: RGA.text2, fontSize: 14, lineHeight: 1.6 }}>
              <div style={{ color: RGA.green }}>
                <span style={{ color: RGA.muted }}>$</span> rga subscribe
              </div>
              <div style={{ color: RGA.text3, marginTop: 6 }}>
                Connecting to roguearmy.xyz/list … <span style={{ color: RGA.green }}>OK</span>
              </div>
              <div style={{ color: RGA.text3, marginTop: 2 }}>
                One transmission per month. Plain-text. Unsubscribe in one click.
              </div>

              <form
                onSubmit={submit}
                style={{
                  marginTop: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderTop: `1px solid ${RGA.border}`,
                  paddingTop: 18,
                }}
              >
                <span style={{ color: RGA.green, flexShrink: 0 }}>› email
                  <span
                    style={{
                      display: "inline-block",
                      marginLeft: 6,
                      width: 8, height: 14,
                      background: RGA.green,
                      verticalAlign: "middle",
                      animation: "rgaCaret 1s step-end infinite",
                    }}
                  />
                </span>
                <input
                  type="email"
                  required
                  disabled={state !== "idle"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@somewhere.dev"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: RGA.text,
                    fontFamily: FONT_MONO,
                    fontSize: 14,
                    letterSpacing: "0.04em",
                    padding: "8px 4px",
                    borderBottom: `1px dashed rgba(0,255,65,0.25)`,
                  }}
                />
                <button
                  type="submit"
                  disabled={state !== "idle"}
                  style={{
                    padding: "10px 16px",
                    background: state === "done" ? "transparent" : RGA.green,
                    color: state === "done" ? RGA.green : RGA.void,
                    border: state === "done" ? `1px solid ${RGA.green}` : "none",
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    cursor: state === "idle" ? "pointer" : "default",
                  }}
                >
                  {state === "sending" ? "… SENDING" : state === "done" ? "✓ SUBSCRIBED" : "ENLIST"}
                </button>
              </form>

              {state === "done" && (
                <div
                  style={{
                    marginTop: 14,
                    color: RGA.green,
                    fontSize: 12,
                  }}
                >
                  ✓ Confirmation sent. Check your inbox — reply YES to confirm.
                </div>
              )}
            </div>
          </div>

          {/* preview */}
          <aside
            style={{
              border: `1px solid ${RGA.border}`,
              background: "rgba(0,0,0,0.5)",
              padding: 28,
            }}
          >
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                letterSpacing: "0.35em",
                color: RGA.green,
                marginBottom: 16,
              }}
            >
              // LAST_SENT · 04.12.2026 · 1,612 RECIPIENTS
            </div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 28,
                lineHeight: 1.05,
                letterSpacing: "0.005em",
                textTransform: "uppercase",
                color: RGA.text,
                marginBottom: 18,
              }}
            >
              Transmission #57 — spring rotation
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "What we played in March (Helldivers, FFXIV, Balatro)",
                "Three new mod-actions, in plain English",
                "Member spotlight: kobu's 200hr Elden Ring run",
                "April voice-night calendar",
              ].map((line, i) => (
                <li
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr",
                    gap: 12,
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    color: RGA.text2,
                  }}
                >
                  <span style={{ color: RGA.green, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.2em" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div
              style={{
                marginTop: 24,
                paddingTop: 18,
                borderTop: `1px solid ${RGA.border}`,
                fontFamily: FONT_MONO,
                fontSize: 10,
                letterSpacing: "0.25em",
                color: RGA.muted,
                textTransform: "uppercase",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>↓ read the full archive</span>
              <span style={{ color: RGA.text3 }}>57 ISSUES · ZERO ADS</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

// ══════════════════════════════════════════════════════════════════════
// 12. JOIN CTA
// ══════════════════════════════════════════════════════════════════════

const DiscordGlyph = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
  </svg>
);

const JoinSection = ({ glow }) => (
  <section
    id="sec-12"
    data-screen-label="12 Join"
    style={{
      maxWidth: 1480,
      margin: "0 auto",
      padding: "120px 64px 140px",
      position: "relative",
    }}
  >
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 50% 70% at 80% 50%, rgba(0,255,65,0.10) 0%, transparent 60%)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: 64,
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 12,
            letterSpacing: "0.35em",
            color: RGA.green,
            marginBottom: 22,
          }}
        >
          // ENLIST · IT'S FREE
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(60px, 8vw, 130px)",
            lineHeight: 0.86,
            letterSpacing: "-0.005em",
            textTransform: "uppercase",
            color: RGA.text,
            textShadow:
              glow > 0
                ? `-${2 * glow}px 0 ${RGA.cyan}55, ${2 * glow}px 0 ${RGA.magenta}55`
                : "none",
          }}
        >
          If you're{" "}
          <span
            style={{
              color: RGA.green,
              textShadow:
                glow > 0
                  ? `0 0 ${24 * glow}px rgba(0,255,65,${0.55 * glow})`
                  : "none",
            }}
          >
            25+
          </span>{" "}
          and you can be kind, the door is open.
        </h2>
        <p
          style={{
            marginTop: 28,
            fontFamily: FONT_BODY,
            fontSize: 18,
            lineHeight: 1.55,
            color: RGA.text2,
            maxWidth: 600,
          }}
        >
          Join the Discord, lurk for a week, say hi when you're ready. Our welcome bot
          isn't a bot — it's June, and she'll find you.
        </p>

        <div style={{ display: "flex", gap: 14, marginTop: 36 }}>
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              padding: "18px 28px",
              background: RGA.green,
              color: RGA.void,
              fontFamily: FONT_DISPLAY,
              fontSize: 14,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow:
                glow > 0
                  ? `0 0 ${30 * glow}px rgba(0,255,65,${0.55 * glow})`
                  : "none",
              clipPath:
                "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
            }}
          >
            <DiscordGlyph size={18} />
            <span>Join the Discord</span>
            <span>→</span>
          </a>
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "18px 28px",
              border: `1px solid ${RGA.borderHot}`,
              color: RGA.text,
              fontFamily: FONT_MONO,
              fontSize: 12,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Read the rules first
          </a>
        </div>

        <div
          style={{
            marginTop: 40,
            fontFamily: FONT_MONO,
            fontSize: 11,
            letterSpacing: "0.18em",
            color: RGA.muted,
            display: "flex",
            gap: 22,
            flexWrap: "wrap",
          }}
        >
          <span>· No application form</span>
          <span>· No pay-to-join</span>
          <span>· Leave anytime, no questions</span>
        </div>
      </div>

      {/* recruit card */}
      <aside
        style={{
          border: `1px solid ${RGA.borderHot}`,
          background: "rgba(0,0,0,0.6)",
          padding: 28,
          position: "relative",
          fontFamily: FONT_MONO,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -1,
            left: -1,
            right: -1,
            height: 28,
            background: `linear-gradient(90deg, ${RGA.green} 0%, ${RGA.green} 60%, transparent 100%)`,
            color: RGA.void,
            display: "flex",
            alignItems: "center",
            paddingLeft: 14,
            fontSize: 10,
            letterSpacing: "0.35em",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          ★ RECRUITMENT ORDER · 26.04
        </div>
        <div style={{ paddingTop: 36 }}>
          <Placeholder label="DOG_TAG · YOUR_HANDLE" ratio="3 / 2" tone="green" />
          <div style={{ paddingTop: 22 }}>
            <Field label="Callsign" value="@your_handle_here" />
            <Field label="Age confirmation" value="≥ 25" green />
            <Field label="Region" value="any" />
            <Field label="Disposition" value="kind on a bad day" green />
            <Field label="Status" value="PENDING ENLISTMENT" green />
          </div>
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 10,
            letterSpacing: "0.25em",
            color: RGA.muted,
            textTransform: "uppercase",
          }}
        >
          Issued by ASHLEY · Signed by THE ROOM
        </div>
      </aside>
    </div>
  </section>
);

const Field = ({ label, value, green }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "9px 0",
      borderBottom: `1px dashed rgba(0,255,65,0.15)`,
      fontSize: 12,
      letterSpacing: "0.05em",
    }}
  >
    <span
      style={{
        color: RGA.muted,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        fontSize: 10,
      }}
    >
      {label}
    </span>
    <span style={{ color: green ? RGA.green : RGA.text }}>{value}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// FOOTER (terminal-ish closer)
// ═══════════════════════════════════════════════════════════════════════

const FooterStrip = () => (
  <footer
    style={{
      borderTop: `1px solid ${RGA.border}`,
      padding: "32px 64px",
      maxWidth: 1480,
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: FONT_MONO,
      fontSize: 11,
      letterSpacing: "0.22em",
      color: RGA.muted,
      textTransform: "uppercase",
    }}
  >
    <span>// END_OF_FILE · ABOUT_THE_COMMUNITY.MD</span>
    <span>
      <span style={{ color: RGA.green }}>◆</span> ROGUE_ARMY · 2019–2026
    </span>
    <span>BUILT BY VOLUNTEERS · NO ADS · NO TRACKERS</span>
  </footer>
);

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════

const AboutCommunity = ({ glow = 1 }) => (
  <main
    style={{
      background: RGA.void,
      color: RGA.text,
      fontFamily: FONT_BODY,
      position: "relative",
      minHeight: "100vh",
      overflowX: "hidden",
    }}
  >
    <Vignette />
    <Scanlines opacity={0.035} />

    <style>{`
      @keyframes rgaDotPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.55; transform: scale(0.85); }
      }
      @keyframes rgaCaret {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      .rga-link:hover { color: #fff !important; }
    `}</style>

    <div style={{ position: "relative", zIndex: 2 }}>
      <Hero glow={glow} />
      <PullStrip />
      <ValuesSection />
      <NumbersSection />
      <OriginSection />
      <ModsSection />
      <PlayingSection />
      <VoicesSection />
      <CompareSection />
      <FAQSection />
      <ChannelsSection />
      <TransmissionSection />
      <JoinSection glow={glow} />
      <FooterStrip />
    </div>
  </main>
);

Object.assign(window, { ComponentLibrary: AboutCommunity, AboutCommunity });
