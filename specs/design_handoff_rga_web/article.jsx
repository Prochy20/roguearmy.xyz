/* global React */
const { useEffect, useMemo, useRef, useState } = React;

// ═════════════════════════════════════════════════════════════════════
// RGA — Article Detail page
// Matches the Manifesto / Footer design system:
//   fonts: Black Ops One (display, stands in for Hanson Bold) + JetBrains
//   Mono (meta/labels) + Outfit (body)
//   palette: void black + neon green/cyan/magenta accents
//   atmosphere: scanlines, status dots, numbered rhythm, sticky rails
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
  borderStrong: "rgba(0,255,65,0.3)",
};

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ─────────────────────────────────────────────────────────────────────
// ARTICLE DATA — realistic fake article seeded from collections schema
// (topic, contentType, games, perex, readingTime, visibility, blocks…)
// ─────────────────────────────────────────────────────────────────────

const ARTICLE = {
  slug: "we-cleared-mythic-on-a-tuesday",
  code: "ART_0472",
  topic: { key: "guide", label: "Guide" },
  contentType: { key: "article", label: "Long-read" },
  games: [
    { key: "destiny-2", label: "Destiny 2" },
    { key: "vow-of-the-disciple", label: "Vow of the Disciple" },
  ],
  visibility: "members_only",
  title: "We cleared Mythic on a Tuesday, and it almost broke the squad.",
  perex:
    "Seven casuals, one 3-hour window, and a raid boss that does not care about your feelings. Here's what we learned about scheduling, call-outs, and not being a dick when someone dies on a jump puzzle at 23:47 local time.",
  hero: {
    caption: "Fireteam 7 · wipe 14 of 18 · final attempt at 00:12",
    credit: "Screenshot by @koyo",
  },
  authors: [
    { name: "D3V", role: "Raid lead · Tuesday crew", handle: "@d3v" },
    { name: "Koyo", role: "Healer-main, screenshot gremlin", handle: "@koyo" },
  ],
  publishedAt: "April 21, 2026",
  updatedAt: "April 23, 2026",
  readingTime: 14,
  wordCount: 3180,
  tldr: [
    "Mythic clears are a scheduling problem before they're a mechanics problem.",
    "Running a raid on a 3-hour window means cutting teaching from the run itself.",
    "Voice-chat tone goes south around wipe 12. We wrote a rule for that.",
    "Your weakest player is not the reason you wiped. Your call-outs were.",
  ],
  sections: [
    {
      num: "01",
      id: "the-setup",
      title: "The setup, and why Tuesday",
      kind: "prose",
      paragraphs: [
        "We are six to eight adults with jobs. Four of us have kids. Two of us live in timezones that do not share a name. The only three-hour block where all of us are online and not falling asleep is Tuesday, 21:00 to 00:00 UTC. So we raid on Tuesday.",
        "For two months we ran Normal. We cleared it seven times, got comfortable, made the jokes you make when you have cleared something seven times. Then somebody — fine, me — said the thing: \"should we try Mythic?\" Nobody said no out loud, which in a community this age is how consensus happens.",
      ],
    },
    {
      num: "02",
      id: "the-schedule",
      title: "Scheduling is the hard part",
      kind: "prose",
      paragraphs: [
        "Mythic takes roughly six runs to clear, first time, with a party that has read a guide. We had three hours. The math does not work if you treat the three hours like one block. It only works if you treat it like four blocks:",
      ],
      bullets: [
        "0:00–0:20 — loadout check, last-patch diff, reminder of the three new mechanics. No teaching, no backtracking.",
        "0:20–1:10 — encounter 1. Hard deadline at 1:10 regardless of outcome.",
        "1:10–2:00 — encounter 2.",
        "2:00–2:50 — encounter 3.",
        "2:50–3:00 — VoD clips, nominate MVP, schedule next Tuesday before anyone logs.",
      ],
      tail: [
        "If you blow a block, you do not get it back. You either eat the loss and move on, or you cancel the remainder of the night. The most important rule we wrote is: nobody apologizes for calling the cancel. It is a valid outcome.",
      ],
    },
    {
      num: "03",
      id: "calls",
      title: "Why your call-outs are the problem",
      kind: "prose",
      paragraphs: [
        "Here is the thing nobody tells you about Mythic: the mechanics aren't harder. The timing windows are. Normal forgives a half-second late rotation. Mythic doesn't. Which means your voice chat needs to be as tight as the game.",
        "We recorded six runs and watched them back. The wipes clustered around call-out failures, not mechanical ones. Somebody said \"left\" when they meant \"my left.\" Somebody said \"three\" at the end of an adjacent sentence and a teammate swapped at three instead of at two. Somebody else just sighed into a hot mic.",
      ],
    },
    {
      num: "04",
      id: "terminology",
      title: "The terminology we ended up with",
      kind: "terminology",
    },
    {
      num: "05",
      id: "the-night",
      title: "The night it worked",
      kind: "prose",
      paragraphs: [
        "Wipe 11 was the one where June's mic cut out during the final DPS phase and we lost by 4% because nobody called the final swap. Carter muted himself, got up, walked a loop around the kitchen, came back and said \"one more.\" We didn't talk about it. That was the right move.",
        "Wipe 14 was ours. June came back with audio. Ashley called the swap on the beat. The boss went down at 00:12, twelve minutes into territory none of us had agreed to give up, and there was a full six seconds of silence before anybody realized it was over. Then June started laughing and didn't stop for a minute.",
      ],
    },
    {
      num: "06",
      id: "what-we-changed",
      title: "What we changed for next season",
      kind: "prose",
      paragraphs: [
        "We codified the schedule. We wrote down the terminology. We bought a Raid Lead a fancy mic because he kept clipping, and clipping kills your callouts more than bad comms do. We added a rule to the squad doc: \"If you are in a bad mood, say so in chat before the first encounter. We will adjust.\"",
      ],
    },
  ],
};

// Glossary for section 04
const TERMS = [
  { term: "bop", short: "swap on this beat", example: "\"bop — now — bop\" = swap after the second bop." },
  { term: "flip", short: "180° rotation, same position", example: "\"flip 7\" = rotate, stay at 7 o'clock." },
  { term: "clear", short: "team is safe to move", example: "not the same as \"go\". clear ≠ go." },
  { term: "my-left", short: "relative to speaker", example: "if unsure, say the cardinal: \"north.\"" },
  { term: "hold", short: "freeze in place", example: "overrides any prior movement call." },
  { term: "eyes", short: "report what you see", example: "\"eyes on east spawn, two adds.\"" },
];

// ─────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────

const DiscordGlyph = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
  </svg>
);

const StatusDot = ({ color = RGA.green, size = 8 }) => (
  <span
    aria-hidden="true"
    style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: 1,
      background: color,
      boxShadow: `0 0 8px ${color}`,
      marginRight: 10,
      flexShrink: 0,
    }}
  />
);

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
        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.6) 2px, rgba(0,0,0,0.6) 4px)",
    }}
  />
);

const Kbd = ({ children }) => (
  <span
    style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
      padding: "2px 6px",
      border: `1px solid ${RGA.border}`,
      color: RGA.text2,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      borderRadius: 2,
      display: "inline-block",
    }}
  >
    {children}
  </span>
);

