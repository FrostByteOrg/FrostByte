  import { createClient } from '@supabase/supabase-js'

  //TODO: replace hardcoded values with values from .env, found in supabase console
  export const supabase = createClient('https://<project>.supabase.co', '<your-anon-key>')