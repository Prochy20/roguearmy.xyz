// nav-components.jsx — RGA Fullscreen Overlay nav · variants

const { useState, useEffect, useRef } = React;

const COLORS = {
  void: '#030303',
  bgPrimary: '#0a0a0a',
  bgElevated: '#111111',
  green: '#00FF41',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  textMuted: '#555555',
};

// ─── atoms ─────────────────────────────────────────────────────────────────

function SkullMark({ size = 28, glow = 1 }) {
  return (
    <img src="assets/logo.png" alt="RGA" style={{
      width: size, height: size, objectFit: 'contain',
      filter: glow > 0
        ? `drop-shadow(0 0 ${6*glow}px rgba(0,255,65,${0.55*glow})) drop-shadow(0 0 ${14*glow}px rgba(0,255,65,${0.3*glow}))`
        : 'none',
    }} />
  );
}

function Wordmark({ size = 16, color = '#fff', glow = 0 }) {
  return (
    <span style={{
      fontFamily: '"Hanson Bold","Black Ops One",sans-serif',
      fontSize: size, letterSpacing: '0.16em', color, lineHeight: 1,
      textShadow: glow > 0 ? `0 0 ${8*glow}px rgba(0,255,65,${0.5*glow})` : 'none',
    }}>ROGUE ARMY</span>
  );
}

function DiscordIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

const Icon = {
  close: ({size=20}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  menu: ({size=20}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  arrow: ({size=14}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-5-6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  diag: ({size=14}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7m0 0H8m9 0v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ext: ({size=10}) => <svg width={size} height={size} viewBox="0 0 12 12" fill="none"><path d="M4 2h6v6M10 2L4.5 7.5M9 7v3H2V3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

function Avatar({ name = 'RagingDad', size = 28, glow = 1 }) {
  const initial = (name || 'U')[0].toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a4a2a 0%, #003b1f 100%)',
      border: '1px solid rgba(0,255,65,0.5)',
      boxShadow: glow > 0 ? `0 0 ${8*glow}px rgba(0,255,65,${0.45*glow})` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#00FF41', fontFamily: '"JetBrains Mono", monospace',
      fontWeight: 700, fontSize: size * 0.45, flex: '0 0 auto',
    }}>{initial}</div>
  );
}

// ─── shared top bar ────────────────────────────────────────────────────────

function TopBar({ glow, loggedIn, isOpen, onToggle, transparent = true, label = 'MENU' }) {
  return (
    <div style={{
      height: 80, padding: '0 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: transparent ? 'transparent' : 'rgba(3,3,3,0.85)',
      backdropFilter: transparent ? 'none' : 'blur(14px)',
      borderBottom: transparent ? '1px solid transparent' : '1px solid rgba(0,255,65,0.15)',
      position: 'relative', zIndex: 50,
    }}>
      <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
        <SkullMark size={36} glow={glow*1.2} />
        <Wordmark size={18} glow={glow*0.5} />
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 18px', height: 44,
          background: COLORS.green, color: COLORS.void,
          border: 'none', cursor: 'pointer',
          fontFamily: '"Hanson Bold","Black Ops One",sans-serif',
          fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase',
          boxShadow: glow > 0 ? `0 0 ${20*glow}px rgba(0,255,65,${0.5*glow})` : 'none',
          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
        }}>
          <DiscordIcon size={16} color={COLORS.void} />
          <span>Discord</span>
        </button>

        {loggedIn && <Avatar name="RagingDad" size={36} glow={glow} />}

        <button onClick={onToggle} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 16px', height: 44,
          background: isOpen ? '#fff' : 'rgba(255,255,255,0.06)',
          border: isOpen ? 'none' : '1px solid rgba(255,255,255,0.15)',
          color: isOpen ? COLORS.void : '#fff',
          cursor: 'pointer', transition: 'all .2s',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600,
        }}>
          {isOpen ? <Icon.close /> : <Icon.menu />}
          <span>{isOpen ? 'CLOSE' : label}</span>
        </button>
      </div>
    </div>
  );
}