// Striped image placeholder (matches design-system brief — no SVG illustration)
const HeroPlaceholder = ({ accent, ratio = "16 / 9", caption, credit, label = "HERO // raid_mythic_clear_01.png" }) => (
  <figure
    style={{
      margin: 0,
      position: "relative",
      background: RGA.bg,
      border: `1px solid ${RGA.border}`,
    }}
  >
    <div
      style={{
        aspectRatio: ratio,
        position: "relative",
        overflow: "hidden",
        background: `
          repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 10px, transparent 10px 20px),
          radial-gradient(ellipse 80% 60% at 50% 40%, ${accent}15 0%, transparent 60%),
          linear-gradient(180deg, #0a0a0a 0%, #030303 100%)
        `,
      }}
    >
      {/* corner brackets */}
      {[
        { top: 12, left: 12, borderTop: `1px solid ${accent}`, borderLeft: `1px solid ${accent}` },
        { top: 12, right: 12, borderTop: `1px solid ${accent}`, borderRight: `1px solid ${accent}` },
        { bottom: 12, left: 12, borderBottom: `1px solid ${accent}`, borderLeft: `1px solid ${accent}` },
        { bottom: 12, right: 12, borderBottom: `1px solid ${accent}`, borderRight: `1px solid ${accent}` },
      ].map((s, i) => (
        <span key={i} aria-hidden="true" style={{ position: "absolute", width: 14, height: 14, ...s }} />
      ))}

      {/* center label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.35em",
            color: accent,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.25em",
            color: RGA.muted,
            textTransform: "uppercase",
          }}
        >
          1920 × 1080 · drop image here
        </div>
      </div>

      {/* scanlines local to the image */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.08,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 3px)",
        }}
      />
    </div>

    {(caption || credit) && (
      <figcaption
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 24,
          padding: "14px 18px",
          borderTop: `1px solid ${RGA.border}`,
          background: "rgba(0,0,0,0.35)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.08em",
          color: RGA.text3,
        }}
      >
        <span>{caption}</span>
        <span style={{ color: RGA.muted }}>{credit}</span>
      </figcaption>
    )}
  </figure>
);

// ─────────────────────────────────────────────────────────────────────
// CHROME: top nav, breadcrumb strip
// ─────────────────────────────────────────────────────────────────────

const TopNav = ({ accent }) => (
  <nav
    style={{
      position: "sticky",
      top: 0,
      zIndex: 30,
      background: "rgba(3,3,3,0.88)",
      backdropFilter: "blur(10px)",
      borderBottom: `1px solid ${RGA.border}`,
    }}
  >
    <div
      style={{
        maxWidth: 1480,
        margin: "0 auto",
        padding: "14px 48px",
        display: "flex",
        alignItems: "center",
        gap: 32,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      <a
        href="#"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: RGA.text,
          textDecoration: "none",
          fontFamily: "'Black Ops One', sans-serif",
          fontSize: 18,
          letterSpacing: "0.06em",
        }}
      >
        <StatusDot color={accent} />
        RGA
      </a>
      <span style={{ color: RGA.muted }}>/</span>
      {["Blog", "Series", "Games", "Members", "Rules"].map((l, i) => (
        <a
          key={l}
          href="#"
          style={{
            color: i === 0 ? RGA.text : RGA.text3,
            textDecoration: "none",
            borderBottom: i === 0 ? `1px solid ${accent}` : "1px solid transparent",
            paddingBottom: 2,
          }}
        >
          {l}
        </a>
      ))}
      <span style={{ flex: 1 }} />
      <span style={{ color: RGA.muted }}>SRV_STATUS</span>
      <span style={{ color: accent, display: "inline-flex", alignItems: "center" }}>
        <StatusDot color={accent} size={6} /> ONLINE · 247 MEMBERS
      </span>
      <span
        style={{
          padding: "6px 12px",
          border: `1px solid ${accent}`,
          color: accent,
          cursor: "pointer",
        }}
      >
        Sign in ↗
      </span>
    </div>
  </nav>
);

const Breadcrumb = ({ article, accent }) => (
  <div
    style={{
      maxWidth: 1480,
      margin: "0 auto",
      padding: "22px 48px 0",
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      letterSpacing: "0.28em",
      textTransform: "uppercase",
      color: RGA.muted,
    }}
  >
    <StatusDot color={accent} />
    <a href="#" style={{ color: RGA.text3, textDecoration: "none" }}>BLOG</a>
    <span>/</span>
    <a href="#" style={{ color: RGA.text3, textDecoration: "none" }}>{article.topic.label.toUpperCase()}</a>
    <span>/</span>
    <span style={{ color: RGA.text }}>{article.code}</span>
    <span
      style={{
        flex: 1,
        height: 1,
        background: `linear-gradient(90deg, ${accent}33, transparent)`,
        maxWidth: 320,
        marginLeft: 8,
      }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────
// HERO (stack variant)
// ─────────────────────────────────────────────────────────────────────

const HeroStack = ({ article, accent }) => (
  <header style={{ position: "relative", maxWidth: 1480, margin: "0 auto", padding: "36px 48px 0" }}>
    {/* atmospheric gradient */}
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `radial-gradient(ellipse 60% 90% at 75% 20%, ${accent}14 0%, transparent 55%)`,
      }}
    />

    <div style={{ position: "relative" }}>
      {/* Tag row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        <Tag color={accent} filled>
          {article.topic.label}
        </Tag>
        {article.games.map((g) => (
          <Tag key={g.key} color={RGA.text2}>{g.label}</Tag>
        ))}
        {article.visibility === "members_only" && (
          <Tag color={RGA.magenta}>
            ◆ Members only
          </Tag>
        )}
        <span style={{ flex: 1 }} />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: RGA.muted,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          alignSelf: "center",
        }}>
          PUB {article.publishedAt} · UPD {article.updatedAt} · {article.readingTime} MIN READ
        </span>
      </div>

      {/* Title */}
      <h1
        style={{
          fontFamily: "'Black Ops One', sans-serif",
          fontSize: "clamp(52px, 7.2vw, 120px)",
          lineHeight: 0.92,
          letterSpacing: "-0.005em",
          textTransform: "uppercase",
          margin: 0,
          color: RGA.text,
          maxWidth: 1200,
          textShadow: `-2px 0 ${RGA.cyan}44, 2px 0 ${RGA.magenta}44`,
        }}
      >
        {article.title}
      </h1>

      {/* Perex */}
      <p
        style={{
          fontSize: 22,
          lineHeight: 1.5,
          color: RGA.text2,
          maxWidth: 860,
          marginTop: 28,
          textWrap: "pretty",
        }}
      >
        {article.perex}
      </p>

      {/* Author + actions strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          marginTop: 36,
          paddingTop: 24,
          paddingBottom: 24,
          borderTop: `1px solid ${RGA.border}`,
          borderBottom: `1px solid ${RGA.border}`,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <AuthorAvatars authors={article.authors} accent={accent} />
          <div>
            <div style={{ fontSize: 14, color: RGA.text, fontWeight: 500 }}>
              {article.authors.map((a) => a.name).join(" + ")}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: RGA.muted,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginTop: 4,
            }}>
              {article.authors[0].role}
            </div>
          </div>
        </div>

        <span style={{ flex: 1 }} />

        <ActionBar accent={accent} />
      </div>

      {/* Hero image */}
      <div style={{ marginTop: 36 }}>
        <HeroPlaceholder
          accent={accent}
          caption={article.hero.caption}
          credit={article.hero.credit}
        />
      </div>
    </div>
  </header>
);

