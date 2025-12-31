import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export const createClient = () => {
  const cookieStore = {
    getAll() {
      return cookies().getAll()
    },
    setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookies().set(name, value, options)
        )
      } catch {
        // The `setAll` method was called from a Server Component.
        // You can safely ignore this error.
      }
    },
  }

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: cookieStore,
  })
}
