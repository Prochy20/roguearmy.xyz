/**
 * Shared types for the role-gate system. Lives in its own file (no
 * `server-only`) so client components can import the type without pulling
 * in Payload/server modules.
 */

export type GateState = 'anonymous' | 'denied' | 'allowed' | 'unconfigured'

/** Settings field keys that drive role gates. Extend as new gated features land. */
export type RoleGateKey = 'division2Role'

/** Map shape used by the client AuthContext and the NavCenteredStack filter. */
export type RoleGateMap = Partial<Record<RoleGateKey, GateState>>
