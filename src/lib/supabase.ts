import { createClient } from "@supabase/supabase-js";

// Public read-only client. The publishable key is safe in the browser:
// RLS is enabled and only allows SELECT for the public roles.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
