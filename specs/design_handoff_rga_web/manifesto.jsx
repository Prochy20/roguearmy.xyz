/* global React */
const { useEffect, useMemo, useRef, useState } = React;

// ═════════════════════════════════════════════════════════════════════
// RGA Rulebook — shared chrome for Rules / Privacy / Terms
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
};

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ═══════════════════════════════════════════════════════════════════════
// DOCUMENT DATA — all three documents in one shape.
// Each section has { num, title, body: [paragraph | {bullets:[…]} | {callout, tone}] }
// ═══════════════════════════════════════════════════════════════════════

const DOCS = {
  rules: {
    key: "rules",
    code: "DOC_01",
    kicker: "House rules",
    title: "The Rules",
    subtitle:
      "Nine rules. Short enough to read, specific enough to enforce. If you can't live with them, Rogue Army isn't for you — and that's fine.",
    version: "4.2",
    updated: "April 12, 2026",
    readTime: "6 min",
    signoff:
      "These rules are enforced by human mods, in good faith, in context. If we get it wrong, ping a @mod and we'll hear you out.",
    sections: [
      {
        num: "01",
        title: "Adults only (25+)",
        body: [
          "Rogue Army is a community of gamers 25 and up. We're not gatekeeping maturity — we're protecting a vibe. If you're under 25, there are great communities for you. This isn't one of them.",
          { callout: "If you lie about your age to join, you're out. We check.", tone: "magenta" },
        ],
      },
      {
        num: "02",
        title: "No toxicity. Ever.",
        body: [
          "Slurs, harassment, dogpiling, condescension, rage-quits in voice chat, shit-talking teammates after a loss — all of it is bannable. We play to have fun; we don't play to tear each other down.",
          {
            bullets: [
              "Racism, sexism, homophobia, transphobia, ableism → instant ban.",
              "Doxing, threats, sharing private DMs → instant ban.",
              "Chronic negativity, even if it's 'just jokes' → warning, then ban.",
            ],
          },
        ],
      },
      {
        num: "03",
        title: "No sweats. No try-hard lectures.",
        body: [
          "Some of us want to clear raid on hard. Some of us want to vibe and die a lot. Both are valid. Do not lecture people on 'optimal' builds, do not backseat in their runs, do not mute-shame. Meet people where they are.",
        ],
      },
      {
        num: "04",
        title: "Consent in voice & video",
        body: [
          "Streaming a VC session? Ask everyone in the channel first. Recording clips? Same. Someone says no, you shut it down without sulking. Private voice channels are private.",
        ],
      },
      {
        num: "05",
        title: "No spoilers in main channels",
        body: [
          "For the first two weeks after a major release, hard spoilers go in #spoilers or behind Discord's spoiler tags. After that it's fair game, but tag thoughtful stuff anyway.",
        ],
      },
      {
        num: "06",
        title: "Self-promo is earned, not claimed",
        body: [
          "You've hung out for a while, people know you, and you made a thing? Drop it in #self-promo. Joined yesterday and dumped three YouTube links? Removed. We're a community, not a mailing list.",
        ],
      },
      {
        num: "07",
        title: "Keep politics out of gameplay channels",
        body: [
          "There's a dedicated #off-topic-hot-takes channel for politics, religion, and other load-bearing arguments. It's opt-in. Keep the rest of the server about the games we're playing and the people we're playing with.",
        ],
      },
      {
        num: "08",
        title: "Don't cheat",
        body: [
          "Cheats, exploits, RMT, account sharing to dodge a ban in a game — any of it gets you removed from our squad in that game, repeated offense gets you out of RGA. We have fun here because the runs are real.",
        ],
      },
      {
        num: "09",
        title: "Strike system",
        body: [
          "We don't ban for one bad day. The default is: a friendly nudge → a written warning (logged) → a 7-day timeout → permanent removal. Some violations skip straight to the end (see rules 01, 02, 08).",
          { callout: "Every strike is logged in the member's file. You can ask a mod to see yours.", tone: "cyan" },
        ],
      },
    ],
  },

  privacy: {
    key: "privacy",
    code: "DOC_02",
    kicker: "What we collect, and why",
    title: "Privacy Policy",
    subtitle:
      "In plain English: we're a small gaming community, not an ad network. We collect the minimum to run the site and Discord, we don't sell your data, and most of it you can export or delete yourself.",
    version: "2.1",
    updated: "April 12, 2026",
    readTime: "8 min",
    signoff:
      "Questions? DM @ashley on Discord or email privacy@roguearmy.xyz. Real humans answer.",
    sections: [
      {
        num: "01",
        title: "Who we are",
        body: [
          "Rogue Army (RGA) is an unincorporated gaming community run by volunteers. 'We' means the mod team. 'The site' means roguearmy.xyz. 'The server' means our Discord at dc.roguearmy.xyz.",
        ],
      },
      {
        num: "02",
        title: "What the site collects",
        body: [
          "When you visit the site, your browser sends us the usual: IP address, user agent, the page you requested. We keep a 30-day rolling access log for abuse detection and then it's deleted.",
          {
            bullets: [
              "No third-party analytics. No Google Analytics, no Meta Pixel, no Mixpanel.",
              "One first-party cookie (session) if you log in. Deleted on logout.",
              "Local storage for UI prefs (theme, read progress, bookmarks). Clearable in your browser.",
            ],
          },
        ],
      },
      {
        num: "03",
        title: "What the server collects",
        body: [
          "If you log into the site with Discord, we receive your Discord user ID, username, avatar URL, and which RGA roles you have. We store these to authenticate you and show you member-only content. That's it.",
          { callout: "We do NOT receive your email, phone, or any other Discord servers you're in.", tone: "green" },
        ],
      },
      {
        num: "04",
        title: "What we never touch",
        body: [
          {
            bullets: [
              "Payment info. We don't take payments — there's nothing to pay for.",
              "Your DMs, anywhere. Mods can't read your Discord DMs. Nobody can.",
              "Biometric data, location data beyond IP, or any form of device fingerprinting.",
              "Your gameplay data from Steam / Xbox / PSN / etc.",
            ],
          },
        ],
      },
      {
        num: "05",
        title: "Third parties",
        body: [
          "The site runs on infrastructure from Vercel (hosting) and MongoDB Atlas (database). They see the same kind of technical data a landlord sees: you were here, at this time, for this long. They don't have access to who you are.",
          "Discord obviously sees your Discord activity; that's their platform, not ours. Their privacy policy applies separately.",
        ],
      },
      {
        num: "06",
        title: "Your rights",
        body: [
          "You can, at any time:",
          {
            bullets: [
              "Request an export of everything we have linked to your Discord ID (returned as JSON within 7 days).",
              "Request deletion of your account and all associated data. Public posts are anonymized, not erased.",
              "Withdraw consent — log out of the site and leave the server. Your data is purged in 30 days.",
            ],
          },
          "Email privacy@roguearmy.xyz for any of the above.",
        ],
      },
      {
        num: "07",
        title: "Security",
        body: [
          "Passwords don't exist here — we use Discord OAuth. Sessions are signed and rotated. Database access is limited to two admins. We've had zero breaches since 2019 and we'd tell you publicly if we hadn't.",
        ],
      },
      {
        num: "08",
        title: "Changes to this policy",
        body: [
          "If we change anything material, we post an announcement in #news at least 14 days before it takes effect. The version number at the top of this document goes up. You can see the full changelog at /privacy/changelog.",
        ],
      },
    ],
  },

  terms: {
    key: "terms",
    code: "DOC_03",
    kicker: "The small print, without the small type",
    title: "Terms of Use",
    subtitle:
      "A contract between you and a volunteer gaming community. Not written by lawyers. Not enforceable in most places. Worth reading anyway, because it's how we operate.",
    version: "3.0",
    updated: "April 12, 2026",
    readTime: "5 min",
    signoff:
      "By using the site or the Discord, you accept these terms. If you don't, log out and leave the server — no hard feelings.",
    sections: [
      {
        num: "01",
        title: "What you can do",
        body: [
          "Read anything on the site. Post in Discord per the Rules. Share links freely. Quote our blog posts with attribution. Fork our public code (most of it is MIT).",
        ],
      },
      {
        num: "02",
        title: "What you can't do",
        body: [
          {
            bullets: [
              "Scrape the site or the Discord at rates that look abusive. 1 req/sec is fine; 100 is not.",
              "Use RGA assets — logo, wordmark, colors in layout — to imply we endorse your thing. Ask first.",
              "Repost members-only articles in public. Those are locked for a reason.",
              "Automate accounts. One human, one Discord account, one RGA membership.",
            ],
          },
        ],
      },
      {
        num: "03",
        title: "Content you post",
        body: [
          "Anything you post in Discord stays yours. By posting, you grant us a non-exclusive license to display it inside the server and (for opt-in highlights) in our blog. You can revoke this by deleting the message; we don't archive it separately.",
        ],
      },
      {
        num: "04",
        title: "Content we post",
        body: [
          "Blog posts, series, and site content are © Rogue Army contributors. Articles under the 'members' tag are for members only — please don't redistribute. Public articles are free to link to and quote with attribution (250 words max, a link back, don't rewrite our conclusion as yours).",
        ],
      },
      {
        num: "05",
        title: "No warranty",
        body: [
          "The site runs on volunteer time. It might go down. It might lose a feature. It might show you a stale cache. We try hard to keep it working; we promise nothing. Use it at your own risk.",
          { callout: "If the site is your only backup of something important — back it up somewhere else. Also, why?", tone: "magenta" },
        ],
      },
      {
        num: "06",
        title: "Termination",
        body: [
          "We can remove your account and Discord membership if you break the Rules. You can delete yourself at any time by emailing privacy@roguearmy.xyz (see the Privacy Policy). We owe each other nothing after that, except basic decency.",
        ],
      },
      {
        num: "07",
        title: "Changes to these terms",
        body: [
          "Same promise as the privacy policy: 14 days notice in #news, version bump at the top, full changelog at /terms/changelog. If we make a change you can't live with, leave — no hard feelings.",
        ],
      },
      {
        num: "08",
        title: "Governing law",
        body: [
          "We're volunteers scattered across four countries. There's no single jurisdiction. Any dispute you bring will be answered on Discord, in public, by a mod. That's the only court we have.",
        ],
      },
    ],
  },
};