// ─── nav data ──────────────────────────────────────────────────────────────

const NAV = [
  {
    label: 'HOMEPAGE', href: '/',
    blurb: 'The bunker · landing page',
    sub: [
      { label: 'Hero',          href: '/' },
      { label: 'Community',     href: '/#community' },
      { label: 'Games we play', href: '/#games' },
    ],
  },
  {
    label: 'BLOG', href: '/blog',
    blurb: 'Field reports & deep dives',
    sub: [
      { label: 'Latest articles', href: '/blog' },
      { label: 'Series',          href: '/blog/series' },
      { label: 'Bookmarks',       href: '/blog/bookmarks' },
      { label: 'Reading history', href: '/blog/history' },
    ],
  },
  {
    label: 'MEMBERS', href: '/members',
    blurb: 'Operatives & ops',
    sub: [
      { label: 'Roster',     href: '/members' },
      { label: 'Manifesto',  href: '/manifesto' },
      { label: 'Twitch hub', href: '/twitch' },
    ],
  },
];

const SOCIALS = ['DISCORD', 'TWITCH', 'YOUTUBE', 'TWITTER'];

// ─── photo tile placeholder ────────────────────────────────────────────────

function PhotoTile({ kicker, title, tint = 'green', size = 'md' }) {
  const tints = {
    green:   { glow: 'rgba(0,255,65,0.20)',  edge: 'rgba(0,255,65,0.3)' },
    cyan:    { glow: 'rgba(0,255,255,0.18)', edge: 'rgba(0,255,255,0.3)' },
    magenta: { glow: 'rgba(255,0,255,0.16)', edge: 'rgba(255,0,255,0.3)' },
    bone:    { glow: 'rgba(232,239,226,0.10)', edge: 'rgba(255,255,255,0.2)' },
  };
  const c = tints[tint];
  return (
    <div style={{
      background: `linear-gradient(135deg, ${c.glow} 0%, rgba(0,0,0,0.55) 60%),
                   repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 6px, rgba(255,255,255,0.05) 6px 12px)`,
      border: '1px solid rgba(255,255,255,0.06)',
      padding: 14, position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      minHeight: size === 'lg' ? 320 : (size === 'sm' ? 120 : 200),
    }}>
      {['tl','tr','bl','br'].map(p => {
        const m = {
          tl: { top: 6, left: 6, borderTop: `1px solid ${c.edge}`, borderLeft: `1px solid ${c.edge}` },
          tr: { top: 6, right: 6, borderTop: `1px solid ${c.edge}`, borderRight: `1px solid ${c.edge}` },
          bl: { bottom: 6, left: 6, borderBottom: `1px solid ${c.edge}`, borderLeft: `1px solid ${c.edge}` },
          br: { bottom: 6, right: 6, borderBottom: `1px solid ${c.edge}`, borderRight: `1px solid ${c.edge}` },
        };
        return <span key={p} style={{ position:'absolute', width: 10, height: 10, ...m[p] }} />;
      })}
      <span style={{
        fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
        color: 'rgba(255,255,255,0.55)', letterSpacing: '0.22em', textTransform: 'uppercase',
      }}>{kicker}</span>
      {title && <span style={{
        fontFamily: '"Hanson Bold","Black Ops One",sans-serif',
        fontSize: size === 'lg' ? 22 : 15,
        color: '#fff', letterSpacing: '0.06em', lineHeight: 1.1,
      }}>{title}</span>}
    </div>
  );
}

// ─── topo grid bg ──────────────────────────────────────────────────────────