const HeroSplit = ({ article, accent }) => (
  <header style={{ position: "relative", maxWidth: 1480, margin: "0 auto", padding: "36px 48px 0" }}>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        gap: 48,
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <Tag color={accent} filled>{article.topic.label}</Tag>
          {article.games.map((g) => <Tag key={g.key} color={RGA.text2}>{g.label}</Tag>)}
          {article.visibility === "members_only" && <Tag color={RGA.magenta}>◆ Members only</Tag>}
        </div>
        <h1
          style={{
            fontFamily: "'Black Ops One', sans-serif",
            fontSize: "clamp(44px, 5.2vw, 84px)",
            lineHeight: 0.95,
            letterSpacing: "-0.005em",
            textTransform: "uppercase",
            margin: 0,
            color: RGA.text,
            textShadow: `-2px 0 ${RGA.cyan}44, 2px 0 ${RGA.magenta}44`,
          }}
        >
          {article.title}
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.55, color: RGA.text2, maxWidth: 560, marginTop: 24 }}>
          {article.perex}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 28 }}>
          <AuthorAvatars authors={article.authors} accent={accent} />
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: RGA.text3,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}>
            {article.authors.map(a => a.name).join(" + ")} · {article.readingTime} MIN
          </div>
        </div>
      </div>
      <HeroPlaceholder accent={accent} caption={article.hero.caption} credit={article.hero.credit} ratio="4 / 3" />
    </div>

    <div style={{ marginTop: 36, paddingTop: 20, borderTop: `1px solid ${RGA.border}`, display: "flex", alignItems: "center", gap: 20 }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        color: RGA.muted,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
      }}>
        PUB {article.publishedAt} · UPD {article.updatedAt}
      </span>
      <span style={{ flex: 1 }} />
      <ActionBar accent={accent} />
    </div>
  </header>
);

const HeroTerminal = ({ article, accent }) => (
  <header style={{ position: "relative", maxWidth: 1480, margin: "0 auto", padding: "36px 48px 0" }}>
    <div style={{
      border: `1px solid ${RGA.border}`,
      background: "rgba(0,0,0,0.5)",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* terminal bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderBottom: `1px solid ${RGA.border}`,
        fontSize: 11,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: RGA.muted,
      }}>
        <span style={{ width: 10, height: 10, borderRadius: 1, background: RGA.magenta, boxShadow: `0 0 6px ${RGA.magenta}` }} />
        <span style={{ width: 10, height: 10, borderRadius: 1, background: RGA.cyan, boxShadow: `0 0 6px ${RGA.cyan}` }} />
        <span style={{ width: 10, height: 10, borderRadius: 1, background: accent, boxShadow: `0 0 6px ${accent}` }} />
        <span style={{ marginLeft: 16 }}>rga@terminal ~ cat {article.slug}.md</span>
        <span style={{ flex: 1 }} />
        <span>{article.code}</span>
      </div>
      <div style={{ padding: "36px 40px 32px" }}>
        <div style={{ fontSize: 11, color: accent, letterSpacing: "0.3em", marginBottom: 14 }}>
          &gt; LOADING ARTICLE …
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          <Tag color={accent} filled>{article.topic.label}</Tag>
          {article.games.map((g) => <Tag key={g.key} color={RGA.text2}>{g.label}</Tag>)}
          {article.visibility === "members_only" && <Tag color={RGA.magenta}>◆ Members only</Tag>}
        </div>
        <h1
          style={{
            fontFamily: "'Black Ops One', sans-serif",
            fontSize: "clamp(44px, 5.6vw, 96px)",
            lineHeight: 0.95,
            letterSpacing: "-0.005em",
            textTransform: "uppercase",
            margin: 0,
            color: RGA.text,
            maxWidth: 1200,
          }}
        >
          {article.title}
        </h1>
        <p style={{
          fontFamily: "Outfit, system-ui, sans-serif",
          fontSize: 20,
          lineHeight: 1.5,
          color: RGA.text2,
          maxWidth: 840,
          marginTop: 24,
        }}>
          {article.perex}
        </p>
        <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <AuthorAvatars authors={article.authors} accent={accent} />
          <div style={{ fontSize: 11, color: RGA.text3, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            BY {article.authors.map(a => a.name).join(" + ")} · {article.publishedAt} · {article.readingTime} MIN
          </div>
          <span style={{ flex: 1 }} />
          <ActionBar accent={accent} />
        </div>
      </div>
    </div>
    <div style={{ marginTop: 24 }}>
      <HeroPlaceholder accent={accent} caption={article.hero.caption} credit={article.hero.credit} />
    </div>
  </header>
);

// ─────────────────────────────────────────────────────────────────────
// Small reusable chips / bits used in hero variants
// ─────────────────────────────────────────────────────────────────────

const Tag = ({ children, color, filled }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "5px 11px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
      letterSpacing: "0.25em",
      textTransform: "uppercase",
      border: `1px solid ${color}`,
      color: filled ? RGA.void : color,
      background: filled ? color : "transparent",
      fontWeight: filled ? 700 : 500,
    }}
  >
    {children}
  </span>
);

const AuthorAvatars = ({ authors, accent }) => (
  <div style={{ display: "flex", marginLeft: 2 }}>
    {authors.map((a, i) => (
      <div
        key={a.handle}
        aria-label={a.name}
        title={`${a.name} — ${a.handle}`}
        style={{
          width: 40,
          height: 40,
          border: `1px solid ${accent}`,
          background: i === 0 ? `${accent}15` : "rgba(255,0,255,0.1)",
          color: i === 0 ? accent : RGA.magenta,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Black Ops One', sans-serif",
          fontSize: 14,
          letterSpacing: "0.05em",
          marginLeft: i === 0 ? 0 : -8,
          boxShadow: i === 0 ? `0 0 12px ${accent}44` : "none",
        }}
      >
        {a.name.slice(0, 2).toUpperCase()}
      </div>
    ))}
  </div>
);

