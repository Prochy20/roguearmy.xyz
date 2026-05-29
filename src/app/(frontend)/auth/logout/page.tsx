import { redirect } from 'next/navigation'
import { performLogout } from '@/lib/auth/logout'

// Page-rendered logout — safe for the nav menu / bookmarks to link to. The
// API route is POST-only now, so this page is the user-facing entry for
// "log me out by clicking a link" flows. Calls performLogout directly to
// avoid an HTTP self-call to /api/auth/logout.
export default async function LogoutPage() {
  await performLogout()
  redirect('/')
}