const TAB_ORDER = ["rules", "privacy", "terms"];

// ═══════════════════════════════════════════════════════════════════════
// Primitive: Discord glyph (reused from footer work)
// ═══════════════════════════════════════════════════════════════════════
const DiscordGlyph = ({ size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
  </svg>
);

// Scanlines + noise for atmosphere
const Scanlines = ({ opacity = 0.04 }) => (
  <div
    aria-hidden="true"
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

// ═══════════════════════════════════════════════════════════════════════
// Small UI bits
// ═══════════════════════════════════════════════════════════════════════

const StatusDot = ({ color = RGA.green }) => (
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
    }}
  >
    {children}
  </span>
);

// Section tag with tone color
const toneMap = {
  green: { bg: "rgba(0,255,65,0.06)", border: "rgba(0,255,65,0.35)", text: RGA.green, label: "NOTE" },
  cyan:  { bg: "rgba(0,255,255,0.06)", border: "rgba(0,255,255,0.35)", text: RGA.cyan,  label: "HEADS UP" },
  magenta:{ bg: "rgba(255,0,255,0.06)", border: "rgba(255,0,255,0.35)", text: RGA.magenta, label: "WARNING" },
};

const Callout = ({ tone = "green", children }) => {
  const t = toneMap[tone] || toneMap.green;
  return (
    <div
      role="note"
      style={{
        position: "relative",
        margin: "22px 0",
        padding: "16px 20px 16px 22px",
        borderLeft: `2px solid ${t.border}`,
        background: t.bg,
        color: RGA.text,
        fontSize: 15.5,
        lineHeight: 1.55,
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.3em",
          color: t.text,
          flexShrink: 0,
          paddingTop: 2,
          minWidth: 72,
        }}
      >
        {t.label}
      </span>
      <span>{children}</span>
    </div>
  );
};

