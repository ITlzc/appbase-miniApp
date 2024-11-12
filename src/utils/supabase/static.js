import { createClient as createClientPrimitive } from '@supabase/supabase-js'

import {supabaseUrl,supabaseKey} from './config'

export function createClient() {
  const supabase = createClientPrimitive(
    supabaseUrl,
    supabaseKey
  )

  return supabase
}