function TopoBackground({ accent = 'green', glow = 1 }) {
  const colors = {
    green: `rgba(0,255,65,${0.15*glow + 0.06})`,
    cyan:  `rgba(0,255,255,${0.13*glow + 0.05})`,
  };
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      background: `radial-gradient(ellipse 70% 50% at 80% 20%, ${colors[accent]} 0%, transparent 60%)`,
    }}>
      <svg width="100%" height="100%" viewBox="0 0 1280 820" preserveAspectRatio="xMidYMid slice"
           style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
        <defs>
          <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.4)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
        {/* topo lines */}
        {Array.from({length: 8}).map((_, i) => (
          <path key={i}
            d={`M ${-100 + i*40} ${100 + i*60}
                Q ${320} ${20 + i*70} ${640} ${120 + i*60}
                T ${1380} ${80 + i*70}`}
            fill="none" stroke="rgba(0,255,65,0.18)" strokeWidth="1" />
        ))}
      </svg>
    </div>
  );
}

// ─── shared bottom rail ────────────────────────────────────────────────────

function BottomRail({ loggedIn, glow }) {
  return (
    <div style={{
      borderTop: '1px solid rgba(0,255,65,0.12)',
      paddingTop: 18, marginTop: 24,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      gap: 24, flexWrap: 'wrap',
    }}>
      <div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
          color: 'rgba(255,255,255,0.4)', letterSpacing: '0.25em', marginBottom: 10,
        }}>MEMBER OPS</div>
        {loggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name="RagingDad" size={36} glow={glow*1.2} />
            <div>
              <div style={{ fontFamily: '"Hanson Bold","Black Ops One",sans-serif', fontSize: 16, color: '#fff', letterSpacing: '0.06em' }}>RAGINGDAD</div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,255,65,0.7)', letterSpacing: '0.2em', marginTop: 2 }}>RANK · CAPTAIN · 412 OPS</div>
            </div>
            <a href="#" style={{
              marginLeft: 18, fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
              color: COLORS.cyan, letterSpacing: '0.2em', textTransform: 'uppercase',
              textDecoration: 'none',
            }}>Profile →</a>
            <a href="#" style={{
              marginLeft: 4, fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
              color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase',
              textDecoration: 'none',
            }}>Logout</a>
          </div>
        ) : (
          <button style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 18px',
            background: 'transparent',
            border: `1px solid rgba(0,255,255,${0.4*glow + 0.25})`,
            color: COLORS.cyan, fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: glow > 0 ? `0 0 ${10*glow}px rgba(0,255,255,${0.2*glow}) inset` : 'none',
          }}>
            <DiscordIcon size={14} />
            <span>Sign in with Discord</span>
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
          color: 'rgba(255,255,255,0.4)', letterSpacing: '0.25em',
        }}>SOCIALS</div>
        <div style={{ display: 'flex', gap: 22, fontFamily: '"Hanson Bold","Black Ops One",sans-serif', fontSize: 13, letterSpacing: '0.15em' }}>
          {SOCIALS.map(s => (
            <a key={s} href="#" style={{
              color: '#e8efe2', textDecoration: 'none',
              transition: 'color .15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = COLORS.green}
            onMouseLeave={(e) => e.currentTarget.style.color = '#e8efe2'}>{s}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── giant link row ────────────────────────────────────────────────────────

function GiantLinkRow({ link, idx, hover, onHover, glow, withSubBar = true }) {
  return (
    <li onMouseEnter={onHover} style={{
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '20px 0',
      position: 'relative',
    }}>
      <a href={link.href} style={{
        display: 'flex', alignItems: 'baseline', gap: 22,
        textDecoration: 'none', position: 'relative',
      }}>
        <span style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
          color: 'rgba(0,255,65,0.5)', minWidth: 28, alignSelf: 'flex-start', paddingTop: 14,
        }}>0{idx+1}</span>
        <span style={{
          fontFamily: '"Hanson Bold","Black Ops One",sans-serif',
          fontSize: 72, lineHeight: 0.95, letterSpacing: '0.02em',
          color: hover ? '#e8efe2' : 'rgba(232,239,226,0.55)',
          transition: 'all .25s',
          textShadow: hover && glow > 0
            ? `-2px 0 rgba(0,255,255,${0.6*glow}), 2px 0 rgba(255,0,255,${0.4*glow}), 0 0 ${22*glow}px rgba(0,255,65,${0.3*glow})`
            : 'none',
          position: 'relative',
        }}>
          {link.label}
          {hover && (
            <span style={{
              position: 'absolute', left: 0, right: 0, bottom: -2, height: 4,
              background: COLORS.green,
              boxShadow: `0 0 ${10*glow}px rgba(0,255,65,${0.7*glow})`,
            }} />
          )}
        </span>
        <span style={{ flex: 1 }} />
        {withSubBar && link.sub && (
          <span style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
            color: hover ? 'rgba(0,255,65,0.7)' : 'rgba(255,255,255,0.3)',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            transition: 'all .25s', textAlign: 'right', maxWidth: 380, alignSelf: 'flex-start', paddingTop: 14,
          }}>
            {link.sub.map(s => s.label).join(' · ')}
          </span>
        )}
      </a>
    </li>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT A · Photo split (refined original) — open by default
// ═══════════════════════════════════════════════════════════════════════════

function NavSplit({ glow, loggedIn }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0a0f08', color: '#e8efe2' }}>
      <TopBar glow={glow} loggedIn={loggedIn} isOpen onToggle={() => {}} transparent />
      <TopoBackground accent="green" glow={glow} />

      <div style={{
        position: 'absolute', top: 80, left: 0, right: 0, bottom: 0,
        display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 0,
      }}>
        {/* LEFT: photo grid */}
        <div style={{
          padding: '28px 20px 28px 28px',
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: '1fr 1fr',
          gap: 14, position: 'relative', zIndex: 2,
        }}>
          <PhotoTile kicker="LATEST DROP" title="DIVISION 2 · YEAR 6" tint="green" />
          <PhotoTile kicker="OPS RECAP" title="RAID NIGHT · 04.27" tint="cyan" />
          <PhotoTile kicker="STREAM CALENDAR" title="WEEK OF MAY 12" tint="green" />
          <PhotoTile kicker="OPERATIVE OF THE WEEK" title="MAVERICK_77" tint="magenta" />
        </div>

        {/* RIGHT: link list */}
        <div style={{
          padding: '28px 36px 24px 12px',
          display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2,
        }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10, letterSpacing: '0.3em',
            color: 'rgba(0,255,65,0.6)', marginBottom: 14,
          }}>// NAVIGATE THE BUNKER</div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {NAV.map((link, i) => (
              <GiantLinkRow key={link.label} link={link} idx={i} hover={hover===i} onHover={() => setHover(i)} glow={glow} />
            ))}
          </ul>

          <div style={{ flex: 1 }} />
          <BottomRail loggedIn={loggedIn} glow={glow} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT B · Centered minimal — single column, ultra-quiet