const ActionBar = ({ accent }) => (
  <div style={{ display: "flex", gap: 8 }}>
    {[
      { label: "Save", icon: "◉" },
      { label: "Share", icon: "↗" },
      { label: "Copy link", icon: "⧉" },
      { label: "Print", icon: "▤" },
    ].map((a) => (
      <button
        key={a.label}
        type="button"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          background: "transparent",
          border: `1px solid ${RGA.border}`,
          color: RGA.text2,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        <span style={{ color: accent }}>{a.icon}</span>
        {a.label}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────
// LEFT RAIL — TOC + scrollspy
// ─────────────────────────────────────────────────────────────────────

const LeftRail = ({ sections, activeId, accent }) => (
  <nav
    aria-label="Table of contents"
    style={{
      position: "sticky",
      top: 92,
      alignSelf: "flex-start",
      fontFamily: "'JetBrains Mono', monospace",
    }}
  >
    <div style={{ fontSize: 10, letterSpacing: "0.35em", color: accent, marginBottom: 18 }}>
      // CONTENTS
    </div>
    <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {sections.map((s) => {
        const on = s.id === activeId;
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(s.id);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
                history.replaceState(null, "", `#${s.id}`);
              }}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "baseline",
                padding: "9px 0 9px 12px",
                borderLeft: `2px solid ${on ? accent : "transparent"}`,
                marginLeft: -14,
                color: on ? RGA.text : RGA.text3,
                textDecoration: "none",
                fontSize: 12,
                lineHeight: 1.45,
                letterSpacing: "0.02em",
                transition: "all .15s",
              }}
            >
              <span style={{ color: on ? accent : RGA.muted, fontSize: 10, letterSpacing: "0.25em", width: 20, flexShrink: 0 }}>
                {s.num}
              </span>
              <span style={{ flex: 1 }}>{s.title}</span>
            </a>
          </li>
        );
      })}
    </ol>
  </nav>
);

// ─────────────────────────────────────────────────────────────────────
// RIGHT RAIL — meta, progress, shortcuts, share
// ─────────────────────────────────────────────────────────────────────

const RightRail = ({ article, progress, accent }) => {
  const pct = Math.round(progress * 100);
  return (
    <aside
      style={{
        position: "sticky",
        top: 92,
        alignSelf: "flex-start",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <RailCard accent={accent} label="// READING">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: RGA.text3, letterSpacing: "0.2em" }}>PROGRESS</span>
          <span style={{ fontSize: 10, color: RGA.text, letterSpacing: "0.2em" }}>{pct}%</span>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.08)", position: "relative", overflow: "hidden", marginBottom: 14 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              right: `${100 - pct}%`,
              background: `linear-gradient(90deg, ${accent}, ${RGA.cyan})`,
              boxShadow: `0 0 8px ${accent}`,
              transition: "right .12s linear",
            }}
          />
        </div>
        <MetaRow label="Time left" value={`~ ${Math.max(1, Math.round(article.readingTime * (1 - progress)))} min`} />
        <MetaRow label="Words" value={article.wordCount.toLocaleString()} />
      </RailCard>

      <RailCard accent={accent} label="// REACT">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 12 }}>
          {[
            { g: "🫡", n: 42, c: accent },
            { g: "🔥", n: 19, c: RGA.magenta },
            { g: "💀", n: 11, c: RGA.cyan },
            { g: "🧠", n: 7, c: RGA.text2 },
          ].map((r, i) => (
            <button
              key={i}
              type="button"
              style={{
                padding: "10px 4px",
                background: "rgba(0,0,0,0.3)",
                border: `1px solid ${RGA.border}`,
                color: r.c,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 11,
                letterSpacing: "0.15em",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1, filter: "grayscale(0.2)" }}>{r.g}</span>
              <span>{r.n}</span>
            </button>
          ))}
        </div>
        <MetaRow label="Views" value="3,104" />
        <MetaRow label="Comments" value="28" />
      </RailCard>

      <RailCard accent={accent} label="// SHORTCUTS">
        <ShortcutRow keys={["J","K"]} label="Next / prev section" />
        <ShortcutRow keys={["/"]} label="Search" />
        <ShortcutRow keys={["B"]} label="Bookmark" />
        <ShortcutRow keys={["P"]} label="Print" />
      </RailCard>
    </aside>
  );
};

const RailCard = ({ label, accent, children }) => (
  <div style={{ border: `1px solid ${RGA.border}`, background: "rgba(0,0,0,0.4)", padding: 16 }}>
    <div style={{ fontSize: 10, letterSpacing: "0.35em", color: accent, marginBottom: 12 }}>{label}</div>
    {children}
  </div>
);

const MetaRow = ({ label, value, mono = true }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 11 }}>
    <span style={{ color: RGA.muted, letterSpacing: "0.18em", textTransform: "uppercase" }}>{label}</span>
    <span style={{ color: RGA.text, fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit" }}>{value}</span>
  </div>
);

const ShortcutRow = ({ keys, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", fontSize: 11 }}>
    <span style={{ display: "inline-flex", gap: 4 }}>
      {keys.map((k, i) => <Kbd key={i}>{k}</Kbd>)}
    </span>
    <span style={{ color: RGA.text3 }}>{label}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────
// BODY — section headers, paragraphs, pull quotes, TL;DR, callouts,
// terminal block, figure, terminology grid, member lock
// ─────────────────────────────────────────────────────────────────────

const SectionHeader = ({ num, title, id, accent }) => (
  <header style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 20 }}>
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        letterSpacing: "0.3em",
        color: accent,
        width: 42,
        flexShrink: 0,
      }}
    >
      {num}
    </span>
    <h2
      id={id}
      style={{
        fontFamily: "'Black Ops One', sans-serif",
        fontSize: "clamp(30px, 3vw, 42px)",
        lineHeight: 1.05,
        letterSpacing: "0.01em",
        textTransform: "uppercase",
        margin: 0,
        color: RGA.text,
        scrollMarginTop: 96,
      }}
    >
      {title}
    </h2>
  </header>
);

const Paragraph = ({ children, density }) => (
  <p
    style={{
      fontSize: density === "compact" ? 16 : 17.5,
      lineHeight: density === "compact" ? 1.55 : 1.7,
      color: RGA.text2,
      margin: "0 0 18px 0",
      maxWidth: 680,
      textWrap: "pretty",
    }}
  >
    {children}
  </p>
);

const BulletList = ({ items, accent }) => (
  <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 18px 0", maxWidth: 680 }}>
    {items.map((t, i) => (
      <li
        key={i}
        style={{
          position: "relative",
          paddingLeft: 28,
          fontSize: 16.5,
          lineHeight: 1.6,
          color: RGA.text2,
          marginBottom: 10,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: "0.7em",
            width: 14,
            height: 1,
            background: accent,
            boxShadow: `0 0 6px ${accent}`,
            opacity: 0.9,
          }}
        />
        {t}
      </li>
    ))}
  </ul>
);

const PullQuote = ({ children, attribution, accent, style = "bar" }) => {
  if (style === "terminal") {
    return (
      <blockquote
        style={{
          margin: "36px 0",
          padding: "22px 26px",
          border: `1px solid ${RGA.border}`,
          background: "rgba(0,0,0,0.5)",
          fontFamily: "'JetBrains Mono', monospace",
          color: RGA.text,
          maxWidth: 740,
        }}
      >
        <div style={{ fontSize: 10, color: accent, letterSpacing: "0.3em", marginBottom: 10 }}>&gt; QUOTE</div>
        <div style={{ fontSize: 18, lineHeight: 1.5, color: RGA.text }}>{children}</div>
        <div style={{ fontSize: 11, color: RGA.muted, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 14 }}>
          — {attribution}
        </div>
      </blockquote>
    );
  }
  // Bar (default)
  return (
    <blockquote
      style={{
        margin: "40px 0",
        padding: "4px 0 4px 28px",
        borderLeft: `2px solid ${accent}`,
        boxShadow: `-2px 0 18px -4px ${accent}`,
        maxWidth: 720,
      }}
    >
      <p
        style={{
          fontFamily: "'Black Ops One', sans-serif",
          fontSize: "clamp(26px, 2.4vw, 36px)",
          lineHeight: 1.1,
          letterSpacing: "0.005em",
          textTransform: "uppercase",
          color: RGA.text,
          margin: 0,
          textShadow: `0 0 24px ${accent}22`,
        }}
      >
        {children}
      </p>
      <div
        style={{
          marginTop: 18,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: accent,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
        }}
      >
        — {attribution}
      </div>
    </blockquote>
  );
};

