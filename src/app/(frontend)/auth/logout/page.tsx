import { redirect } from 'next/navigation'

export default async function LogoutPage() {
  // Redirect to the API route which handles cookie clearing
  redirect('/api/auth/logout')
}
