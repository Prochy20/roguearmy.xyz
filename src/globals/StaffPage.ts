import type { GlobalConfig } from 'payload'

/**
 * Build a minimal Lexical document containing a single paragraph of plain
 * text. Used to seed FAQ answer defaults — once an editor opens the FAQ
 * answer they get the full Lexical toolbar and can add formatting on top.
 */
function paragraph(text: string) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          textFormat: 0,
          textStyle: '',
          children: [
            {
              mode: 'normal',
              text,
              type: 'text',
              style: '',
              detail: 0,
              format: 0,
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

const TONE_OPTIONS = [
  { label: 'Cyan', value: 'cyan' },
  { label: 'Green', value: 'green' },
  { label: 'Magenta', value: 'magenta' },
] as const

const SEVERITY_OPTIONS = [
  { label: 'Urgent', value: 'urgent' },
  { label: 'Formal', value: 'formal' },
  { label: 'Casual', value: 'casual' },
  { label: 'Social', value: 'social' },
] as const

const ICON_OPTIONS = [
  { label: 'Ticket', value: 'ticket' },
  { label: 'Message Circle (DM)', value: 'message-circle' },
  { label: 'At Sign (Tag)', value: 'at-sign' },
  { label: 'Mail', value: 'mail' },
  { label: 'Globe', value: 'globe' },
  { label: 'Phone', value: 'phone' },
] as const

/**
 * All the editorial copy + structural lists for the /community/staff page.
 * The operative roster lives in the StaffProfiles collection — this global
 * owns everything else: section headers, lane cards, FAQ entries, ground
 * rules, end strip, ticket channel link, SEO. Every field carries a
 * defaultValue matching today's hardcoded copy so the page renders
 * correctly on first deploy without anyone touching the admin.
 */
export const StaffPage: GlobalConfig = {
  slug: 'staff-page',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
    description: 'All copy + content for the /community/staff page. Roster operatives live in the Staff Profiles collection.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─── MANIFEST HEADER ───────────────────────────────────────────────
        {
          name: 'manifest',
          label: 'Manifest Header',
          fields: [
            {
              name: 'kicker',
              type: 'text',
              defaultValue: '// PERSONNEL MANIFEST · ROGUE ARMY',
              admin: { description: 'Small mono kicker above the headline.' },
            },
            {
              name: 'preLine',
              type: 'text',
              defaultValue: 'WHO',
              admin: { description: 'First word of the three-stanza headline.' },
            },
            {
              name: 'midLine',
              type: 'text',
              defaultValue: 'HOLDS',
              admin: { description: 'Middle word of the headline — rendered in cyan with extra glow.' },
            },
            {
              name: 'postLine',
              type: 'text',
              defaultValue: 'THE LINE',
              admin: { description: 'Last line of the headline.' },
            },
            {
              name: 'sublineLead',
              type: 'textarea',
              defaultValue:
                'Volunteer-run. No payroll, no titles you negotiate for, no algorithm sorting these names. The people below answer the DMs, write the rules, kill the bots, and keep the lights on when the chat gets weird.',
              admin: { description: 'Intro paragraph shown to everyone, under the headline.' },
            },
            {
              name: 'sublineMember',
              type: 'textarea',
              defaultValue:
                'You are signed in — direct lines and call signs are visible below. Don’t spam them. They have day jobs.',
              admin: { description: 'Additional paragraph shown only to signed-in members.' },
            },
          ],
        },

        // ─── ROSTER SECTION ────────────────────────────────────────────────
        {
          name: 'roster',
          label: 'Roster Section',
          fields: [
            {
              name: 'sectionEyebrow',
              type: 'text',
              defaultValue: 'OPERATIVES',
              admin: { description: 'Mono label next to the SEC_01 marker.' },
            },
            {
              name: 'sectionTitle',
              type: 'text',
              defaultValue: 'THE CORE',
              admin: { description: 'Display title of the roster section.' },
            },
            {
              name: 'kickerPublic',
              type: 'text',
              defaultValue: '// PUBLIC DOSSIER · DIRECT LINES REDACTED',
              admin: { description: 'Kicker shown to public visitors above the roster.' },
            },
            {
              name: 'kickerMember',
              type: 'text',
              defaultValue: '// CLEARANCE GRANTED · DIRECT LINES VISIBLE',
              admin: { description: 'Kicker shown to signed-in members above the roster.' },
            },
          ],
        },

        // ─── PROTOCOL SECTION (intro + contact lanes) ──────────────────────
        {
          name: 'protocol',
          label: 'Protocol · Lanes',
          fields: [
            {
              name: 'sectionEyebrow',
              type: 'text',
              defaultValue: 'PROTOCOL',
              admin: { description: 'Mono label next to the SEC_02 marker.' },
            },
            {
              name: 'sectionKicker',
              type: 'text',
              defaultValue: '// REACHING THE LINE · YOUR CALL HOW',
              admin: { description: 'Kicker under the section eyebrow.' },
            },
            {
              name: 'sectionTitle',
              type: 'text',
              defaultValue: 'HOW TO HIT US UP',
              admin: { description: 'Display title of the protocol section.' },
            },
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                'We’re volunteer-run. Most of us answer in hours, not minutes — we have day jobs and the chat does not run our lives. Tickets, DMs, public tags — they all reach the same handful of people. Pick whichever feels right.',
              admin: { description: 'Intro paragraph above the three lanes panel.' },
            },
            {
              name: 'lanesEyebrow',
              type: 'text',
              defaultValue: '// THREE LANES · ALL REACH THE SAME PEOPLE · YOUR CALL',
              admin: { description: 'Mono label above the lane cards grid.' },
            },
            {
              name: 'lanes',
              type: 'array',
              minRows: 1,
              maxRows: 6,
              defaultValue: [
                {
                  tone: 'cyan',
                  iconKey: 'ticket',
                  toneLabel: 'FORMAL',
                  title: 'TICKETS',
                  hint: '#open-a-ticket',
                  body: 'Drop into #open-a-ticket in Discord — there’s a button at the top that opens a private thread with the on-call moderator. Use this when something needs a paper trail: bans, appeals, harassment reports, account issues. The log persists, and the public mod-log gets a summary once it’s resolved.',
                  href: 'https://discord.com/channels/@me',
                  ctaLabel: 'OPEN CHANNEL',
                },
                {
                  tone: 'green',
                  iconKey: 'message-circle',
                  toneLabel: 'DIRECT',
                  title: 'DM US',
                  hint: '@handle',
                  body: 'Slide into the DMs of any operative on the roster above. When you’re signed in, the handles are right there on each card. No paperwork, no thread, just a person. If they’re asleep, someone else is awake.',
                  href: '',
                  ctaLabel: '',
                },
                {
                  tone: 'magenta',
                  iconKey: 'at-sign',
                  toneLabel: 'PUBLIC',
                  title: 'TAG IN CHAT',
                  hint: '@operative',
                  body: 'There’s no group role to ping — pick anyone from the roster above and tag them by name in a public channel. Wider visibility than a DM: the question lands where the chat can see it, and a backup operative can pick it up if the first one is asleep. Loud by design.',
                  href: '',
                  ctaLabel: '',
                },
              ],
              admin: {
                description: 'Contact lanes shown side-by-side. Three by default — Tickets / DM / Tag. Add more if you grow new channels.',
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'tone',
                      type: 'select',
                      required: true,
                      defaultValue: 'cyan',
                      options: [...TONE_OPTIONS],
                      admin: { width: '50%' },
                    },
                    {
                      name: 'iconKey',
                      type: 'select',
                      required: true,
                      defaultValue: 'ticket',
                      options: [...ICON_OPTIONS],
                      admin: { width: '50%', description: 'Icon shown in the lane card.' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'toneLabel',
                      type: 'text',
                      required: true,
                      admin: { width: '50%', description: 'Mono label at the top of the card (e.g. "FORMAL").' },
                    },
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      admin: { width: '50%', description: 'Display title (e.g. "TICKETS").' },
                    },
                  ],
                },
                {
                  name: 'hint',
                  type: 'text',
                  required: true,
                  admin: { description: 'Short mono channel reference (e.g. "#open-a-ticket", "@handle").' },
                },
                {
                  name: 'body',
                  type: 'textarea',
                  required: true,
                  admin: { description: 'Body paragraph explaining when to use this lane.' },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'href',
                      type: 'text',
                      admin: { width: '70%', description: 'Optional outbound URL. When set, the lane gets an "OPEN CHANNEL" CTA pill at the bottom.' },
                    },
                    {
                      name: 'ctaLabel',
                      type: 'text',
                      admin: { width: '30%', description: 'CTA pill label. Defaults to "OPEN CHANNEL" if blank.' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ─── FAQ (its own top-level tab for visibility) ────────────────────
        {
          name: 'faq',
          label: 'FAQ',
          fields: [
            {
              name: 'heading',
              type: 'text',
              defaultValue: '// FREQUENTLY ASKED',
              admin: { description: 'Mono heading above the FAQ grid.' },
            },
            {
              name: 'entries',
              type: 'array',
              minRows: 1,
              defaultValue: [
                {
                  severity: 'urgent',
                  question: 'Something is happening right now — raid, harassment, doxxing?',
                  answer: paragraph(
                    'Tag the closest operative by name in the channel where it’s happening. They’ll lock the channel or mute the offender within minutes, then sort the rest in a thread. Don’t DM in this case — a public ping lets a backup operative pick up if the first one is asleep, and it gives the wider chat the signal that staff has eyes on it.',
                  ),
                  channel: 'Tag any operative by name in chat',
                  channelHint: '@operative',
                  response: 'Minutes',
                },
                {
                  severity: 'formal',
                  question: 'Want to appeal a ban or sort an account issue?',
                  answer: paragraph(
                    'Open a ticket in #open-a-ticket. The on-call moderator reviews it, asks for context if needed, and replies in the same thread within a few hours. Decisions are documented in the public mod-log when they’re final, so the rationale stays visible to the rest of the community even after the thread closes.',
                  ),
                  channel: 'Open a ticket',
                  channelHint: '#open-a-ticket',
                  response: 'Hours · paper trail',
                },
                {
                  severity: 'formal',
                  question: 'Got a harassment report or DM screenshots to share?',
                  answer: paragraph(
                    'A ticket is the right call — the screenshots and timeline get a paper trail and only the on-call moderator sees them. If the situation feels too sensitive even for that, DM any of us directly and we’ll handle it from there. Either way, the public mod-log only ever gets a summary of the resolution, never names or screenshots.',
                  ),
                  channel: 'Open a ticket · or DM any mod',
                  channelHint: '#open-a-ticket',
                  response: 'Hours · public mod-log',
                },
                {
                  severity: 'casual',
                  question: 'Just have a quick question or stuck on something?',
                  answer: paragraph(
                    'Ask in #help first — half the time another member knows the answer faster than a moderator would. If the channel goes quiet, ping or DM any operative on the roster above. We’re not customer support for individual games, but for anything community-specific (roles, channels, conventions, the bots) we’re the right line.',
                  ),
                  channel: 'Ask in #help · or DM any of us',
                  channelHint: '#help',
                  response: 'Ad-hoc · community-answered',
                },
                {
                  severity: 'casual',
                  question: 'Need a game role or want to opt into a group?',
                  answer: paragraph(
                    'Head to #help-roles — there’s a reaction-based menu that gives you the right roles automatically based on the games you play. If the menu’s broken or doesn’t list the game you want, ping any operative and we’ll add it. Adding a brand-new game group needs at least three regulars interested, so bring friends if you’re proposing something fresh.',
                  ),
                  channel: 'Self-serve in #help-roles',
                  channelHint: '#help-roles',
                  response: 'Self-serve · or ask a mod',
                },
                {
                  severity: 'social',
                  question: 'New here and just want to say hi?',
                  answer: paragraph(
                    'Drop a quick intro in #intros — display name, timezone, the games you play. That’s the whole onboarding. People do react and reply, but there’s no checklist, no quiz, and no minimum word count. The intro just helps regulars know who you are when you show up in a voice channel later.',
                  ),
                  channel: 'Drop a line in #intros',
                  channelHint: '#intros',
                  response: 'Whenever',
                },
              ],
              admin: {
                description: 'FAQ entries rendered as a 2-column grid of cards. Reorder with the drag handle; ordering controls render order.',
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'severity',
                  type: 'select',
                  required: true,
                  defaultValue: 'formal',
                  options: [...SEVERITY_OPTIONS],
                  admin: { description: 'Colour-codes the severity dot + label.' },
                },
                {
                  name: 'question',
                  type: 'text',
                  required: true,
                  admin: { description: 'The question, phrased in the visitor’s voice.' },
                },
                {
                  name: 'answer',
                  type: 'richText',
                  required: true,
                  admin: {
                    description:
                      'Substantive answer. Uses the project rich text editor — bold, italic, links, lists, etc.',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'channel',
                      type: 'text',
                      required: true,
                      admin: { width: '60%', description: 'Channel description (e.g. "Open a ticket").' },
                    },
                    {
                      name: 'channelHint',
                      type: 'text',
                      required: true,
                      admin: { width: '40%', description: 'Mono channel reference (e.g. "#help").' },
                    },
                  ],
                },
                {
                  name: 'href',
                  type: 'text',
                  admin: {
                    description:
                      'Optional outbound URL. When set, the channel pill renders as a clickable button with hover/external-link affordances. When blank, it renders as a read-only chip preceded by the leading arrow.',
                  },
                },
                {
                  name: 'response',
                  type: 'text',
                  required: true,
                  admin: { description: 'Response time expectation (e.g. "Minutes", "Hours · paper trail").' },
                },
              ],
            },
            {
              name: 'groundRulesLabel',
              type: 'text',
              defaultValue: '// GROUND RULES',
              admin: { description: 'Mono label next to the warning icon in the ground rules strip below the FAQ.' },
            },
            {
              name: 'groundRules',
              type: 'array',
              minRows: 0,
              defaultValue: [
                { tone: 'green', label: 'YOUR CALL · WHATEVER FITS' },
                { tone: 'cyan', label: 'ONE TICKET · ONE INCIDENT' },
                { tone: 'magenta', label: "DON'T @EVERYONE UNLESS ON FIRE" },
                { tone: 'green', label: 'WE HAVE DAY JOBS' },
              ],
              admin: {
                description: 'Short pills shown below the FAQ grid, closing out the protocol section.',
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'tone',
                      type: 'select',
                      required: true,
                      defaultValue: 'cyan',
                      options: [...TONE_OPTIONS],
                      admin: { width: '30%' },
                    },
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      admin: { width: '70%' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ─── END STRIP ─────────────────────────────────────────────────────
        {
          name: 'endStrip',
          label: 'End Strip',
          fields: [
            {
              name: 'backLinkLabel',
              type: 'text',
              defaultValue: 'RETURN · COMMUNITY',
              admin: { description: 'Label on the back-link to /community.' },
            },
            {
              name: 'endLabel',
              type: 'text',
              defaultValue: '// END_OF_MANIFEST',
              admin: { description: 'Mono closing tag in the end strip.' },
            },
            {
              name: 'compiledLabel',
              type: 'text',
              defaultValue: 'COMPILED',
              admin: { description: 'Prefix before the compiled timestamp (e.g. "COMPILED · 14:32 UTC · 16 MAY").' },
            },
          ],
        },

        // ─── EMPTY STATE ───────────────────────────────────────────────────
        {
          name: 'emptyState',
          label: 'Empty State',
          fields: [
            {
              name: 'pill',
              type: 'text',
              defaultValue: '// NO RECORDS ON FILE',
            },
            {
              name: 'heading',
              type: 'text',
              defaultValue: 'MANIFEST PENDING COMPILATION',
            },
            {
              name: 'body',
              type: 'textarea',
              defaultValue:
                'The roster sync is currently empty. New dossiers will appear here once the next cache refresh writes them. If this persists past the next visit, ping the moderators.',
            },
            {
              name: 'hint',
              type: 'text',
              defaultValue: '// RETRY · NEXT CACHE TICK',
            },
          ],
        },

        // ─── SEO ───────────────────────────────────────────────────────────
        {
          name: 'seo',
          label: 'SEO',
          fields: [
            {
              name: 'title',
              type: 'text',
              defaultValue: 'The Core — Personnel Manifest | Rogue Army',
            },
            {
              name: 'description',
              type: 'textarea',
              defaultValue:
                'The volunteer-run staff of Rogue Army — the people who answer DMs, write the rules, kill the bots, and keep the lights on.',
            },
          ],
        },
      ],
    },
  ],
}