const Callout = ({ type = "info", title, children, accent }) => {
  const map = {
    info:    { c: RGA.cyan,    label: "Info" },
    tip:     { c: accent,      label: "Tip" },
    warning: { c: RGA.magenta, label: "Warning" },
    success: { c: accent,      label: "Success" },
    danger:  { c: RGA.magenta, label: "Danger" },
    error:   { c: RGA.magenta, label: "Error" },
    note:    { c: RGA.text2,   label: "Note" },
  };
  const t = map[type] || map.info;
  return (
    <aside
      role="note"
      style={{
        margin: "28px 0",
        padding: "18px 22px",
        borderLeft: `2px solid ${t.c}`,
        background: `${t.c}0A`,
        color: RGA.text,
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        maxWidth: 720,
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.3em",
          color: t.c,
          flexShrink: 0,
          paddingTop: 3,
          minWidth: 80,
          textTransform: "uppercase",
        }}
      >
        {(title || t.label).toUpperCase()}
      </span>
      <div style={{ fontSize: 15.5, lineHeight: 1.55, color: RGA.text }}>{children}</div>
    </aside>
  );
};

const CodeBlock = ({ language, code, filename, accent }) => (
  <div
    style={{
      margin: "28px 0",
      border: `1px solid ${RGA.border}`,
      background: "rgba(0,0,0,0.6)",
      fontFamily: "'JetBrains Mono', monospace",
      maxWidth: 740,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 14px",
        borderBottom: `1px solid ${RGA.border}`,
        fontSize: 10,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
      }}
    >
      <span style={{ color: accent }}>◉</span>
      <span style={{ color: RGA.text3 }}>{filename}</span>
      <span style={{ flex: 1 }} />
      <span style={{ color: RGA.muted }}>{language}</span>
      <button
        type="button"
        style={{
          padding: "4px 8px",
          border: `1px solid ${RGA.border}`,
          color: RGA.text2,
          background: "transparent",
          fontFamily: "inherit",
          fontSize: 10,
          letterSpacing: "0.2em",
          cursor: "pointer",
          textTransform: "uppercase",
        }}
      >
        Copy
      </button>
    </div>
    <pre
      style={{
        margin: 0,
        padding: "18px 20px",
        fontSize: 13,
        lineHeight: 1.6,
        color: RGA.text,
        whiteSpace: "pre",
        overflow: "auto",
      }}
    >
{code}
    </pre>
  </div>
);

const TldrBlock = ({ items, accent }) => (
  <section
    style={{
      margin: "8px 0 40px",
      padding: "22px 24px 24px",
      border: `1px solid ${RGA.border}`,
      background: `linear-gradient(180deg, ${accent}08 0%, transparent 100%)`,
      maxWidth: 820,
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 16 }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.35em",
        color: accent,
      }}>
        // TL;DR
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.25em",
        color: RGA.muted,
        textTransform: "uppercase",
      }}>
        4 takeaways · 45 sec read
      </span>
    </div>
    <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 36px" }}>
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            display: "flex",
            gap: 14,
            fontSize: 15,
            lineHeight: 1.5,
            color: RGA.text,
          }}
        >
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: accent,
            fontSize: 11,
            letterSpacing: "0.2em",
            paddingTop: 3,
            flexShrink: 0,
          }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ol>
  </section>
);

const TerminologyGrid = ({ accent }) => (
  <div
    style={{
      margin: "20px 0 24px",
      border: `1px solid ${RGA.border}`,
      background: "rgba(0,0,0,0.35)",
      maxWidth: 820,
    }}
  >
    <div style={{
      padding: "10px 18px",
      borderBottom: `1px solid ${RGA.border}`,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      color: RGA.muted,
      display: "flex",
      gap: 18,
    }}>
      <span style={{ color: accent }}>// GLOSSARY</span>
      <span>RAID_COMMS / V2.1</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {TERMS.map((t, i) => (
        <div
          key={t.term}
          style={{
            padding: "18px 22px",
            borderRight: i % 2 === 0 ? `1px solid ${RGA.border}` : "none",
            borderBottom: i < TERMS.length - 2 ? `1px solid ${RGA.border}` : "none",
          }}
        >
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 18,
            color: accent,
            fontWeight: 700,
            letterSpacing: "0.02em",
            marginBottom: 4,
          }}>
            {t.term}
          </div>
          <div style={{ fontSize: 14, color: RGA.text, marginBottom: 10, lineHeight: 1.4 }}>{t.short}</div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11.5,
            color: RGA.text3,
            lineHeight: 1.55,
          }}>
            {t.example}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MemberLock = ({ accent, visible }) => {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "relative",
        margin: "40px 0",
        maxWidth: 740,
        border: `1px solid ${RGA.magenta}55`,
        background: "rgba(255,0,255,0.04)",
        padding: "28px 30px 30px",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -10,
          left: 20,
          padding: "4px 10px",
          background: RGA.void,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.3em",
          color: RGA.magenta,
          textTransform: "uppercase",
        }}
      >
        ◆ MEMBERS ONLY FROM HERE
      </div>
      <h3 style={{
        fontFamily: "'Black Ops One', sans-serif",
        fontSize: 32,
        letterSpacing: "0.01em",
        textTransform: "uppercase",
        margin: "6px 0 14px",
        color: RGA.text,
      }}>
        The rest of the VoD analysis is for RGA members.
      </h3>
      <p style={{ fontSize: 15.5, lineHeight: 1.55, color: RGA.text2, margin: 0, maxWidth: 620 }}>
        Hook up your Discord to prove you're in the server, and the full 2,300 words — including frame-by-frame callout timings from wipe 11 — will load right here.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 20, alignItems: "center", flexWrap: "wrap" }}>
        <a
          href="#"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 20px",
            background: accent,
            color: RGA.void,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: `0 0 24px ${accent}55`,
          }}
        >
          <DiscordGlyph size={14} /> Sign in with Discord <span>→</span>
        </a>
        <a
          href="#"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: RGA.text3,
            textDecoration: "none",
            padding: "12px 6px",
          }}
        >
          What is RGA? ↗
        </a>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Related articles
// ─────────────────────────────────────────────────────────────────────

const RELATED = [
  { code: "ART_0461", topic: "Post-mortem", title: "How we broke our own Rules doc twice in three months.", meta: "COMMUNITY · 8 MIN", accent: "cyan" },
  { code: "ART_0457", topic: "Guide",       title: "A scheduling template for timezone-scrambled squads.",  meta: "OPS · 6 MIN",      accent: "green" },
  { code: "ART_0448", topic: "Essay",       title: "On not being a sweat when you know the answer.",         meta: "CULTURE · 11 MIN",  accent: "magenta" },
];

