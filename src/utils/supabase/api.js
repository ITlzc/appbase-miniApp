import { createServerClient, serializeCookieHeader } from '@supabase/ssr'
// import { type NextApiRequest, type NextApiResponse } from 'next'

import {supabaseUrl,supabaseKey} from './config'

export default function createClient(req, res) {
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({ name, value: req.cookies[name] || '' }))
        },
        setAll(cookiesToSet) {
          res.setHeader(
            'Set-Cookie',
            cookiesToSet.map(({ name, value, options }) =>
              serializeCookieHeader(name, value, options)
            )
          )
        },
      },
    }
  )

  return supabase
}