// ═══════════════════════════════════════════════════════════════════════════

function NavCentered({ glow, loggedIn }) {
  const [hover, setHover] = useState(null);
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#06090a', color: '#e8efe2' }}>
      <TopBar glow={glow} loggedIn={loggedIn} isOpen onToggle={() => {}} transparent />
      <TopoBackground accent="cyan" glow={glow} />

      <div style={{
        position: 'absolute', top: 80, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        padding: '28px 80px 24px',
        zIndex: 2,
      }}>
        {/* center mark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 16, marginBottom: 32 }}>
          <SkullMark size={84} glow={glow*1.6} />
          <div style={{ marginTop: 14 }}>
            <Wordmark size={14} glow={glow*0.5} />
          </div>
          <div style={{
            marginTop: 12, fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10, letterSpacing: '0.35em', color: 'rgba(0,255,255,0.65)',
          }}>// CASUAL OPS · ADULTS 25+</div>
        </div>

        {/* center link list */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {NAV.map((link, i) => (
            <li key={link.label}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ position: 'relative' }}>
              <a href={link.href} style={{
                display: 'flex', alignItems: 'baseline', gap: 20, textDecoration: 'none',
              }}>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
                  color: 'rgba(0,255,65,0.45)', letterSpacing: '0.15em',
                }}>0{i+1}/</span>
                <span style={{
                  fontFamily: '"Hanson Bold","Black Ops One",sans-serif',
                  fontSize: 64, lineHeight: 1, letterSpacing: '0.04em',
                  color: hover === i ? COLORS.green : 'rgba(232,239,226,0.85)',
                  transition: 'all .2s',
                  textShadow: hover === i && glow > 0
                    ? `0 0 ${24*glow}px rgba(0,255,65,${0.5*glow}), -2px 0 rgba(0,255,255,${0.5*glow}), 2px 0 rgba(255,0,255,${0.4*glow})`
                    : 'none',
                }}>{link.label}</span>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
                  color: hover === i ? 'rgba(0,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.18em', transition: 'color .2s',
                }}>{link.blurb}</span>
              </a>
              {/* sub-links — slide in from below on hover */}
              <div style={{
                overflow: 'hidden',
                maxHeight: hover === i ? 40 : 0,
                opacity: hover === i ? 1 : 0,
                transition: 'all .25s ease',
                marginTop: hover === i ? 6 : 0,
                paddingLeft: 50,
              }}>
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                  {link.sub.map(s => (
                    <a key={s.label} href={s.href} style={{
                      fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
                      color: 'rgba(255,255,255,0.55)', letterSpacing: '0.15em',
                      textTransform: 'uppercase', textDecoration: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 2,
                    }}>{s.label}</a>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div style={{ flex: 1 }} />
        <BottomRail loggedIn={loggedIn} glow={glow} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT C · Reactive sublinks — left list, sublinks fan right + hero photo
// ═══════════════════════════════════════════════════════════════════════════

function NavReactive({ glow, loggedIn }) {
  const [hover, setHover] = useState(0);
  const link = NAV[hover];

  // a “featured tile” per primary link
  const featured = [
    { kicker: 'LIVE NOW', title: 'OPS BRIEF · 41 ONLINE', tint: 'green' },
    { kicker: 'EDITOR\'S PICK', title: 'A FIELD GUIDE TO HEROIC RAIDS', tint: 'cyan' },
    { kicker: 'NEW MEMBER', title: 'WELCOME · TANGO_45', tint: 'magenta' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#080a07', color: '#e8efe2' }}>
      <TopBar glow={glow} loggedIn={loggedIn} isOpen onToggle={() => {}} transparent label="INDEX" />
      <TopoBackground accent="green" glow={glow*0.6} />

      <div style={{
        position: 'absolute', top: 80, left: 0, right: 0, bottom: 0,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, zIndex: 2,
      }}>
        {/* col 1: primary links */}
        <div style={{ padding: '36px 28px 24px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
            letterSpacing: '0.3em', color: 'rgba(0,255,65,0.6)', marginBottom: 18,
          }}>// INDEX · {String(NAV.length).padStart(2,'0')} ROUTES</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.map((l, i) => (
              <li key={l.label}
                  onMouseEnter={() => setHover(i)}
                  style={{
                    padding: '14px 0', cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
                    color: hover === i ? COLORS.green : 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.18em', alignSelf: 'flex-start', marginTop: 16,
                  }}>0{i+1}</span>
                  <a href={l.href} style={{
                    fontFamily: '"Hanson Bold","Black Ops One",sans-serif',
                    fontSize: 56, lineHeight: 0.95, letterSpacing: '0.03em',
                    color: hover === i ? '#fff' : 'rgba(232,239,226,0.45)',
                    textDecoration: 'none', transition: 'all .2s',
                    textShadow: hover === i && glow > 0
                      ? `0 0 ${20*glow}px rgba(0,255,65,${0.4*glow})` : 'none',
                  }}>{l.label}</a>
                </div>
                <div style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
                  color: hover === i ? 'rgba(0,255,255,0.7)' : 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  paddingLeft: 30, marginTop: 4, transition: 'color .2s',
                }}>{l.blurb}</div>
              </li>
            ))}
          </ul>

          <div style={{ flex: 1 }} />
        </div>

        {/* col 2: sublinks for hovered */}
        <div style={{ padding: '36px 28px 24px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
            letterSpacing: '0.3em', color: 'rgba(0,255,65,0.6)', marginBottom: 18,
          }}>// {link.label} / SUBROUTES</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {link.sub.map((s, i) => (
              <li key={s.label} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <a href={s.href} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 4px', textDecoration: 'none',
                  transition: 'all .15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,255,65,0.04)';
                  e.currentTarget.style.paddingLeft = '12px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.paddingLeft = '4px';
                }}>
                  <span style={{
                    fontFamily: '"Outfit", sans-serif', fontWeight: 500,
                    fontSize: 18, color: '#fff', letterSpacing: '0.02em',
                  }}>{s.label}</span>
                  <span style={{ color: COLORS.green }}><Icon.diag /></span>
                </a>
              </li>
            ))}
          </ul>
          <div style={{ flex: 1 }} />
        </div>

        {/* col 3: featured tile + bottom rail */}
        <div style={{ padding: '36px 28px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
            letterSpacing: '0.3em', color: 'rgba(0,255,65,0.6)', marginBottom: 18,
          }}>// FEATURED</div>
          <PhotoTile {...featured[hover]} size="lg" />
          <div style={{ flex: 1 }} />
        </div>

        {/* bottom rail spans all 3 cols */}
        <div style={{ gridColumn: '1 / -1', padding: '0 28px 24px' }}>
          <BottomRail loggedIn={loggedIn} glow={glow} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT D · Magazine — large photos, compact link rail at bottom