// Bullet list
const RuleBullets = ({ items }) => (
  <ul
    style={{
      listStyle: "none",
      padding: 0,
      margin: "16px 0",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}
  >
    {items.map((t, i) => (
      <li
        key={i}
        style={{
          position: "relative",
          paddingLeft: 28,
          fontSize: 16.5,
          lineHeight: 1.6,
          color: RGA.text2,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: "0.65em",
            width: 14,
            height: 1,
            background: RGA.green,
            boxShadow: `0 0 6px ${RGA.green}`,
            opacity: 0.8,
          }}
        />
        {t}
      </li>
    ))}
  </ul>
);

// ═══════════════════════════════════════════════════════════════════════
// Section component — renders one numbered section
// ═══════════════════════════════════════════════════════════════════════
const Section = ({ section, read, onToggleRead }) => {
  const id = slug(section.title);
  return (
    <section
      id={id}
      data-section-id={id}
      style={{
        scrollMarginTop: 120,
        padding: "40px 0",
        borderBottom: `1px solid ${RGA.border}`,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 20,
          marginBottom: 18,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.3em",
            color: RGA.green,
            flexShrink: 0,
            width: 42,
          }}
        >
          {section.num}
        </span>
        <h2
          style={{
            fontFamily: "'Hanson Bold','Black Ops One',sans-serif",
            fontSize: 34,
            lineHeight: 1.05,
            letterSpacing: "0.01em",
            textTransform: "uppercase",
            margin: 0,
            color: RGA.text,
            flex: 1,
          }}
        >
          {section.title}
        </h2>
        <button
          type="button"
          onClick={() => onToggleRead(id)}
          aria-pressed={read}
          style={{
            flexShrink: 0,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: read ? RGA.void : RGA.text3,
            background: read ? RGA.green : "transparent",
            border: `1px solid ${read ? RGA.green : RGA.border}`,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          {read ? "✓ READ" : "MARK READ"}
        </button>
      </header>

      <div style={{ paddingLeft: 62, maxWidth: 680 }}>
        {section.body.map((block, i) => {
          if (typeof block === "string") {
            return (
              <p
                key={i}
                style={{
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: RGA.text2,
                  margin: "0 0 16px 0",
                }}
              >
                {block}
              </p>
            );
          }
          if (block.bullets) return <RuleBullets key={i} items={block.bullets} />;
          if (block.callout) return <Callout key={i} tone={block.tone}>{block.callout}</Callout>;
          return null;
        })}
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Nav tabs for switching documents
// ═══════════════════════════════════════════════════════════════════════
const DocTabs = ({ active, onSelect }) => (
  <div
    role="tablist"
    aria-label="Policy documents"
    style={{
      display: "flex",
      gap: 0,
      borderTop: `1px solid ${RGA.border}`,
      borderBottom: `1px solid ${RGA.border}`,
      background: "rgba(0,0,0,0.4)",
    }}
  >
    {TAB_ORDER.map((key) => {
      const d = DOCS[key];
      const on = key === active;
      return (
        <button
          key={key}
          role="tab"
          aria-selected={on}
          onClick={() => onSelect(key)}
          style={{
            flex: 1,
            padding: "22px 28px",
            textAlign: "left",
            background: on ? "rgba(0,255,65,0.06)" : "transparent",
            border: "none",
            borderRight: `1px solid ${RGA.border}`,
            color: on ? RGA.text : RGA.text3,
            cursor: "pointer",
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "inherit",
          }}
        >
          {on && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 2,
                background: RGA.green,
                boxShadow: `0 0 10px ${RGA.green}`,
              }}
            />
          )}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: on ? RGA.green : RGA.muted,
              letterSpacing: "0.3em",
            }}
          >
            {d.code}
          </span>
          <span
            style={{
              fontFamily: "'Hanson Bold','Black Ops One',sans-serif",
              fontSize: 20,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            {d.title}
          </span>
          <span style={{ flex: 1 }} />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: RGA.muted,
              letterSpacing: "0.2em",
            }}
          >
            v{d.version}
          </span>
        </button>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// TOC (sticky left rail) with scrollspy
// ═══════════════════════════════════════════════════════════════════════
const TableOfContents = ({ sections, activeId, readMap, filter, onFilterChange }) => {
  const matches = (s) =>
    !filter || s.title.toLowerCase().includes(filter.toLowerCase());

  return (
    <nav
      aria-label="Table of contents"
      style={{
        position: "sticky",
        top: 28,
        alignSelf: "flex-start",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.35em",
          color: RGA.green,
          marginBottom: 14,
        }}
      >
        // CONTENTS
      </div>

      <div style={{ position: "relative", marginBottom: 18 }}>
        <input
          type="text"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="search sections…"
          style={{
            width: "100%",
            background: "rgba(0,0,0,0.4)",
            border: `1px solid ${RGA.border}`,
            color: RGA.text,
            padding: "10px 12px 10px 28px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.05em",
            outline: "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: RGA.muted,
            fontSize: 12,
          }}
        >
          /
        </span>
      </div>

      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sections.map((s) => {
          const id = slug(s.title);
          const on = id === activeId;
          const isRead = !!readMap[id];
          const visible = matches(s);
          return (
            <li
              key={id}
              style={{
                opacity: visible ? 1 : 0.25,
                transition: "opacity .15s",
              }}
            >
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(id);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.replaceState(null, "", `#${id}`);
                }}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "baseline",
                  padding: "9px 0",
                  borderLeft: `2px solid ${on ? RGA.green : "transparent"}`,
                  paddingLeft: 12,
                  marginLeft: -14,
                  color: on ? RGA.text : RGA.text3,
                  textDecoration: "none",
                  fontSize: 12.5,
                  lineHeight: 1.4,
                  letterSpacing: "0.02em",
                  boxShadow: on ? `-2px 0 12px -4px ${RGA.green}` : "none",
                  transition: "all .15s",
                }}
              >
                <span
                  style={{
                    color: on ? RGA.green : RGA.muted,
                    fontSize: 10,
                    letterSpacing: "0.25em",
                    flexShrink: 0,
                    width: 20,
                  }}
                >
                  {s.num}
                </span>
                <span style={{ flex: 1 }}>{s.title}</span>
                {isRead && (
                  <span aria-hidden="true" style={{ color: RGA.green, fontSize: 10 }}>
                    ✓
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Meta rail (sticky right)
// ═══════════════════════════════════════════════════════════════════════
const MetaRail = ({ doc, progress, readCount, total, onReset }) => {
  const pct = Math.round(progress * 100);
  return (
    <aside
      style={{
        position: "sticky",
        top: 28,
        alignSelf: "flex-start",
        display: "flex",
        flexDirection: "column",
        gap: 22,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* DOC META CARD */}
      <div
        style={{
          border: `1px solid ${RGA.border}`,
          background: "rgba(0,0,0,0.4)",
          padding: 18,
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: RGA.green, marginBottom: 12 }}>
          // DOCUMENT
        </div>
        <MetaRow label="Code" value={doc.code} mono />
        <MetaRow label="Version" value={`v${doc.version}`} mono />
        <MetaRow label="Updated" value={doc.updated} />
        <MetaRow label="Reading" value={doc.readTime} />
        <MetaRow label="Sections" value={String(doc.sections.length).padStart(2, "0")} mono />
      </div>

      {/* PROGRESS */}
      <div
        style={{
          border: `1px solid ${RGA.border}`,
          background: "rgba(0,0,0,0.4)",
          padding: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.35em", color: RGA.green }}>// PROGRESS</span>
          <span style={{ fontSize: 10, color: RGA.text3, letterSpacing: "0.15em" }}>
            {readCount}/{total} READ
          </span>
        </div>
        <div
          style={{
            height: 4,
            background: "rgba(0,255,65,0.12)",
            position: "relative",
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              right: `${100 - pct}%`,
              background: `linear-gradient(90deg, ${RGA.green}, ${RGA.cyan})`,
              boxShadow: `0 0 10px ${RGA.green}`,
              transition: "right .35s ease-out",
            }}
          />
        </div>
        <div style={{ fontSize: 10, color: RGA.text3, letterSpacing: "0.2em" }}>{pct}% SCROLLED</div>
        {readCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            style={{
              marginTop: 12,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.25em",
              color: RGA.muted,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textTransform: "uppercase",
            }}
          >
            ↺ clear marks
          </button>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div
        style={{
          border: `1px solid ${RGA.border}`,
          background: "rgba(0,0,0,0.4)",
          padding: 18,
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: RGA.green, marginBottom: 12 }}>
          // SHORTCUTS
        </div>
        <ShortcutRow keys={["J", "K"]} label="Next / prev section" />
        <ShortcutRow keys={["1", "2", "3"]} label="Switch document" />
        <ShortcutRow keys={["/"]} label="Focus search" />
        <ShortcutRow keys={["P"]} label="Print document" />
      </div>

      <a
        href="#"
        style={{
          fontSize: 11,
          color: RGA.text3,
          textDecoration: "none",
          letterSpacing: "0.2em",
          display: "flex",
          alignItems: "center",
          gap: 8,
          textTransform: "uppercase",
        }}
      >
        ↓ download as PDF
      </a>
    </aside>
  );
};

const MetaRow = ({ label, value, mono }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 11.5 }}>
    <span style={{ color: RGA.muted, letterSpacing: "0.18em", textTransform: "uppercase" }}>{label}</span>
    <span style={{ color: RGA.text, fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit" }}>{value}</span>
  </div>
);

const ShortcutRow = ({ keys, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 11 }}>
    <span style={{ display: "inline-flex", gap: 4 }}>
      {keys.map((k, i) => (
        <Kbd key={i}>{k}</Kbd>
      ))}
    </span>
    <span style={{ color: RGA.text3 }}>{label}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// Header strip
// ═══════════════════════════════════════════════════════════════════════
const PageHeader = ({ doc }) => (
  <header style={{ position: "relative", padding: "80px 64px 32px", maxWidth: 1480, margin: "0 auto" }}>
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse 70% 80% at 70% 10%, rgba(0,255,65,0.08) 0%, transparent 55%), radial-gradient(ellipse 40% 50% at 20% 30%, rgba(0,255,255,0.05) 0%, transparent 55%)",
      }}
    />
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.35em",
          color: RGA.muted,
          textTransform: "uppercase",
          marginBottom: 18,
        }}
      >
        <StatusDot />
        <span style={{ color: RGA.green }}>ROGUE_ARMY</span>
        <span>/</span>
        <span style={{ color: RGA.text2 }}>MANIFESTO</span>
        <span>/</span>
        <span style={{ color: RGA.text }}>{doc.code}</span>
        <span style={{ flex: 1, maxWidth: 320, height: 1, background: `linear-gradient(90deg, ${RGA.green}33, transparent)` }} />
      </div>

      <div style={{ fontSize: 13, color: RGA.green, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>
        {doc.kicker}
      </div>

      <h1
        style={{
          fontFamily: "'Hanson Bold','Black Ops One',sans-serif",
          fontSize: "clamp(80px, 10vw, 168px)",
          lineHeight: 0.86,
          letterSpacing: "-0.005em",
          textTransform: "uppercase",
          margin: 0,
          color: RGA.text,
          textShadow: `-2px 0 ${RGA.cyan}55, 2px 0 ${RGA.magenta}55`,
        }}
      >
        {doc.title}
      </h1>

      <p
        style={{
          fontFamily: "Outfit, system-ui, sans-serif",
          fontSize: 20,
          lineHeight: 1.5,
          color: RGA.text2,
          maxWidth: 760,
          marginTop: 24,
        }}
      >
        {doc.subtitle}
      </p>
    </div>
  </header>
);

// ═══════════════════════════════════════════════════════════════════════
// Signoff block
// ═══════════════════════════════════════════════════════════════════════
const SignOff = ({ doc }) => (
  <div
    style={{
      marginTop: 56,
      padding: "40px 0 56px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 40,
      alignItems: "start",
    }}
  >
    <div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.35em",
          color: RGA.green,
          marginBottom: 12,
        }}
      >
        // SIGNED
      </div>
      <p
        style={{
          fontFamily: "Outfit, system-ui, sans-serif",
          fontSize: 17,
          lineHeight: 1.6,
          color: RGA.text2,
          margin: 0,
          maxWidth: 540,
        }}
      >
        {doc.signoff}
      </p>
      <div
        style={{
          marginTop: 22,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: RGA.muted,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        — THE MOD TEAM · ASHLEY, CARTER, D3V, JUNE, KOYO, Q
      </div>
    </div>

    <div
      style={{
        border: `1px solid ${RGA.border}`,
        background: "rgba(0,255,65,0.04)",
        padding: 28,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.3em",
          color: RGA.green,
          marginBottom: 10,
        }}
      >
        READ THE REST, JOIN THE DISCORD
      </div>
      <div
        style={{
          fontFamily: "'Hanson Bold','Black Ops One',sans-serif",
          fontSize: 40,
          lineHeight: 1,
          letterSpacing: "0.01em",
          textTransform: "uppercase",
          color: RGA.text,
          marginBottom: 18,
        }}
      >
        By reading, you{" "}
        <span style={{ color: RGA.green, textShadow: `0 0 18px ${RGA.green}66` }}>agreed</span>.
      </div>
      <p style={{ fontSize: 15, color: RGA.text2, margin: "0 0 22px 0", lineHeight: 1.55 }}>
        Come say hi. We don't bite, and if anyone does we kick them out per rule 02.
      </p>
      <a
        href="#"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "13px 20px",
          background: RGA.green,
          color: RGA.void,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: `0 0 28px ${RGA.green}55`,
        }}
      >
        <DiscordGlyph size={14} /> Join Discord <span>→</span>
      </a>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════
const Manifesto = () => {
  // active tab, deep-linked via hash
  const [active, setActive] = useState(() => {
    const h = (typeof window !== "undefined" && window.location.hash) || "";
    const tab = h.match(/^#(rules|privacy|terms)/);
    return tab ? tab[1] : "rules";
  });

  const [filter, setFilter] = useState("");
  const [readMap, setReadMap] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [progress, setProgress] = useState(0);

  const doc = DOCS[active];

  // scrollspy — track which section is in view + overall scroll progress
  useEffect(() => {
    const compute = () => {
      const els = Array.from(document.querySelectorAll("[data-section-id]"));
      let current = els[0]?.dataset.sectionId || null;
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 160) current = el.dataset.sectionId;
      }
      setActiveSection(current);

      const doc = document.documentElement;
      const scrolled = doc.scrollTop;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, scrolled / max) : 0);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [active]);

  // Reset read map + scroll when switching docs
  useEffect(() => {
    setReadMap({});
    setFilter("");
    window.scrollTo({ top: 0, behavior: "auto" });
    history.replaceState(null, "", `#${active}`);
  }, [active]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === "1") setActive("rules");
      else if (e.key === "2") setActive("privacy");
      else if (e.key === "3") setActive("terms");
      else if (e.key.toLowerCase() === "j" || e.key.toLowerCase() === "k") {
        e.preventDefault();
        const ids = doc.sections.map((s) => slug(s.title));
        const idx = ids.indexOf(activeSection);
        const nextIdx = e.key.toLowerCase() === "j"
          ? Math.min(ids.length - 1, idx + 1)
          : Math.max(0, idx - 1);
        const el = document.getElementById(ids[nextIdx]);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (e.key === "/") {
        e.preventDefault();
        const input = document.querySelector('input[placeholder="search sections…"]');
        if (input) input.focus();
      } else if (e.key.toLowerCase() === "p") {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, activeSection, doc]);

  const toggleRead = (id) =>
    setReadMap((m) => ({ ...m, [id]: !m[id] }));

  const readCount = useMemo(
    () => Object.values(readMap).filter(Boolean).length,
    [readMap]
  );

  return (
    <main
      style={{
        background: RGA.void,
        color: RGA.text,
        fontFamily: "Outfit, system-ui, sans-serif",
        position: "relative",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Scanlines opacity={0.035} />

      {/* Top thin progress bar */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "transparent",
          zIndex: 40,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${RGA.green}, ${RGA.cyan}, ${RGA.magenta})`,
            boxShadow: `0 0 10px ${RGA.green}`,
            transition: "width .1s linear",
          }}
        />
      </div>

      <PageHeader doc={doc} />

      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "0 64px" }}>
        <DocTabs active={active} onSelect={setActive} />
      </div>

      {/* 3-column layout */}
      <div
        style={{
          maxWidth: 1480,
          margin: "0 auto",
          padding: "40px 64px 80px",
          display: "grid",
          gridTemplateColumns: "240px 1fr 280px",
          gap: 48,
          alignItems: "flex-start",
        }}
      >
        <TableOfContents
          sections={doc.sections}
          activeId={activeSection}
          readMap={readMap}
          filter={filter}
          onFilterChange={setFilter}
        />

        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.3em",
              color: RGA.muted,
              marginBottom: 8,
              paddingBottom: 20,
              borderBottom: `1px solid ${RGA.border}`,
            }}
          >
            DOCUMENT {doc.code} · LAST UPDATED {doc.updated.toUpperCase()} · READING TIME ~ {doc.readTime.toUpperCase()}
          </div>

          {doc.sections.map((s) => (
            <Section
              key={s.num}
              section={s}
              read={!!readMap[slug(s.title)]}
              onToggleRead={toggleRead}
            />
          ))}

          <SignOff doc={doc} />
        </div>

        <MetaRail
          doc={doc}
          progress={progress}
          readCount={readCount}
          total={doc.sections.length}
          onReset={() => setReadMap({})}
        />
      </div>
    </main>
  );
};

Object.assign(window, { Manifesto });