const Related = ({ accent }) => (
  <section style={{ padding: "80px 48px 40px", maxWidth: 1480, margin: "0 auto", borderTop: `1px solid ${RGA.border}` }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 32 }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.35em",
        color: accent,
      }}>
        // RELATED · ART_0472
      </span>
      <h3 style={{
        fontFamily: "'Black Ops One', sans-serif",
        fontSize: 38,
        letterSpacing: "0.01em",
        textTransform: "uppercase",
        margin: 0,
        color: RGA.text,
      }}>
        Runs from the same squad
      </h3>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
      {RELATED.map((r) => {
        const c = RGA[r.accent] || accent;
        return (
          <a
            key={r.code}
            href="#"
            style={{
              textDecoration: "none",
              color: RGA.text,
              border: `1px solid ${RGA.border}`,
              background: "rgba(0,0,0,0.35)",
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              minHeight: 280,
              position: "relative",
              transition: "border-color .2s",
            }}
          >
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: c,
            }}>
              {r.code} · {r.topic}
            </div>
            <div
              aria-hidden="true"
              style={{
                height: 120,
                background: `
                  repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 8px, transparent 8px 16px),
                  radial-gradient(ellipse at 30% 40%, ${c}18 0%, transparent 60%)
                `,
                border: `1px solid ${RGA.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.3em",
                color: c,
                textTransform: "uppercase",
              }}
            >
              ◯ cover
            </div>
            <h4 style={{
              fontFamily: "'Black Ops One', sans-serif",
              fontSize: 22,
              lineHeight: 1.1,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              margin: 0,
              color: RGA.text,
              flex: 1,
            }}>
              {r.title}
            </h4>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.25em",
              color: RGA.muted,
              textTransform: "uppercase",
            }}>
              <span>{r.meta}</span>
              <span style={{ color: c }}>READ →</span>
            </div>
          </a>
        );
      })}
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────
// Comments teaser
// ─────────────────────────────────────────────────────────────────────

const COMMENTS = [
  { user: "Ashley", role: "Mod", body: "The 'apologies for cancelling' rule honestly changed our squad too. Highly recommend.", when: "2h ago", color: "green" },
  { user: "Q",      role: "",    body: "The bop / flip / my-left terminology is going straight into our raid doc, thanks.", when: "4h ago", color: "cyan" },
  { user: "carter", role: "",    body: "The kitchen-lap move is real. I've done it three times this season.", when: "yesterday", color: "magenta" },
];

const Comments = ({ accent }) => (
  <section style={{ padding: "40px 48px 80px", maxWidth: 1480, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 28 }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.35em",
        color: accent,
      }}>
        // DISCUSSION · 28 COMMENTS
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.25em",
        color: RGA.muted,
        textTransform: "uppercase",
      }}>
        threaded from Discord #blog-chat
      </span>
      <span style={{ flex: 1 }} />
      <a href="#" style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: accent,
        textDecoration: "none",
      }}>
        Open in Discord ↗
      </a>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 0, border: `1px solid ${RGA.border}` }}>
      {COMMENTS.map((c, i) => {
        const col = RGA[c.color] || accent;
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr auto",
              gap: 18,
              padding: "18px 22px",
              borderBottom: i < COMMENTS.length - 1 ? `1px solid ${RGA.border}` : "none",
              alignItems: "flex-start",
            }}
          >
            <div style={{
              width: 40, height: 40,
              border: `1px solid ${col}`,
              background: `${col}15`,
              color: col,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Black Ops One', sans-serif",
              fontSize: 13,
              letterSpacing: "0.05em",
            }}>
              {c.user.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                <span style={{ color: RGA.text, fontSize: 14, fontWeight: 500 }}>{c.user}</span>
                {c.role && (
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "0.3em",
                    color: col,
                    border: `1px solid ${col}`,
                    padding: "1px 6px",
                    textTransform: "uppercase",
                  }}>
                    {c.role}
                  </span>
                )}
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: RGA.muted,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}>
                  {c.when}
                </span>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.55, color: RGA.text2 }}>{c.body}</div>
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: RGA.muted,
              textTransform: "uppercase",
              display: "flex",
              gap: 12,
            }}>
              <span>REPLY</span>
              <span>◌</span>
            </div>
          </div>
        );
      })}
    </div>
    <div
      style={{
        marginTop: 14,
        padding: 20,
        border: `1px dashed ${RGA.border}`,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.25em",
        color: RGA.text3,
        textTransform: "uppercase",
        display: "flex",
        gap: 18,
        alignItems: "center",
      }}
    >
      <StatusDot color={accent} />
      <span>Sign in with Discord to join the thread</span>
      <span style={{ flex: 1 }} />
      <span style={{ color: accent }}>→</span>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────
// Signoff
// ─────────────────────────────────────────────────────────────────────

const Signoff = ({ article, accent }) => (
  <section style={{
    padding: "40px 48px 80px",
    maxWidth: 1480,
    margin: "0 auto",
    borderTop: `1px solid ${RGA.border}`,
  }}>
    <div style={{
      display: "grid",
      gridTemplateColumns: "1.3fr 1fr",
      gap: 40,
      alignItems: "start",
    }}>
      <div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.35em",
          color: accent,
          marginBottom: 14,
        }}>
          // END OF DOCUMENT · {article.code}
        </div>
        <div style={{
          fontFamily: "'Black Ops One', sans-serif",
          fontSize: 48,
          lineHeight: 1,
          letterSpacing: "0.01em",
          textTransform: "uppercase",
          color: RGA.text,
          marginBottom: 18,
        }}>
          Come run it <span style={{ color: accent, textShadow: `0 0 18px ${accent}66` }}>with us.</span>
        </div>
        <p style={{ fontSize: 17, color: RGA.text2, lineHeight: 1.55, margin: "0 0 22px 0", maxWidth: 540 }}>
          We raid Tuesdays 21:00 UTC. Members-only. No sweats. If any of this sounds like your kind of night, say hi in #raid-signup.
        </p>
        <a
          href="#"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "13px 22px",
            background: accent,
            color: RGA.void,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: `0 0 28px ${accent}55`,
          }}
        >
          <DiscordGlyph size={14} /> Join Discord <span>→</span>
        </a>
      </div>

      <div style={{
        border: `1px solid ${RGA.border}`,
        background: "rgba(0,0,0,0.4)",
        padding: 24,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: accent, marginBottom: 14 }}>
          // CITATION
        </div>
        <div style={{ fontSize: 13, color: RGA.text2, lineHeight: 1.7 }}>
          <div><span style={{ color: RGA.muted, letterSpacing: "0.2em" }}>AUTHOR</span> &nbsp;{article.authors.map(a => a.name).join(", ")}</div>
          <div><span style={{ color: RGA.muted, letterSpacing: "0.2em" }}>TITLE&nbsp;</span> &nbsp;{article.title}</div>
          <div><span style={{ color: RGA.muted, letterSpacing: "0.2em" }}>FIELD&nbsp;</span> &nbsp;Rogue Army / {article.topic.label}</div>
          <div><span style={{ color: RGA.muted, letterSpacing: "0.2em" }}>DATE&nbsp;&nbsp;</span> &nbsp;{article.publishedAt}</div>
          <div><span style={{ color: RGA.muted, letterSpacing: "0.2em" }}>URL&nbsp;&nbsp;&nbsp;</span> &nbsp;roguearmy.xyz/blog/{article.slug}</div>
        </div>
        <div style={{
          marginTop: 18, paddingTop: 18,
          borderTop: `1px solid ${RGA.border}`,
          display: "flex", gap: 8,
        }}>
          {["Copy BibTeX", "Permalink", "RSS"].map((l) => (
            <span key={l} style={{
              padding: "6px 10px",
              border: `1px solid ${RGA.border}`,
              fontSize: 10,
              letterSpacing: "0.25em",
              color: RGA.text3,
              textTransform: "uppercase",
              cursor: "pointer",
            }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────
// Progress bar (fixed on top)
// ─────────────────────────────────────────────────────────────────────

const TopProgress = ({ progress, accent }) => (
  <div
    aria-hidden="true"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      zIndex: 40,
    }}
  >
    <div
      style={{
        height: "100%",
        width: `${progress * 100}%`,
        background: `linear-gradient(90deg, ${accent}, ${RGA.cyan}, ${RGA.magenta})`,
        boxShadow: `0 0 10px ${accent}`,
        transition: "width .1s linear",
      }}
    />
  </div>
);

// ═════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════

const ACCENT_MAP = { green: RGA.green, cyan: RGA.cyan, magenta: RGA.magenta };

const DEFAULT_PROPS = {
  heroStyle: "stack",
  accent: "green",
  density: "comfortable",
  pullQuoteStyle: "bar",
  showMemberLock: true,
  showRightRail: true,
  showTldr: true,
};

const Article = (props = {}) => {
  const v = { ...DEFAULT_PROPS, ...props };
  const accent = ACCENT_MAP[v.accent] || RGA.green;

  const [activeId, setActiveId] = useState(ARTICLE.sections[0].id);
  // Progress is static in static artboard context; left-rail active defaults to first section
  const progress = 0.42;
  const rootRef = useRef(null);

  const Hero =
    v.heroStyle === "split" ? HeroSplit :
    v.heroStyle === "terminal" ? HeroTerminal :
    HeroStack;

  return (
    <main
      style={{
        background: RGA.void,
        color: RGA.text,
        fontFamily: "Outfit, system-ui, sans-serif",
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <TopNav accent={accent} />
      <Breadcrumb article={ARTICLE} accent={accent} />
      <Hero article={ARTICLE} accent={accent} />

      {/* 3-column layout */}
      <div
        style={{
          maxWidth: 1480,
          margin: "0 auto",
          padding: "56px 48px 0",
          display: "grid",
          gridTemplateColumns: v.showRightRail ? "220px 1fr 260px" : "220px 1fr",
          gap: 56,
          alignItems: "flex-start",
          position: "relative",
          zIndex: 2,
        }}
      >
        <LeftRail sections={ARTICLE.sections} activeId={activeId} accent={accent} />

        {/* BODY */}
        <article>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.3em",
              color: RGA.muted,
              marginBottom: 20,
              paddingBottom: 18,
              borderBottom: `1px solid ${RGA.border}`,
              textTransform: "uppercase",
            }}
          >
            DOC {ARTICLE.code} · {ARTICLE.topic.label.toUpperCase()} · WORDCOUNT {ARTICLE.wordCount.toLocaleString()} · UPDATED {ARTICLE.updatedAt.toUpperCase()}
          </div>

          {v.showTldr && <TldrBlock items={ARTICLE.tldr} accent={accent} />}

          {/* Section 01 */}
          <section data-section-id="the-setup" style={{ padding: "24px 0 40px", borderBottom: `1px solid ${RGA.border}` }}>
            <SectionHeader num="01" title="The setup, and why Tuesday" id="the-setup" accent={accent} />
            <Paragraph density={v.density}>
              We are six to eight adults with jobs. Four of us have kids. Two of us live in timezones that do not share a name. The only three-hour block where all of us are online and not falling asleep is Tuesday, 21:00 to 00:00 UTC. So we raid on Tuesday.
            </Paragraph>
            <Paragraph density={v.density}>
              For two months we ran Normal. We cleared it seven times, got comfortable, made the jokes you make when you have cleared something seven times. Then somebody — fine, me — said the thing: <em style={{ color: RGA.text }}>"should we try Mythic?"</em> Nobody said no out loud, which in a community this age is how consensus happens.
            </Paragraph>

            <PullQuote accent={accent} style={v.pullQuoteStyle} attribution="D3V · raid lead">
              Mythic isn't a skill problem. It's a calendar problem.
            </PullQuote>

            <Paragraph density={v.density}>
              The first rule of this whole project was: nobody practices between Tuesdays. If the run requires you to grind between sessions, the run isn't for this squad. Whatever we clear, we clear in three hours or not at all.
            </Paragraph>
          </section>

          {/* Section 02 */}
          <section data-section-id="the-schedule" style={{ padding: "40px 0", borderBottom: `1px solid ${RGA.border}` }}>
            <SectionHeader num="02" title="Scheduling is the hard part" id="the-schedule" accent={accent} />
            <Paragraph density={v.density}>
              Mythic takes roughly six runs to clear, first time, with a party that has read a guide. We had three hours. The math does not work if you treat the three hours like one block. It only works if you treat it like four blocks:
            </Paragraph>
            <BulletList
              accent={accent}
              items={[
                "0:00–0:20 — loadout check, last-patch diff, reminder of the three new mechanics. No teaching, no backtracking.",
                "0:20–1:10 — encounter 1. Hard deadline at 1:10 regardless of outcome.",
                "1:10–2:00 — encounter 2.",
                "2:00–2:50 — encounter 3.",
                "2:50–3:00 — VoD clips, nominate MVP, schedule next Tuesday before anyone logs.",
              ]}
            />
            <Callout type="tip" title="Rule" accent={accent}>
              If you blow a block, you don't get it back. You either eat the loss and move on, or you cancel the remainder of the night. <strong>Nobody apologizes for calling the cancel.</strong> It's a valid outcome.
            </Callout>
          </section>

          {/* Section 03 */}
          <section data-section-id="calls" style={{ padding: "40px 0", borderBottom: `1px solid ${RGA.border}` }}>
            <SectionHeader num="03" title="Why your call-outs are the problem" id="calls" accent={accent} />
            <Paragraph density={v.density}>
              Here's the thing nobody tells you about Mythic: the mechanics aren't harder. The timing windows are. Normal forgives a half-second late rotation. Mythic doesn't. Which means your voice chat needs to be as tight as the game.
            </Paragraph>
            <Paragraph density={v.density}>
              We recorded six runs and watched them back. The wipes clustered around call-out failures, not mechanical ones. Somebody said "left" when they meant "my left." Somebody said "three" at the end of an adjacent sentence and a teammate swapped at three instead of at two. Somebody else just sighed into a hot mic.
            </Paragraph>

            {/* Figure */}
            <HeroPlaceholder
              accent={accent}
              caption="wipe 11 · final DPS phase · call-out timing overlay"
              credit="telemetry by @d3v"
              ratio="16 / 8"
              label="FIG_01 // vod_wipe_11_timings.png"
            />

            <div style={{ height: 20 }} />

            <Callout type="warning" accent={accent}>
              Do not record your squad's voice chat without explicit consent from everyone in the channel. It's rule 04. It's also the law in most places.
            </Callout>
          </section>

          {/* Section 04 — terminology */}
          <section data-section-id="terminology" style={{ padding: "40px 0", borderBottom: `1px solid ${RGA.border}` }}>
            <SectionHeader num="04" title="The terminology we ended up with" id="terminology" accent={accent} />
            <Paragraph density={v.density}>
              After the VoD review we pinned a terminology sheet in Discord. Everyone uses the same six words, everyone knows what they mean, and nobody has to interpret in the moment. Here it is:
            </Paragraph>
            <TerminologyGrid accent={accent} />
            <Paragraph density={v.density}>
              The sheet lives in <code style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(0,255,65,0.08)", padding: "1px 6px", color: accent, fontSize: 14 }}>#tuesday-crew/pins</code>. New members read it before their first raid. Non-negotiable.
            </Paragraph>

            <CodeBlock
              accent={accent}
              filename="raid-comms.ts"
              language="typescript"
              code={`// Our canonical call-out grammar.
// Parsed by the Twitch overlay; also used in VoD reviews.

export type Call =
  | { verb: "bop";   beat: number }
  | { verb: "flip";  clock: 1|2|3|4|5|6|7|8|9|10|11|12 }
  | { verb: "clear"; zone: string }
  | { verb: "hold";  zone: string }
  | { verb: "eyes";  zone: string; count?: number };

export const isValidCall = (c: Call) =>
  c.verb === "bop" ? c.beat > 0 : true;`}
            />
          </section>

          {/* MEMBER LOCK (if enabled) */}
          <MemberLock accent={accent} visible={v.showMemberLock} />

          {/* Section 05 */}
          <section data-section-id="the-night" style={{ padding: "40px 0", borderBottom: `1px solid ${RGA.border}` }}>
            <SectionHeader num="05" title="The night it worked" id="the-night" accent={accent} />
            <Paragraph density={v.density}>
              Wipe 11 was the one where June's mic cut out during the final DPS phase and we lost by 4% because nobody called the final swap. Carter muted himself, got up, walked a loop around the kitchen, came back and said "one more." We didn't talk about it. That was the right move.
            </Paragraph>
            <PullQuote accent={accent} style={v.pullQuoteStyle} attribution="Koyo · healer-main">
              The six seconds of silence after the boss dropped were the best six seconds of the season.
            </PullQuote>
            <Paragraph density={v.density}>
              Wipe 14 was ours. June came back with audio. Ashley called the swap on the beat. The boss went down at 00:12, twelve minutes into territory none of us had agreed to give up, and there was a full six seconds of silence before anybody realized it was over. Then June started laughing and didn't stop for a minute.
            </Paragraph>
          </section>

          {/* Section 06 */}
          <section data-section-id="what-we-changed" style={{ padding: "40px 0 60px" }}>
            <SectionHeader num="06" title="What we changed for next season" id="what-we-changed" accent={accent} />
            <Paragraph density={v.density}>
              We codified the schedule. We wrote down the terminology. We bought Carter a fancy mic because he kept clipping, and clipping kills your callouts more than bad comms do.
            </Paragraph>
            <Paragraph density={v.density}>
              We also added a rule to the squad doc: <em style={{ color: RGA.text }}>"If you're in a bad mood, say so in chat before the first encounter. We will adjust."</em> It sounds corny. It has already saved two nights.
            </Paragraph>
            <Callout type="note" title="Post-scriptum" accent={accent}>
              If you're in an adult gaming community and you haven't written down your comms grammar, this is your sign. Ours took one pinned post and about forty minutes. It was worth every minute.
            </Callout>
          </section>

          {/* Author card + tags + share */}
          <div style={{
            marginTop: 24,
            padding: "28px 0",
            borderTop: `1px solid ${RGA.border}`,
            borderBottom: `1px solid ${RGA.border}`,
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 24,
            alignItems: "center",
          }}>
            <AuthorAvatars authors={ARTICLE.authors} accent={accent} />
            <div>
              <div style={{ fontSize: 14, color: RGA.text }}>
                {ARTICLE.authors.map(a => `${a.name} (${a.handle})`).join(" · ")}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.25em",
                color: RGA.muted,
                textTransform: "uppercase",
                marginTop: 6,
              }}>
                Filed under {ARTICLE.topic.label} · {ARTICLE.games.map(g => g.label).join(" + ")}
              </div>
            </div>
            <ActionBar accent={accent} />
          </div>
        </article>

        {v.showRightRail && (
          <RightRail article={ARTICLE} progress={progress} accent={accent} />
        )}
      </div>

      <Related accent={accent} />
      <Comments accent={accent} />
      <Signoff article={ARTICLE} accent={accent} />

      {/* Tweaks panel removed — variants are now standalone artboards */}
      {false && (
        <window.TweaksPanel>
          <window.TweakSection title="Layout">
            <window.TweakRadio
              label="Hero style"
              value={v.heroStyle}
              onChange={(x) => tweaks.set("heroStyle", x)}
              options={[
                { value: "stack",    label: "Stacked — title-over-image" },
                { value: "split",    label: "Split — title + image side-by-side" },
                { value: "terminal", label: "Terminal — monospaced cat command" },
              ]}
            />
            <window.TweakRadio
              label="Density"
              value={v.density}
              onChange={(x) => tweaks.set("density", x)}
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact",     label: "Compact" },
              ]}
            />
            <window.TweakToggle
              label="Show TL;DR block"
              value={v.showTldr}
              onChange={(x) => tweaks.set("showTldr", x)}
            />
            <window.TweakToggle
              label="Show right rail (meta + reactions)"
              value={v.showRightRail}
              onChange={(x) => tweaks.set("showRightRail", x)}
            />
          </window.TweakSection>

          <window.TweakSection title="Tone">
            <window.TweakRadio
              label="Accent color"
              value={v.accent}
              onChange={(x) => tweaks.set("accent", x)}
              options={[
                { value: "green",   label: "Matrix green (default)" },
                { value: "cyan",    label: "Ion cyan" },
                { value: "magenta", label: "Glitch magenta" },
              ]}
            />
            <window.TweakRadio
              label="Pull quote style"
              value={v.pullQuoteStyle}
              onChange={(x) => tweaks.set("pullQuoteStyle", x)}
              options={[
                { value: "bar",      label: "Display — oversized bar quote" },
                { value: "terminal", label: "Terminal — monospace box" },
              ]}
            />
            <window.TweakToggle
              label="Show members-only lock"
              value={v.showMemberLock}
              onChange={(x) => tweaks.set("showMemberLock", x)}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </main>
  );
};

Object.assign(window, { Article });