// ═══════════════════════════════════════════════════════════════════════════

function NavMagazine({ glow, loggedIn }) {
  const [hover, setHover] = useState(null);
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#070906', color: '#e8efe2' }}>
      <TopBar glow={glow} loggedIn={loggedIn} isOpen onToggle={() => {}} transparent />

      {/* Large hero area: oversized headline + collage */}
      <div style={{
        position: 'absolute', top: 80, left: 0, right: 0, bottom: 0,
        display: 'grid', gridTemplateRows: '1fr auto auto',
        padding: '24px 28px 22px', gap: 18, zIndex: 2,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, minHeight: 0 }}>
          {/* Large headline section */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            background: `linear-gradient(135deg, rgba(0,255,65,${0.12*glow + 0.08}) 0%, rgba(0,0,0,0.7) 70%),
                         repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 6px, rgba(255,255,255,0.05) 6px 12px)`,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '32px 32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
                color: 'rgba(0,255,65,0.7)', letterSpacing: '0.3em', marginBottom: 16,
              }}>// FEATURED · 05.10.2026</div>
              <div style={{
                fontFamily: '"Hanson Bold","Black Ops One",sans-serif',
                fontSize: 64, lineHeight: 0.92, letterSpacing: '0.02em', color: '#fff',
                textShadow: `-2px 0 rgba(0,255,255,${0.4*glow}), 2px 0 rgba(255,0,255,${0.3*glow})`,
                maxWidth: '90%',
              }}>WE HOLD<br/>THE LINE.<br/><span style={{ color: COLORS.green }}>TOGETHER.</span></div>
            </div>
            <div style={{
              fontFamily: '"Outfit", sans-serif', fontSize: 13,
              color: 'rgba(255,255,255,0.7)', maxWidth: 460, lineHeight: 1.5,
            }}>The Rogue Army is a casual gaming community for adults 25+. No drama, no toxicity — just operatives who actually have to be at work tomorrow.</div>
            <span style={{ position: 'absolute', top: 12, right: 12, width: 14, height: 14, borderTop: '1px solid rgba(0,255,65,0.5)', borderRight: '1px solid rgba(0,255,65,0.5)' }} />
            <span style={{ position: 'absolute', bottom: 12, left: 12, width: 14, height: 14, borderBottom: '1px solid rgba(0,255,65,0.5)', borderLeft: '1px solid rgba(0,255,65,0.5)' }} />
          </div>

          {/* photo column */}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 14 }}>
            <PhotoTile kicker="ON STREAM · LIVE" title="OPSDADDY · DIVISION 2" tint="magenta" />
            <PhotoTile kicker="LATEST DROP" title="HOW WE BEAT IRON HORSE" tint="cyan" />
          </div>
        </div>

        {/* Bottom rail of nav links — compact horizontal index */}
        <nav style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0, borderTop: '1px solid rgba(0,255,65,0.2)',
          paddingTop: 18, marginTop: 4,
        }}
        onMouseLeave={() => setHover(null)}>
          {NAV.map((l, i) => (
            <a key={l.label} href={l.href}
               onMouseEnter={() => setHover(i)}
               style={{
              display: 'flex', flexDirection: 'column', gap: 8,
              padding: '4px 18px', textDecoration: 'none',
              borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
                  color: 'rgba(0,255,65,0.5)', letterSpacing: '0.2em',
                }}>0{i+1}</span>
                <span style={{
                  fontFamily: '"Hanson Bold","Black Ops One",sans-serif',
                  fontSize: 38, lineHeight: 1, letterSpacing: '0.04em',
                  color: hover === i ? COLORS.green : '#fff',
                  transition: 'color .2s',
                  textShadow: hover === i && glow > 0
                    ? `0 0 ${16*glow}px rgba(0,255,65,${0.5*glow})` : 'none',
                }}>{l.label}</span>
              </div>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '6px 12px',
                fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
                letterSpacing: '0.15em', textTransform: 'uppercase',
              }}>
                {l.sub.map(s => (
                  <span key={s.label} style={{ color: hover === i ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)', transition: 'color .2s' }}>
                    {s.label}
                  </span>
                ))}
              </div>
              {hover === i && (
                <span style={{
                  position: 'absolute', top: -19, left: 0, right: 0, height: 2,
                  background: COLORS.green,
                  boxShadow: `0 0 ${10*glow}px rgba(0,255,65,${0.6*glow})`,
                }} />
              )}
            </a>
          ))}
        </nav>

        {/* Bottom rail */}
        <BottomRail loggedIn={loggedIn} glow={glow} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CLOSED state — small landing context to show entry point
