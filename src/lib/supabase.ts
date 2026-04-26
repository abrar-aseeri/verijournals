import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export function createSupabaseBrowser() {
  return createBrowserClient(url, anon)
}

export function getAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(url, key)
}

export const supabaseAdmin = {
  from: (table: string) => getAdmin().from(table),
}
