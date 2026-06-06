import type { Access, FieldAccess } from 'payload'

/**
 * Public read — everyone, including anonymous traffic.
 *
 * Use for collections/globals whose data is part of the public site contract
 * (articles, topics, games, brand-level CMS chrome). Field-level read can
 * still narrow specific fields.
 */
export const publicRead: Access = () => true

/**
 * Admin-only — any authenticated Payload user (the `users` collection IS
 * the admin collection in this project; members auth via a separate cookie
 * flow and never get a `req.user`).
 *
 * Use for collection-level CRUD gates on internal data (members, bookmarks,
 * read-progress) and for global updates.
 */
export const adminOnly: Access = ({ req: { user } }) => Boolean(user)

/**
 * Member-only field gate — same predicate as `adminOnly` but typed for the
 * field-access slot (`FieldAccess`). Use to hide individual fields from
 * unauthenticated REST/GraphQL hits even on otherwise-public collections.
 *
 * Belt-and-suspenders alongside page-level filtering; direct API hits on
 * `/api/{collection}` would otherwise expose these fields.
 */
export const memberOnly: FieldAccess = ({ req: { user } }) => Boolean(user)