// ═══════════════════════════════════════════════════════════════════════════

function NavClosed({ glow, loggedIn }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#030303', overflow: 'hidden' }}>
      {/* Pretend hero behind */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 70% 50% at 80% 30%, rgba(0,255,65,${0.15*glow + 0.06}) 0%, transparent 60%)`,
      }} />
      <TopBar glow={glow} loggedIn={loggedIn} isOpen={false} onToggle={() => {}} transparent />
      <div style={{
        position: 'absolute', left: 28, right: 28, top: 140,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
          color: 'rgba(0,255,65,0.55)', letterSpacing: '0.3em',
        }}>// HOMEPAGE · HERO BEHIND</div>
        <div style={{
          marginTop: 20,
          fontFamily: '"Hanson Bold","Black Ops One",sans-serif',
          fontSize: 130, lineHeight: 0.88, letterSpacing: '0.02em', color: '#fff',
          textShadow: `-3px 0 rgba(0,255,255,${0.3*glow}), 3px 0 rgba(255,0,255,${0.25*glow})`,
        }}>ROGUE<br/><span style={{ color: COLORS.green, textShadow: `0 0 ${30*glow}px rgba(0,255,65,${0.5*glow})` }}>ARMY</span></div>
        <div style={{
          marginTop: 24, fontFamily: '"Outfit", sans-serif',
          fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 420,
        }}>Casual gaming community for adults 25+. Click <strong style={{ color: COLORS.green }}>MENU</strong> top-right to navigate.</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  NavSplit, NavCentered, NavReactive, NavMagazine, NavClosed,
});
